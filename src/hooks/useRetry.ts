import { useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
}

export function useRetry(opts: RetryOptions = {}) {
  const { maxRetries = 3, baseDelay = 1000 } = opts;

  const withRetry = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      let lastError: unknown;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (err) {
          lastError = err;
          if (attempt < maxRetries) {
            await new Promise((r) =>
              setTimeout(r, baseDelay * Math.pow(2, attempt))
            );
          }
        }
      }

      throw lastError;
    },
    [maxRetries, baseDelay]
  );

  return withRetry;
}
