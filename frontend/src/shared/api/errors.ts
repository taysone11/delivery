import axios from 'axios';

export interface ApiError {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response;
      const payload =
        typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : undefined;
      const message =
        (typeof payload?.message === 'string' && payload.message) ||
        (typeof payload?.error === 'string' && payload.error) ||
        error.message ||
        'Unexpected error';
      const code =
        (typeof payload?.code === 'string' && payload.code) ||
        (typeof payload?.errorCode === 'string' && payload.errorCode) ||
        undefined;

      return {
        status,
        code,
        message,
        details: data
      };
    }

    if (error.request) {
      return {
        message: 'Network error',
        details: error.request
      };
    }

    return {
      message: error.message || 'Unexpected error'
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'Unexpected error'
    };
  }

  return {
    message: 'Unexpected error',
    details: error
  };
}
