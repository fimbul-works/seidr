import { isFn, isObj, isSeidr } from "./type-guards";

const B = Boolean;

/**
 * Builds a concatenated className string from various input types.
 *
 * This utility handles flexible class name construction from strings, objects,
 * arrays, functions, and Seidr observables. It's designed to work seamlessly
 * with conditional classes, reactive class bindings, and complex class logic.
 *
 * @param {string | Record<string, boolean> | any[] | () => (string | Record<string, boolean> | any[])} classes - Variable arguments of different types for class construction
 * @returns {string} A clean, space-separated string of unique class names
 */
export const cn = (...classes: unknown[]): string =>
  Array.from(
    new Set(
      classes
        .filter(B)
        .flatMap((c: unknown): string =>
          isSeidr(c)
            ? cn([c.value])
            : Array.isArray(c)
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
