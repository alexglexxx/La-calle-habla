import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createReport, PRIVACY_NOTICE_VERSION } from "../../../src/services/report-service.mjs";
import { persistReportCreated, persistEvidence } from "../../../src/services/supabase-persistence.mjs";
import { uploadSupabaseObject } from "../../../src/integrations/supabase/supabase-rest.mjs";
import { validateTerritoryLocation } from "../../../src/config/territory.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const CATEGORY_NAMES = { bache: "Bache", basura: "Basura", "fuga-de-agua": "Fuga de agua", alumbrado: "Alumbrado", drenaje: "Drenaje", "banqueta-danada": "Banqueta dañada", "calle-peligrosa": "Calle peligrosa", senalizacion: "Señalización", "arbol-obstruyendo": "Árbol obstruyendo", "ruido-excesivo": "Ruido excesivo", "semaforo-fallando": "Semáforo fallando", "alcantarilla-destapada": "Alcantarilla destapada", otro: "Otro" };
function error(message, status = 400) { return NextResponse.json({ ok: false, error: message }, { status }); }
function clean(value) { return typeof value === "string" ? value.trim() : ""; }

export async function POST(request) {
  try {
    const form = await request.formData();
    const photo = form.get("photo");
    const category = clean(form.get("category"));
    const description = clean(form.get("description"));
    const latitude = Number(form.get("latitude"));
    const longitude = Number(form.get("longitude"));
    const privacyAcknowledged = form.get("privacyAcknowledged") === "true";
    if (!(photo instanceof File)) return error("Necesitamos una foto del problema.");
    if (!ALLOWED_IMAGE_TYPES.has(photo.type)) return error("La foto debe ser JPG, PNG, WebP o HEIC.");
    if (photo.size <= 0 || photo.size > MAX_PHOTO_BYTES) return error("La foto debe pesar menos de 8 MB.");
    if (!CATEGORY_NAMES[category]) return error("Selecciona una categoría válida.");
    if (description.length < 15 || description.length > 1000) return error("Cuéntanos qué pasa con al menos 15 caracteres.");
    if (!privacyAcknowledged) return error("Debes confirmar el aviso de privacidad.");
    const location = validateTerritoryLocation({ latitude, longitude });
    if (!location.ok) return error(location.message);
    const reportId = "web-" + randomUUID();
    const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const storageKey = `web/${reportId}/evidence-1.${extension}`;
    const bytes = new Uint8Array(await photo.arrayBuffer());
    await uploadSupabaseObject({ bucket: process.env.SUPABASE_REPORT_BUCKET, storageKey, bytes, contentType: photo.type });
    const now = new Date().toISOString();
    const result = createReport({
      title: CATEGORY_NAMES[category], description, category, locationText: "Puerto Vallarta", neighborhood: "Ubicación GPS",
      source: "manual", priority: "normal", evidenceCount: 1, citizenAlias: "Ciudadano anónimo", locationPrecision: "precise",
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION, privacyAcknowledged: true, sensitiveDataConsent: true
    }, {
      id: reportId, source: "web", now,
      extraFields: { intakeChannel: "web", intakeSource: "public_portal", locationDetails: { latitude, longitude, source: "browser_geolocation" } }
    });
    if (!result.ok) return error("No se pudo validar el reporte.", 422);
    await persistReportCreated(result.report);
    await persistEvidence(reportId, { type: "photo", storageKey, mimeType: photo.type, sizeBytes: photo.size, receivedAt: now, metadata: { source: "public_web" } });
    return NextResponse.json({ ok: true, reportId, message: "Reporte recibido. Gracias por hacer visible lo que pasa en la calle." });
  } catch (e) {
    return error(e instanceof Error ? e.message : "No pudimos recibir el reporte. Intenta de nuevo.", 500);
  }
}