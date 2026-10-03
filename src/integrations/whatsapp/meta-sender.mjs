const GRAPH_BASE_URL = "https://graph.facebook.com";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function graphVersion() {
  const version = text(process.env.META_GRAPH_API_VERSION);
  if (!/^v\d+\.\d+$/.test(version)) throw new Error("META_GRAPH_API_VERSION must be configured.");
  return version;
}

export async function sendMetaWhatsAppText({ phoneNumberId, accessToken, to, body }) {
  const phoneId = text(phoneNumberId);
  const token = text(accessToken);
  const recipient = text(to);
  const message = text(body);

  if (!phoneId || !token || !recipient || !message) {
    throw new Error("phoneNumberId, accessToken, to and body are required.");
  }

  const response = await fetch(
    GRAPH_BASE_URL + "/" + graphVersion() + "/" + encodeURIComponent(phoneId) + "/messages",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: { body: message }
      })
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Meta send failed with HTTP " + response.status + ".");
  }

  return { messageId: text(data?.messages?.[0]?.id) || null };
}
