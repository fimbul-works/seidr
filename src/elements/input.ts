import { $factory } from "../element";

/**
 * Creates an Input HTML element.
 * @returns {HTMLInputElement}
 */
export const $input = $factory("input");

/**
 * Creates a Checkbox Input HTML element.
 * @returns {HTMLInputElement}
 */
export const $checkbox = $factory("input", { type: "checkbox" });

/**
 * Creates a Radio Input HTML element.
 * @returns {HTMLInputElement}
 */
export const $radio = $factory("input", { type: "radio" });
