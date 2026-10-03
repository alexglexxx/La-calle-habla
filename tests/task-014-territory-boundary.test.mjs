import assert from "node:assert/strict";
import test from "node:test";
import { isInsideTerritory, validateTerritoryLocation } from "../src/config/territory.mjs";
import { handleIncomingCitizenMessage } from "../src/services/report-intake-service.mjs";

test("territory accepts a known Puerto Vallarta point and rejects an outside point", () => {
  assert.equal(isInsideTerritory(20.6534, -105.2258), true);
  assert.equal(isInsideTerritory(20.8, -105.2258), false);
});

test("territory validator distinguishes invalid coordinates from outside territory", () => {
  assert.deepEqual(
    validateTerritoryLocation({ latitude: 200, longitude: -105.2 }).code,
    "invalid_coordinates"
  );
  assert.deepEqual(
    validateTerritoryLocation({ latitude: 20.8, longitude: -105.2 }).code,
    "outside_territory"
  );
  assert.equal(
    validateTerritoryLocation({ latitude: 20.6534, longitude: -105.2258 }).ok,
    true
  );
});

test("WhatsApp intake does not accept a shared location outside the enabled territory", () => {
  const secret = "task-014-test-secret";
  const now = "2026-10-03T18:00:00.000Z";

  const privacy = handleIncomingCitizenMessage(
    {
      provider: "meta_whatsapp",
      senderReference: "521000000001",
      messageId: "task-014-action",
      timestamp: now,
      type: "action",
      action: { id: "continue_anonymous", label: "Continuar anónimo" }
    },
    { reporterIdSecret: secret, now }
  );

  assert.equal(privacy.ok, true);
  assert.equal(privacy.session.state, "awaiting_photo_or_location");

  const outside = handleIncomingCitizenMessage(
    {
      provider: "meta_whatsapp",
      senderReference: "521000000001",
      messageId: "task-014-location-outside",
      timestamp: now,
      type: "location",
      location: {
        latitude: 20.8,
        longitude: -105.2,
        name: "Fuera de zona",
        address: ""
      }
    },
    { reporterIdSecret: secret, now }
  );

  assert.equal(outside.ok, true);
  assert.equal(outside.locationRejected, true);
  assert.equal(outside.session.state, "awaiting_photo_or_location");
  assert.match(outside.reply.text, /fuera del territorio habilitado/i);
});
