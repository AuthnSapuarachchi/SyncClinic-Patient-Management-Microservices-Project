import { CONFIG } from "../config/appConfig.js";
import { getToken } from "../auth/tokenStore.js";

function buildHeaders(extraHeaders = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function request(path, options = {}) {
  const response = await fetch(`${CONFIG.gatewayBaseUrl}${path}`, {
    ...options,
    headers: buildHeaders(options.headers || {})
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
}
