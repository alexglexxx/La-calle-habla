import crypto from "node:crypto";
import {
  loadReportIntakeSessions,
  saveReportIntakeSessions
} from "./runtime-report-store.mjs";
import {
  createReport,
  listReports,
  PRIVACY_NOTICE_VERSION,
  updateRuntimeReportFields
} from "./report-service.mjs";

export const INTAKE_LIMITS = {
  sessionTtlMinutes: 15,
  descriptionWindowMinutes: 10,
  maxReportsPerHour: 3,
  maxReportsPerDay: 10,
  processedMessageRetentionHours: 24,
  maxImageBytes: 5 * 1024 * 1024,
  maxLocationTextLength: 240,
  maxDescriptionLength: 500,
  geoClusterRadiusMeters: 150
};

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const COMPLETION_TEXT = "Listo, recibimos tu reporte. Gracias por ayudar a que la calle hable.";
const OFFICIAL_LIMIT_TEXT =
  "Se registró para revisión interna. Esto no representa una denuncia oficial ni garantiza su resolución.";
const RATE_LIMIT_TEXT = "Ya recibimos varios reportes desde esta cuenta. Espera un poco antes de enviar otro.";
const EMERGENCY_TEXT = "Si existe peligro inmediato, comunícate con los servicios de emergencia correspondientes.";

function nowMs(iso) {
  return new Date(iso).getTime();
}

function minutesFrom(iso, minutes) {
  return new Date(nowMs(iso) + minutes * 60 * 1000).toISOString();
}

function hoursAgo(now, hours) {
  return nowMs(now) - hours * 60 * 60 * 1000;
}

function shortAlias(phoneId) {
  return `Ciudadano anónimo · ${phoneId.slice(0, 4)}`;
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSender(senderReference) {
  const value = cleanString(senderReference);

  if (!value) {
    throw new Error("senderReference is required.");
  }

  return value.replace(/[^\d+]/g, "");
}

function getReporterSecret(options = {}) {
  const secret = options.reporterIdSecret || process.env.REPORTER_ID_SECRET;

  if (!secret || typeof secret !== "string" || secret.length < 12) {
    throw new Error("REPORTER_ID_SECRET is required for anonymous intake.");
  }

  return secret;
}

export function generatePhoneId(senderReference, options = {}) {
  const secret = getReporterSecret(options);
  const normalizedSender = normalizeSender(senderReference);

  return crypto
    .createHmac("sha256", secret)
    .update(normalizedSender)
    .digest("hex");
}

function reply(text, quickActions = []) {
  return {
    type: "text",
    text,
    ...(quickActions.length > 0 ? { quickActions } : {})
  };
}

function privacyReply() {
  return reply(
    "Al continuar, aceptas que guardemos la foto y ubicación para revisar este reporte. No somos una dependencia de gobierno.",
    [{ id: "continue_anonymous", label: "Continuar anónimo" }]
  );
}

function needsPhotoReply() {
  return reply("Ahora envía una foto del problema.");
}

function needsLocationReply() {
  return reply("Comparte la ubicación o escribe la calle, cruce, colonia o una referencia.");
}

function completionReply() {
  return reply(`${COMPLETION_TEXT}\n${OFFICIAL_LIMIT_TEXT}\nListo. Si quieres, puedes enviar un detalle adicional.`);
}

function rateLimitReply() {
  return reply(`${RATE_LIMIT_TEXT}\n${EMERGENCY_TEXT}`);
}

function validateBaseMessage(message) {
  const errors = [];

  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return ["Message must be an object."];
  }

  for (const field of ["provider", "senderReference", "messageId", "timestamp", "type"]) {
    if (!cleanString(message[field])) {
      errors.push(`${field} is required.`);
    }
  }

  if (!["action", "image", "location", "text"].includes(message.type)) {
    errors.push("type is not supported.");
  }

  return errors;
}

function validateImage(image = {}) {
  const errors = [];
  const mediaId = cleanString(image.mediaId);
  const mimeType = cleanString(image.mimeType).toLowerCase();
  const sizeBytes = image.sizeBytes === undefined ? 0 : image.sizeBytes;

  if (!mediaId || mediaId.includes("/") || mediaId.includes("\\") || mediaId.includes("..")) {
    errors.push("image.mediaId must be a safe provider media reference.");
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    errors.push("image.mimeType must be image/jpeg, image/png or image/webp.");
  }

  if (!Number.isInteger(sizeBytes) || sizeBytes < 0 || sizeBytes > INTAKE_LIMITS.maxImageBytes) {
    errors.push(`image.sizeBytes must be ${INTAKE_LIMITS.maxImageBytes} bytes or fewer.`);
  }

  return errors;
}

