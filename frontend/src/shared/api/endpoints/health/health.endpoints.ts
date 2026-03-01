import { http } from '../../http';

import type { GetHealthResponse } from './health.types';

export async function getHealth(): Promise<GetHealthResponse> {
  const response = await http.get<GetHealthResponse>('/health');
  return response.data;
}

export const healthApi = {
  getHealth
};
