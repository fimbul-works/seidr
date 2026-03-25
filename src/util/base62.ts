import { SeidrError } from "../types";

/** Base-62 alphabet for compact, URL-safe unique IDs */
export const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Encodes a number to base-62 string.
 *
 * @param {number} num - The number to encode
 * @returns {string} The base-62 encoded string
 */
export const encodeBase62 = (num: number): string => {
  let result = "",
    n = num;
  while (n > 0) {
    result = BASE62_ALPHABET[n % 62] + result;
    n = Math.floor(n / 62);
  }
  return result || "0";
};

/**
 * Decodes a base-62 string to a number.
 *
 * @param {string} str - The base-62 string to decode
 * @returns {number} The decoded number
 */
export const decodeBase62 = (str: string): number => {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const digit = BASE62_ALPHABET.indexOf(str[i]);
    if (digit === -1) throw new SeidrError(`Invalid base-62 character: ${str[i]}`);
    result = result * 62 + digit;
  }
  return result;
};
