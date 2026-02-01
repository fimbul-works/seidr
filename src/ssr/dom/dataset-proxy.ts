import type { IsCamelCase, ReactiveCamelCaseProps, ReactiveDataKebabCase } from "../../element/types";
import { camelToKebab } from "../../util/string";
import { createCaseProxy } from "./case-proxy";

export type { ReactiveDataKebabCase };

/**
 * The storage for the Dataset proxy.
 */
export type DatasetProxy = ReactiveDataKebabCase & ReactiveCamelCaseProps;

/**
 * Converts a camelCase string to kebab-case.
 * @param {string} str The string to convert.
 * @returns {string} The kebab-case string.
 */
const dataToKebab = (str: string): string => {
  if (str.startsWith("data") && str.length > 4 && str[4] === str[4].toUpperCase()) {
    return camelToKebab(str[4].toLowerCase() + str.slice(5));
  }
  return camelToKebab(str);
};

/**
 * Creates a proxy for data attributes.
 * @param {ReactiveDataKebabCase} storage The storage for the data proxy.
 * @returns {DatasetProxy} A proxy for data attributes.
 */
export function createDatasetProxy(storage: ReactiveDataKebabCase = {} as ReactiveDataKebabCase) {
  return createCaseProxy<DatasetProxy>({
    prefix: "data-",
    dropPrefix: true,
    storage,
    toKebab: dataToKebab,
  });
}