function validateLocation(location = {}) {
  const errors = [];
  const latitude = location.latitude;
  const longitude = location.longitude;
  const name = cleanString(location.name);
  const address = cleanString(location.address);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    errors.push("location.latitude must be a finite number from -90 to 90.");
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    errors.push("location.longitude must be a finite number from -180 to 180.");
  }

  if (name.length > 120) {
    errors.push("location.name must be 120 characters or fewer.");
  }

  if (address.length > 240) {
    errors.push("location.address must be 240 characters or fewer.");
  }

  return errors;
}

function validateText(text) {
  const value = cleanString(text);

  if (!value) {
    return ["text.body is required."];
  }

  if (value.length > INTAKE_LIMITS.maxLocationTextLength) {
    return [`text.body must be ${INTAKE_LIMITS.maxLocationTextLength} characters or fewer.`];
  }

  return [];
}

function processedMessages(session, now) {
  const cutoff = hoursAgo(now, INTAKE_LIMITS.processedMessageRetentionHours);
  return (session.processedMessages || []).filter((item) => nowMs(item.processedAt) >= cutoff);
}

function findProcessedMessage(session, messageId, now) {
  return processedMessages(session, now).find((item) => item.messageId === messageId) || null;
}

function rememberMessage(session, message, response, now) {
  const messages = processedMessages(session, now).filter((item) => item.messageId !== message.messageId);
  session.processedMessages = [
    ...messages,
    {
      messageId: message.messageId,
      processedAt: now,
      reply: response.reply,
      reportId: response.report?.id || null
    }
  ];
}

function cleanupSessions(sessions, now) {
  return sessions.filter((session) => {
    if (session.state !== "completed" && session.expiresAt && nowMs(session.expiresAt) < nowMs(now)) {
      return false;
    }

    session.processedMessages = processedMessages(session, now);
    session.completedReportTimestamps = (session.completedReportTimestamps || []).filter(
      (timestamp) => nowMs(timestamp) >= hoursAgo(now, 24)
    );

    return true;
  });
}

function completedCount(session, now, hours) {
  const cutoff = hoursAgo(now, hours);
  return (session.completedReportTimestamps || []).filter((timestamp) => nowMs(timestamp) >= cutoff).length;
}

function rateLimited(session, now) {
  return (
    completedCount(session, now, 1) >= INTAKE_LIMITS.maxReportsPerHour ||
    completedCount(session, now, 24) >= INTAKE_LIMITS.maxReportsPerDay
  );
}

function baseSession(phoneId, now) {
  return {
    phoneId,
    state: "awaiting_privacy",
    startedAt: now,
    updatedAt: now,
    expiresAt: minutesFrom(now, INTAKE_LIMITS.sessionTtlMinutes),
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    privacyAcknowledgedAt: null,
    photoReference: null,
    location: null,
    optionalDescription: null,
    reportId: null,
    descriptionWindowUntil: null,
    processedMessages: [],
    completedReportTimestamps: []
  };
}

export function normalizeReference(value) {
  const cleaned = cleanString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.,;:()#]/g, " ")
    .replace(/\bavenida\b/g, "av")
    .replace(/\bav\.\b/g, "av")
    .replace(/\bcalle\b/g, "c")
    .replace(/\bc\.\b/g, "c")
    .replace(/\bcarretera\b/g, "carr")
    .replace(/\bcarr\.\b/g, "carr")
    .replace(/\bcolonia\b/g, "col")
    .replace(/\bcol\.\b/g, "col")
    .replace(/\b(esquina|cruce|con|y)\b/g, " & ")
    .replace(/\b(frente a|cerca de|junto a|atras de|atrás de)\b/g, " ref ")
    .replace(/\s+/g, " ")
    .trim();

  const parts = cleaned
    .split("&")
    .map((part) => part.trim().replace(/^(av|c|carr|col)\s+/, ""))
    .filter(Boolean);

  if (parts.length === 2) {
    return parts.sort().join(" & ");
  }

  return cleaned.replace(/^(av|c|carr|col)\s+/, "");
}

