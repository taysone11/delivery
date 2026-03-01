export interface HealthResponse {
  status: string;
  service: string;
  database: string;
  // ISO 8601 date-time string
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
}

export type GetHealthResponse = HealthResponse;
