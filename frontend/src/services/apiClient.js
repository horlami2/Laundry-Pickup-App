const DEFAULT_API_URL = import.meta.env.PROD
  ? "https://laundry-pickup-app.onrender.com/api"
  : "http://localhost:5000/api";
const BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(
  /\/$/,
  "",
);

let activeRequestCount = 0;
const requestActivityListeners = new Set();

export function getActiveRequestCount() {
  return activeRequestCount;
}

export function subscribeToRequestActivity(listener) {
  requestActivityListeners.add(listener);
  return () => requestActivityListeners.delete(listener);
}

function updateActiveRequestCount(change) {
  activeRequestCount += change;
  requestActivityListeners.forEach((listener) => listener());
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getToken() {
  return localStorage.getItem("laundry_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("laundry_token", token);
  else localStorage.removeItem("laundry_token");
}

export function clearToken() {
  localStorage.removeItem("laundry_token");
  localStorage.removeItem("laundry_user");
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    isFormData = false,
    params,
  } = options;

  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const finalHeaders = { ...headers };
  const token = getToken();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  let payload;
  if (body !== undefined) {
    if (isFormData) {
      payload = body;
    } else {
      finalHeaders["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }

  updateActiveRequestCount(1);
  try {
    let response;
    try {
      response = await fetch(url.toString(), {
        method,
        headers: finalHeaders,
        body: payload,
      });
    } catch {
      throw new ApiError(
        "Network error: unable to reach the server. Check your connection or that the backend is running.",
      );
    }

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message =
        (data && (data.message || data.error)) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, data);
    }
    return data;
  } finally {
    updateActiveRequestCount(-1);
  }
}
