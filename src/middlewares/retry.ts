/**
 * Retry Utility
 * Provides a mechanism to retry failed operations with configurable backoff strategies
 */

// Backoff strategy function type
export type BackoffStrategy = (attempt: number) => number;

// Default exponential backoff strategy
export const exponentialBackoff: BackoffStrategy = (attempt: number) => {
  return Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Cap at 30 seconds
};

// Linear backoff strategy
export const linearBackoff = (baseMs: number): BackoffStrategy => {
  return (attempt: number) => Math.min(baseMs * attempt, 30000); // Cap at 30 seconds
};

// Fixed backoff strategy
export const fixedBackoff = (ms: number): BackoffStrategy => {
  return () => ms;
};

// Options for retry
export interface RetryOptions {
  maxAttempts?: number;
  backoff?: BackoffStrategy;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

/**
 * Retry a function with configurable retry options
 * @param fn Function to retry
 * @param options Retry options
 * @returns Result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    backoff = exponentialBackoff,
    shouldRetry = () => true,
    onRetry = () => {},
  } = options;

  let attempt = 1;
  let lastError: unknown;

  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      const delayMs = backoff(attempt);
      onRetry(error, attempt);

      await new Promise(resolve => setTimeout(resolve, delayMs));
      attempt++;
    }
  }

  throw lastError;
}

// Retry decorator for class methods
export function Retry(options: RetryOptions = {}) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      return retry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}
