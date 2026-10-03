const STORAGE_PATH = "/storage/v1/object";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function getSupabaseConfig() {
  const url = text(process.env.SUPABASE_URL);
  const serviceRoleKey = text(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !serviceRoleKey) return null;

  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

function headers(config, extra = {}) {
  return {
    apikey: config.serviceRoleKey,
    Authorization: "Bearer " + config.serviceRoleKey,
    ...extra
  };
}

export async function supabaseRestRequest(path, options = {}) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase server configuration is missing.");

  const response = await fetch(config.url + path, {
    ...options,
    headers: headers(config, options.headers)
  });

  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.message
        ? data.message
        : "Supabase request failed with HTTP " + response.status + "."
    );
  }

  return data;
}

export async function uploadSupabaseObject({ bucket, storageKey, bytes, contentType }) {
  const bucketName = text(bucket);
  const key = text(storageKey);
  const mime = text(contentType);

  if (!bucketName || !key || !mime || !(bytes instanceof Uint8Array)) {
    throw new Error("bucket, storageKey, bytes and contentType are required.");
  }

  return supabaseRestRequest(
    STORAGE_PATH + "/" + encodeURIComponent(bucketName) + "/" +
      key.split("/").map(encodeURIComponent).join("/"),
    {
      method: "POST",
      headers: { "Content-Type": mime, "x-upsert": "false" },
      body: bytes
    }
  );
}
