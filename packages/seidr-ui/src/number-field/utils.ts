/**
 * Returns the precision (number of digits after the decimal point) of a number.
 */
export function getPrecision(value: number): number {
  const str = String(value);
  const eIndex = str.indexOf("e-");
  if (eIndex >= 0) {
    return parseInt(str.slice(eIndex + 2), 10);
  }
  const dotIndex = str.indexOf(".");
  return dotIndex >= 0 ? str.length - dotIndex - 1 : 0;
}

/**
 * Performs accurate decimal addition or subtraction avoiding JavaScript floating-point drift.
 */
export function handleDecimalOperation(operator: "+" | "-", value1: number, value2: number): number {
  let result = operator === "+" ? value1 + value2 : value1 - value2;
  if (Number.isFinite(value1) && Number.isFinite(value2) && (value2 % 1 !== 0 || value1 % 1 !== 0)) {
    const precision1 = getPrecision(value1);
    const precision2 = getPrecision(value2);
    const multiplier = 10 ** Math.max(precision1, precision2);

    const m1 = Math.round(value1 * multiplier);
    const m2 = Math.round(value2 * multiplier);

    result = (operator === "+" ? m1 + m2 : m1 - m2) / multiplier;
  }
  return result;
}

/**
 * Snaps a numeric value to the nearest step within the [min, max] range.
 */
export function snapValueToStep(value: number, min?: number, max?: number, step = 1): number {
  let remainder = (value - (min ?? 0)) % step;
  remainder = handleDecimalOperation("+", remainder, 0); // fix floating point

  let snapped =
    Math.abs(remainder) * 2 >= step
      ? remainder > 0
        ? value - remainder + step
        : value - remainder - step
      : value - remainder;
  snapped = handleDecimalOperation("+", snapped, 0);

  if (min !== undefined && snapped < min) {
    snapped = min;
  } else if (max !== undefined && snapped > max) {
    snapped = max;
  }

  return snapped;
}

/**
 * Parses a string value into a raw float or integer.
 * Cleans formatting characters like commas and currency symbols.
 */
export function parseNumberString(str: string | number | undefined): number {
  if (typeof str === "number") return str;
  if (str == null || str.trim() === "") return Number.NaN;

  // Replace Unicode minus with standard minus
  let clean = str.replace(/\u2212/g, "-");
  // Remove formatting commas between digits (e.g. 1,000 -> 1000)
  clean = clean.replace(/,/g, "");
  // Extract number pattern if mixed with text (e.g. "$ 42.50" -> "42.50")
  const match = clean.match(/[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/);
  if (!match) return Number.NaN;

  return parseFloat(match[0]);
}

/**
 * Checks if a string is a valid partial number entry while typing (e.g. "-", "1.", "1.0").
 */
export function isValidPartialNumber(val: string): boolean {
  if (val === "" || val === "-" || val === "+" || val === ".") return true;
  // Allows partial numbers while typing, with optional decimal point and exponents
  return /^[-+]?[0-9]*\.?[0-9]*(?:[eE][-+]?[0-9]*)?$/.test(val.replace(/,/g, "").trim());
}
