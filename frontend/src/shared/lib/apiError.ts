import type { ApiError } from '../api/errors';

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Не удалось выполнить действие. Попробуйте снова.'
): string {
  if (isApiError(error)) {
    return error.message;
  }

  return fallback;
}
