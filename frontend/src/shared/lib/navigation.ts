interface RedirectState {
  from?: {
    pathname?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getRedirectPath(state: unknown, fallback = '/'): string {
  if (!isRecord(state)) {
    return fallback;
  }

  const from = state.from;
  if (!isRecord(from)) {
    return fallback;
  }

  const pathname = from.pathname;
  return typeof pathname === 'string' && pathname.length > 0 ? pathname : fallback;
}
