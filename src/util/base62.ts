import { SeidrError } from "../types";

// Base-62 alphabet for compact, URL-safe unique IDs
const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Encodes a number to base-62 string.
 */
export function encodeBase62(num: number): string {
  let result = "",
    n = num;
  while (n > 0) {
    result = BASE62_ALPHABET[n % 62] + result;
    n = Math.floor(n / 62);
  }
  return result || "0";
}

/**
 * Decodes a base-62 string to a number.
 */
export function decodeBase62(str: string): number {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const digit = BASE62_ALPHABET.indexOf(str[i]);
    if (digit === -1) throw new SeidrError(`Invalid base-62 character: ${str[i]}`);
    result = result * 62 + digit;
  }
  return result;
}

/**
 * Generates a random base-62 string of specified length.
 */
export function randomString(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE62_ALPHABET[Math.floor(Math.random() * 62)];
  }
  return result;
}
