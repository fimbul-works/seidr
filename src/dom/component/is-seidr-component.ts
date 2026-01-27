import type { SeidrComponent } from "./types";

/**
 * Check if a value is a Seidr component.
 * @param {any} v - Value to check
 * @returns {boolean} `true` if the value is a Seidr component, `false` otherwise
 */
export const isSeidrComponent = (v: any): v is SeidrComponent => v && v.isSeidrComponent === true;
