// Base-62 alphabet for compact, URL-safe unique IDs
export const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const RADIX = BASE62_ALPHABET.length;

// Process ID (if available in Node.js environment)
const PID = typeof process?.pid === "number" ? process.pid : null;

/**
 * Encodes a number to base-62 string.
 */
const encodeBase62 = (num: number): string => {
  let result = "",
    n = num;
  while (n > 0) {
    result = BASE62_ALPHABET[n % RADIX] + result;
    n = Math.floor(n / RADIX);
  }
  return result || "0";
};

/**
 * Generates a random base-62 string of specified length.
 */
const randomString = (length: number): string => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE62_ALPHABET[Math.floor(Math.random() * RADIX)];
  }
  return result;
};

/**
 * Generates a timestamp component in base-62.
 */
const timestamp = () => encodeBase62(Date.now());

/**
 * Generates a process ID component in base-62 (or random if not available).
 */
const pid = () => (PID ? encodeBase62(PID) : randomString(3));

/**
 * Generates a unique identifier (UID).
 *
 * The UID is time-sorted and consists of three parts separated by hyphens:
 * - Timestamp: Time when the UID was created (sortable)
 * - Process ID: Process identifier (or random if not available)
 * - Random: High-entropy random component
 *
 * @returns A unique identifier string (approximately 20 characters)
 *
 * @example
 * Basic usage
 * ```typescript
 * import { uid } from '@fimbul-works/seidr';
 *
 * const id1 = uid(); // "v67DiBG-5fC-m58AknG1"
 * const id2 = uid(); // "v67DiBG-5fC-hTDykN0O"
 * ```
 *
 * @example
 * For list keys
 * ```typescript
 * import { uid } from '@fimbul-works/seidr';
 *
 * const todo = { id: uid(), text: "Learn Seidr" };
 * ```
 */
export const uid = (): string => [timestamp(), pid(), randomString(8)].join("-");
