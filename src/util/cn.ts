import { isSeidr } from "./type-guards/is-observable";
import { isArray, isFn, isObj } from "./type-guards/primitive-types";

const B = Boolean;

/**
 * Builds a concatenated className string from various input types.
 *
 * This utility handles flexible class name construction from strings, objects,
 * arrays, functions, and Seidr observables. It's designed to work seamlessly
 * with conditional classes, reactive class bindings, and complex class logic.
 *
 * @param {any[]} classes - Variable arguments of different types for class construction
 * @returns {string} A clean, space-separated string of unique class names
 */
export const cn = (...classes: any[]): string =>
  Array.from(
    new Set(
      classes
        .filter(B)
        .flatMap((c: any): string =>
          isSeidr(c)
            ? cn([c.value])
            : isArray(c)
              ? cn(...c)
              : isFn(c)
                ? cn([c()])
                : isObj(c)
                  ? cn(
                      Object.entries(c as object)
                        .filter(([, value]) => !!value)
                        .map(([key]) => key),
                    )
                  : String(c),
        )
        .map((c) => c.trim())
        .filter(B),
    ),
  ).join(" ");
