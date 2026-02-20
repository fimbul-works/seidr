import { $factory } from "../element";

/**
 * Creates an Input SeidrElement.
 * @returns {SeidrElement<"input">}
 */
export const $input = $factory("input");

/**
 * Creates a Checkbox Input SeidrElement.
 * @returns {SeidrElement<"input">}
 */
export const $checkbox = $factory("input", { type: "checkbox" });

/**
 * Creates a Radio Input SeidrElement.
 * @returns {SeidrElement<"input">}
 */
export const $radio = $factory("input", { type: "radio" });
