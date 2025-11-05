import jwt_decode from 'jwt-decode';

/**
 * decodeToken: Uses the jwt-decode library to parse JWT payload.
 * NOTE: This decodes payload only; signature is NOT verified on client.
 */
export function decodeToken<T = Record<string, unknown>>(token: string): T | null {
  if (!token) return null;
  try {
    return jwt_decode<T>(token);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to decode token using jwt-decode', e);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken<{ exp?: number }>(token);
  if (!payload) return true;
  const exp = payload.exp;
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return now >= Number(exp);
}

export function getTokenRole(token: string): string | null {
  const payload = decodeToken<Record<string, unknown>>(token);
  if (!payload) return null;
  // attempt to find common role claim names
  const candidateKeys = ['role', 'roles', 'authorities', 'authority', 'scopes', 'scope'];
  for (const key of candidateKeys) {
    const value = payload[key as keyof typeof payload];
    if (!value) continue;
      if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === 'string') return first;
      if (typeof first === 'object' && first !== null && 'authority' in first) return String((first as { authority?: unknown }).authority);
    }
    if (typeof value === 'string') return value;
  }

  // fallback: check authorities array with objects
  const authorities = payload['authorities'];
  if (Array.isArray(authorities) && authorities.length > 0) {
    const first = authorities[0];
    if (typeof first === 'string') return first;
    if (typeof first === 'object' && first !== null && 'authority' in first) return String((first as { authority?: unknown }).authority);
  }

  return null;
}

export { decodeToken as decodeJwt };
