const GRAPH_BASE_URL = "https://graph.facebook.com";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function graphVersion() {
  const version = text(process.env.META_GRAPH_API_VERSION);
  if (!/^v\d+\.\d+$/.test(version)) {
    throw new Error("META_GRAPH_API_VERSION must be configured.");
  }
  return version;
}

async function sendMetaMessage({ phoneNumberId, accessToken, to, payload }) {
  const phoneId = text(phoneNumberId);
  const token = text(accessToken);
  const recipient = text(to);

  if (!phoneId || !token || !recipient) {
    throw new Error("phoneNumberId, accessToken and to are required.");
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
        ...payload
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Meta send failed with HTTP " + response.status + "."
    );
  }

  return { messageId: text(data?.messages?.[0]?.id) || null };
}

export async function sendMetaWhatsAppText({ phoneNumberId, accessToken, to, body }) {
  const message = text(body);

  if (!message) {
    throw new Error("body is required.");
  }

  return sendMetaMessage({
    phoneNumberId,
    accessToken,
    to,
    payload: {
      type: "text",
      text: { body: message }
    }
  });
}

export async function sendMetaWhatsAppReply({
  phoneNumberId,
  accessToken,
  to,
  reply
}) {
  const body = text(reply?.text);

  if (!body) {
    throw new Error("reply.text is required.");
  }

  const quickActions = Array.isArray(reply.quickActions)
    ? reply.quickActions
        .filter((action) => text(action?.id) && text(action?.label))
        .slice(0, 3)
        .map((action) => ({
          type: "reply",
          reply: {
            id: text(action.id).slice(0, 256),
            title: text(action.label).slice(0, 20)
          }
        }))
    : [];

  if (quickActions.length === 0) {
    return sendMetaWhatsAppText({
      phoneNumberId,
      accessToken,
      to,
      body
    });
  }

  return sendMetaMessage({
    phoneNumberId,
    accessToken,
    to,
    payload: {
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body.slice(0, 1024) },
        action: { buttons: quickActions }
      }
    }
  });
}
