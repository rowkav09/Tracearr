<<<<<<< HEAD
import { BASE_PATH } from '@/lib/api';
=======
import { tokenStorage, BASE_PATH } from '@/lib/api';
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
import { API_BASE_PATH } from '@tracearr/shared';

/**
 * Simple fetch helper for debug endpoints
 */
export async function debugFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
<<<<<<< HEAD
  const headers: Record<string, string> = {};
=======
  const token = tokenStorage.getAccessToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  // Only set Content-Type for requests with a body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }
  // Merge additional headers if provided as a plain object
  if (options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)) {
    Object.assign(headers, options.headers);
  }
  const res = await fetch(`${BASE_PATH}${API_BASE_PATH}/debug${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Raw fetch for debug endpoints (e.g. file downloads)
 */
export async function debugRawFetch(path: string): Promise<Response> {
<<<<<<< HEAD
  const res = await fetch(`${BASE_PATH}${API_BASE_PATH}/debug${path}`);
=======
  const token = tokenStorage.getAccessToken();
  const res = await fetch(`${BASE_PATH}${API_BASE_PATH}/debug${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}
