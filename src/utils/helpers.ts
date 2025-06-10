/**
 * Helper utility functions
 */

/**
 * Format uptime in days, hours, minutes, seconds
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  
  return `${days}d ${hours}h ${minutes}m ${Math.floor(seconds)}s`;
}

/**
 * Check if a string is a valid ISO date
 */
export function isValidISODate(dateString: string): boolean {
  try {
    return Boolean(dateString) && !isNaN(Date.parse(dateString));
  } catch {
    return false;
  }
}

/**
 * Safely parse JSON string
 */
export function safeJSONParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Remove sensitive information from an object (like passwords)
 */
export function sanitizeObject<T extends object>(obj: T, keysToRemove: string[]): Partial<T> {
  const result = { ...obj };
  
  for (const key of keysToRemove) {
    if (key in result) {
      delete (result as any)[key];
    }
  }
  
  return result;
}

/**
 * Generate a random string (for testing or temp tokens)
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}
