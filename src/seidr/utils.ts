import type { ObservableOptions } from "./types";

/**
 * Helper function to get options for a child observable.
 *
 * @param {ObservableOptions} [options] - Options for the child observable
 * @returns {ObservableOptions} Options for the child observable
 */
export const optionsForChild = (options: ObservableOptions = {}) => {
  const { id, ...rest } = options;
  return rest;
};
