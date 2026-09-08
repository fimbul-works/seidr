/**
 * Converts a camelCase string to kebab-case.
 *
 * @param {string} str The string to convert
 * @returns {string} The kebab-case string
 */
export const camelToKebab = <S extends string>(str: string): S =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`) as S;
