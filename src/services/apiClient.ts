const TOKEN_KEY = 'velora_session_token';

function readToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveSessionToken(token: string | null): void {
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage restriction
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const token = readToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(path, {
      ...options,
      headers,
      credentials: 'include',
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await res.json() : null;

    if (!res.ok) {
      const errMsg =
        (body && typeof body.error === 'string' && body.error) ||
        (body && typeof body.message === 'string' && body.message) ||
        `Request failed (${res.status})`;
      return { ok: false, status: res.status, error: errMsg, data: body as T };
    }

    return { ok: true, status: res.status, data: body as T };
  } catch {
    return {
      ok: false,
      status: 0,
      error: 'Unable to reach Velora backend API. Ensure the server is running.',
    };
  }
}
