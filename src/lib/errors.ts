import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '../types/api';

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) return 'Unable to reach the server. Check your connection.';
    const body = err.response.data;
    if (body?.errors?.length) return body.errors[0].message;
    return body?.message ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}
