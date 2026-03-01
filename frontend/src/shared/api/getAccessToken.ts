const ACCESS_TOKEN_KEY = 'accessToken';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    return token && token.trim().length > 0 ? token : null;
  } catch {
    return null;
  }
}
