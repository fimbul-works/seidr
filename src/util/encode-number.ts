// Base-62 alphabet for compact, URL-safe unique IDs
const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Encode a number using an arbitrary alphabet.
 *
 * @param {number} num - Number to encode
 * @param {string} alphabet - Alphabet string
 * @returns {string} Number encoded using the alphabet
 */
export function encodeNumber(num: number, alphabet: string): string {
  let r = alphabet.length,
    result = "",
    n = num;
  while (n > 0) {
    result = alphabet[n % r] + result;
    n = Math.floor(n / r);
  }
  return result || alphabet[0];
}

/**
 * Decode a number using an arbitrary alphabet.
 *
 * @param {string} str - String to decode
 * @param {string} alphabet - Alphabet string
 * @returns {number} Number decoded from the string
 * @throws {Error} If encountering a character outside of the alphabet
 */
export function decodeNumber(str: string, alphabet: string): number {
  let r = alphabet.length,
    result = 0,
    idx = -1,
    pos = 0;
  for (; pos < str.length; pos++) {
    idx = alphabet.indexOf(str[pos]);
    if (idx === -1) throw new Error(`Invalid base-${r} character: ${str[pos]}`);
    result = result * r + idx;
  }
  return result;
}

/**
 * Encode a number using the Base-62 alphabet.
 *
 * @param {number} num - Number to encode
 * @returns {string} Number encoded as a Base-62 string
 */
export function encodeBase62(num: number): string {
  return encodeNumber(num, BASE62_ALPHABET);
}

/**
 * Decode a number using the Base-62 alphabet
 *
 * @param {string} str - Base62-encode string
 * @returns {number} String decoded from Base-62
 * @throws {Error} If encountering a character outside of the alphabet
 */
export function decodeBase62(str: string): number {
  return decodeNumber(str, BASE62_ALPHABET);
}

/**
 * Generates a random string of a specified length based on an alphabet.
 * @param {number} length - Length of the string to generate
 * @param {string} alphabet - Alphabet string
 * @param {(random: () => number)} random - Optional random number generator that returns a number between 0-1 (default: `Math.random`)
 * @returns {string} Random string of `length` characters long
 */
export function randomString(
  length: number,
  alphabet: string = BASE62_ALPHABET,
  random: () => number = Math.random,
): string {
  let r = alphabet.length,
    result = "",
    i = 0;
  for (; i < length; i++) {
    result += alphabet[Math.floor(random() * r)];
  }
  return result;
}