export function haversineMeters(left, right) {
  const earthRadiusMeters = 6371000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(right.latitude - left.latitude);
  const deltaLng = toRadians(right.longitude - left.longitude);
  const lat1 = toRadians(left.latitude);
  const lat2 = toRadians(right.latitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function coordinateCenter(points) {
  const total = points.reduce(
    (accumulator, point) => ({
      latitude: accumulator.latitude + point.latitude,
      longitude: accumulator.longitude + point.longitude
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: total.latitude / points.length,
    longitude: total.longitude / points.length
  };
}

export function groupNearbyPoints(points, radiusMeters = INTAKE_LIMITS.geoClusterRadiusMeters) {
  const groups = [];

  for (const point of points) {
    const group = groups.find((candidate) => {
      const center = coordinateCenter(candidate);
      return haversineMeters(center, point) <= radiusMeters;
    });

    if (group) {
      group.push(point);
    } else {
      groups.push([point]);
    }
  }

  return groups.map((pointsInGroup) => ({
    points: pointsInGroup,
    center: coordinateCenter(pointsInGroup),
    count: pointsInGroup.length
  }));
}

function geocodedReports() {
  return listReports()
    .map((report) => ({
      report,
      location: report.locationDetails
    }))
    .filter(({ location }) => {
      return (
        Number.isFinite(location?.latitude) &&
        Number.isFinite(location?.longitude) &&
        isInsideTerritory(location.latitude, location.longitude)
      );
    });
}

export function resolveWrittenLocation(reference) {
  const originalReference = cleanString(reference);
  const normalizedReference = normalizeReference(originalReference);
  const candidates = geocodedReports().filter(({ location, report }) => {
    const candidateReference = location.normalizedReference || normalizeReference(report.locationText);
    return candidateReference === normalizedReference;
  });
  const points = candidates.map(({ location }) => ({
    latitude: location.latitude,
    longitude: location.longitude
  }));

  if (points.length >= 2) {
    const groups = groupNearbyPoints(points);
    const largestGroup = groups.sort((left, right) => right.count - left.count)[0];
    const contradictory = groups.length > 1 && groups.some((group) => group.count >= 1);

    if (
      largestGroup.count >= 2 &&
      !contradictory &&
      largestGroup.points.every((point) => {
        return haversineMeters(largestGroup.center, point) <= INTAKE_LIMITS.geoClusterRadiusMeters;
      })
    ) {
      return {
        source: "inferred_from_reports",
        originalReference,
        normalizedReference,
        latitude: largestGroup.center.latitude,
        longitude: largestGroup.center.longitude,
        resolutionStatus: "inferred",
        confidence: "high",
        resolvedAt: new Date().toISOString(),
        resolutionMethod: "normalized_reference_cluster",
        supportingReportCount: largestGroup.count
      };
    }

    return {
      source: "written_reference",
      originalReference,
      normalizedReference,
      resolutionStatus: "pending",
      confidence: "low",
      resolutionMethod: "contradictory_candidates",
      supportingReportCount: candidates.length
    };
  }

  if (points.length === 1) {
    return {
      source: "written_reference",
      originalReference,
      normalizedReference,
      resolutionStatus: "pending",
      confidence: "low",
      resolutionMethod: "single_candidate_not_enough",
      supportingReportCount: 1
    };
  }

  return {
    source: "written_reference",
    originalReference,
    normalizedReference,
    resolutionStatus: "pending",
    confidence: "unknown",
    resolutionMethod: "no_local_candidates",
    supportingReportCount: 0
  };
}

function imageReference(message) {
  return {
    mediaId: cleanString(message.image.mediaId),
    messageId: message.messageId,
    mimeType: cleanString(message.image.mimeType).toLowerCase(),
    sizeBytes: message.image.sizeBytes || 0,
    receivedAt: message.timestamp
  };
}

function sharedLocation(message) {
  const name = cleanString(message.location.name);
  const address = cleanString(message.location.address);
  const originalReference = [name, address].filter(Boolean).join(" · ");
  const validation = validateTerritoryLocation(message.location);

  if (!validation.ok) {
    return {
      ok: false,
      code: validation.code,
      message: validation.message
    };
  }

  return {
    ok: true,
    location: {
      source: "whatsapp_shared",
      originalReference: originalReference || "Ubicación compartida por WhatsApp",
      normalizedReference: normalizeReference(name || address || "ubicacion compartida"),
      latitude: validation.latitude,
      longitude: validation.longitude,
      resolutionStatus: "exact",
      confidence: "high",
      resolvedAt: message.timestamp,
      resolutionMethod: "whatsapp_shared_location",
      supportingReportCount: 0
    }
  };
}

function locationText(location) {
  if (location.source === "whatsapp_shared") {
    return location.originalReference || "Ubicación compartida por WhatsApp";
  }

  if (location.resolutionStatus === "inferred") {
    return `${location.originalReference} (ubicación aproximada inferida)`;
  }

  return location.originalReference;
}

function buildReportPayload(session, now) {
  const isExact = session.location?.resolutionStatus === "exact";
  const isInferred = session.location?.resolutionStatus === "inferred";
  const description =
    session.optionalDescription ||
    "Reporte exprés anónimo recibido por canal conversacional para revisión interna.";

  return {
    title: "Reporte exprés anónimo",
    description,
    category: "otro",
    locationText: locationText(session.location),
    neighborhood: "Pendiente de clasificación",
    zone: "Pendiente de clasificación",
    priority: "normal",
    evidenceCount: 1,
    citizenAlias: shortAlias(session.phoneId),
    locationPrecision: isExact ? "precise" : "approximate",
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    privacyAcknowledged: true,
    sensitiveDataConsent: true,
    privacyAcknowledgedAt: session.privacyAcknowledgedAt || now,
    classificationStatus: "pending_classification",
    intakeChannel: "whatsapp_normalized",
    intakeSource: "fast_anonymous_report",
    phoneId: session.phoneId,
    anonymousAlias: shortAlias(session.phoneId),
    locationDetails: session.location,
    photoReference: session.photoReference,
    evidenceReferences: [
      {
        type: "photo",
        ...session.photoReference
      }
    ],
    locationResolutionSummary: isExact
      ? "Ubicación compartida exacta."
      : isInferred
        ? "Ubicación aproximada inferida a partir de otros reportes de la misma zona."
        : "No hay información suficiente para ubicar automáticamente este reporte."
  };
}

function completeReport(session, now, options = {}) {
  if (rateLimited(session, now)) {
    return {
      ok: true,
      reply: rateLimitReply(),
      rateLimited: true
    };
  }

  const payload = buildReportPayload(session, now);
  const reportInput = {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    locationText: payload.locationText,
    neighborhood: payload.neighborhood,
    zone: payload.zone,
    priority: payload.priority,
    evidenceCount: payload.evidenceCount,
    citizenAlias: payload.citizenAlias,
    locationPrecision: payload.locationPrecision,
    privacyNoticeVersion: payload.privacyNoticeVersion,
    privacyAcknowledged: payload.privacyAcknowledged,
    sensitiveDataConsent: payload.sensitiveDataConsent,
    privacyAcknowledgedAt: payload.privacyAcknowledgedAt
  };
  const result = createReport(reportInput, {
    now,
    source: "whatsapp",
    extraFields: {
      classificationStatus: payload.classificationStatus,
      intakeChannel: payload.intakeChannel,
      intakeSource: payload.intakeSource,
      phoneId: payload.phoneId,
      anonymousAlias: payload.anonymousAlias,
      locationDetails: payload.locationDetails,
      photoReference: payload.photoReference,
      evidenceReferences: payload.evidenceReferences,
      locationResolutionSummary: payload.locationResolutionSummary
    },
    id: options.reportId
  });

  if (!result.ok) {
    return result;
  }

  session.state = "completed";
  session.reportId = result.report.id;
  session.updatedAt = now;
  session.descriptionWindowUntil = minutesFrom(now, INTAKE_LIMITS.descriptionWindowMinutes);
  session.completedReportTimestamps = [...(session.completedReportTimestamps || []), now];

  return {
    ok: true,
    reply: completionReply(),
    report: result.report
  };
}

function messageValidationErrors(message) {
  const errors = validateBaseMessage(message);

  if (errors.length > 0) {
    return errors;
  }

  if (message.type === "image") {
    return validateImage(message.image);
  }

  if (message.type === "location") {
    return validateLocation(message.location);
  }

  if (message.type === "text") {
    return validateText(message.text?.body);
  }

  return [];
}

function applyMessageToSession(session, message, now, options = {}) {
  session.updatedAt = now;
  session.expiresAt = minutesFrom(now, INTAKE_LIMITS.sessionTtlMinutes);

  if (session.state === "awaiting_privacy") {
    if (message.type === "action" && message.action?.id === "continue_anonymous") {
      session.privacyAcknowledgedAt = now;
      session.state = "awaiting_photo_or_location";
      return {
        ok: true,
        reply: reply("Envía una foto del problema o comparte la ubicación.")
      };
    }

    return {
      ok: true,
      reply: privacyReply()
    };
  }

  if (session.state === "completed") {
    if (message.type === "action" && message.action?.id === "continue_anonymous") {
      if (rateLimited(session, now)) {
        return {
          ok: true,
          reply: rateLimitReply(),
          rateLimited: true
        };
      }

      const completedReportTimestamps = session.completedReportTimestamps || [];
      const processedMessages = session.processedMessages || [];
      Object.assign(session, {
        ...baseSession(session.phoneId, now),
        privacyAcknowledgedAt: now,
        state: "awaiting_photo_or_location",
        completedReportTimestamps,
        processedMessages
      });

      return {
        ok: true,
        reply: reply("Envía una foto del problema o comparte la ubicación.")
      };
    }

    if (
      message.type === "text" &&
      session.reportId &&
      session.descriptionWindowUntil &&
      nowMs(now) <= nowMs(session.descriptionWindowUntil)
    ) {
      const optionalDescription = cleanString(message.text.body).slice(0, INTAKE_LIMITS.maxDescriptionLength);
      session.optionalDescription = optionalDescription;
      updateRuntimeReportFields(
        session.reportId,
        {
          description: optionalDescription,
          optionalDescription
        },
        { now }
      );
      return {
        ok: true,
        reply: reply("Listo, agregamos ese detalle al mismo reporte.")
      };
    }

    return {
      ok: true,
      reply: reply("Ya recibimos tu reporte. Gracias por ayudar a que la calle hable.")
    };
  }

  if (message.type === "image") {
    if (!session.photoReference) {
      session.photoReference = imageReference(message);
    }

    if (session.location) {
      return completeReport(session, now, options);
    }

    session.state = "awaiting_location";
    return {
      ok: true,
      reply: needsLocationReply()
    };
  }

  if (message.type === "location") {
    if (!session.location) {
      const result = sharedLocation(message);

      if (!result.ok) {
        return {
          ok: true,
          locationRejected: true,
          reply: reply(
            result.code === "outside_territory"
              ? "Esa ubicación está fuera del territorio habilitado. Comparte una ubicación dentro de la zona de La Calle Habla."
              : "No pudimos validar esa ubicación. Comparte nuevamente tu ubicación."
          )
        };
      }

      session.location = result.location;
    }

    if (session.photoReference) {
      return completeReport(session, now, options);
    }

    session.state = "awaiting_photo";
    return {
      ok: true,
      reply: needsPhotoReply()
    };
  }

  if (message.type === "text") {
    if (!session.location) {
      session.location = resolveWrittenLocation(message.text.body);
    }

    if (session.photoReference) {
      return completeReport(session, now, options);
    }

    session.state = "awaiting_photo";
    return {
      ok: true,
      reply: needsPhotoReply()
    };
  }

  return {
    ok: true,
    reply: reply("Envía una foto o comparte ubicación para continuar.")
  };
}

export function handleIncomingCitizenMessage(message, options = {}) {
  const now = options.now || new Date().toISOString();
  const validationErrors = messageValidationErrors(message);

  if (validationErrors.length > 0) {
    return {
      ok: false,
      error: "invalid_message",
      errors: validationErrors
    };
  }

  let phoneId;

  try {
    phoneId = generatePhoneId(message.senderReference, options);
  } catch (error) {
    return {
      ok: false,
      error: "missing_reporter_id_secret",
      message: error instanceof Error ? error.message : "Reporter secret is missing."
    };
  }

  const sessions = cleanupSessions(loadReportIntakeSessions(), now);
  let session = sessions.find((item) => item.phoneId === phoneId);

  if (!session) {
    session = baseSession(phoneId, now);
    sessions.push(session);
  }

  const processed = findProcessedMessage(session, message.messageId, now);

  if (processed) {
    return {
      ok: true,
      duplicate: true,
      phoneId,
      reply: processed.reply,
      report: processed.reportId ? listReports().find((report) => report.id === processed.reportId) : null
    };
  }

  const response = applyMessageToSession(session, message, now, options);

  if (response.ok) {
    rememberMessage(session, message, response, now);
    saveReportIntakeSessions(sessions);
  }

  return {
    ...response,
    phoneId,
    session
  };
}
