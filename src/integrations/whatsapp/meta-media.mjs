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

export async function getMetaMediaUrl(mediaId, accessToken) {
  const id = text(mediaId);
  const token = text(accessToken);
  if (!id || !token) throw new Error("mediaId and accessToken are required.");

  const response = await fetch(
    GRAPH_BASE_URL + "/" + graphVersion() + "/" + encodeURIComponent(id),
    { headers: { Authorization: "Bearer " + token } }
  );

  if (!response.ok) throw new Error("Meta media lookup failed with HTTP " + response.status + ".");
  const data = await response.json();

  if (!text(data?.url)) throw new Error("Meta media lookup returned no download URL.");

  return {
    url: data.url,
    mimeType: text(data.mime_type) || null,
    fileSizeBytes: Number.isFinite(Number(data.file_size)) ? Number(data.file_size) : null
  };
}

export async function downloadMetaMedia({
  mediaUrl,
  accessToken,
  maxBytes = 5 * 1024 * 1024,
  allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"]
}) {
  const url = text(mediaUrl);
  const token = text(accessToken);
  if (!url || !token) throw new Error("mediaUrl and accessToken are required.");

  const response = await fetch(url, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!response.ok) throw new Error("Meta media download failed with HTTP " + response.status + ".");

  const contentType = text(response.headers.get("content-type")).toLowerCase().split(";")[0];
  const contentLength = Number(response.headers.get("content-length"));

  if (!allowedMimeTypes.includes(contentType)) {
    throw new Error("Unsupported media content type: " + (contentType || "unknown") + ".");
  }

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error("Media exceeds the configured maximum size.");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > maxBytes) throw new Error("Media exceeds the configured maximum size.");

  return { bytes, mimeType: contentType, sizeBytes: bytes.byteLength };
}
