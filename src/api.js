const BASE = '/api/v1';

// The access token lives in memory only. The refresh token is an HttpOnly cookie
// the browser sends by itself; we just echo the CSRF cookie back as a header.
let accessToken = null;
let refreshing = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

const readCookie = (name) => {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

// The CSRF cookie is set and cleared together with the refresh cookie, and unlike
// the HttpOnly refresh cookie, the page can see it.
export const hasSessionCookie = () => readCookie('csrfToken') !== null;

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const parse = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const toError = (res, body) => {
  const detail = body.details?.map((d) => `${d.field}: ${d.message}`).join('; ');
  return new ApiError(res.status, detail || body.error || `Request failed (${res.status})`, body.details);
};

const send = (method, path, body, withAuth) => {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (withAuth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const csrf = readCookie('csrfToken');
  if (path.startsWith('/auth/') && csrf) headers['X-CSRF-Token'] = csrf;

  return fetch(BASE + path, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
};

// Gets a new access token using the refresh cookie. Concurrent callers share one request.
export const refreshSession = () => {
  if (!refreshing) {
    refreshing = send('POST', '/auth/refresh', {}, false)
      .then(async (res) => {
        const body = await parse(res);
        if (!res.ok) throw toError(res, body);
        accessToken = body.data.accessToken;
        return body.data;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

export const api = async (method, path, body) => {
  let res = await send(method, path, body, true);

  if (res.status === 401 && !path.startsWith('/auth/')) {
    try {
      await refreshSession();
      res = await send(method, path, body, true);
    } catch {
      accessToken = null;
    }
  }

  const data = await parse(res);
  if (!res.ok) throw toError(res, data);
  return data.data ?? {};
};

export const get = (path) => api('GET', path);
export const post = (path, body = {}) => api('POST', path, body);
export const patch = (path, body) => api('PATCH', path, body);
export const del = (path) => api('DELETE', path);
