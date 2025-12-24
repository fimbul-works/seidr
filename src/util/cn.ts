import { Seidr } from "../seidr.js";
import { isFn, isObj, isSeidr } from "./is.js";

const B = Boolean;

/**
 * Builds a concatenated className string from various input types.
 *
 * This utility handles flexible class name construction from strings, objects,
 * arrays, functions, and Seidr observables. It's designed to work seamlessly
 * with conditional classes, reactive class bindings, and complex class logic.
 *
 * @param classes - Variable arguments of different types for class construction
 *
 * @returns A clean, space-separated string of unique class names
 *
 * @example
 * Basic string concatenation
 * ```typescript
 * import { cn } from '@fimbul-works/seidr';
 *
 * const className = cn('btn', 'btn-primary', 'large');
 * // Returns: "btn btn-primary large"
 * ```
 *
 * @example
 * Conditional classes with objects
 * ```typescript
 * import { cn } from '@fimbul-works/seidr';
 *
 * const className = cn('btn', {
 *   'btn-primary': isActive,
 *   'btn-disabled': isDisabled,
 *   'loading': isLoading
 * });
 * // Returns: "btn btn-primary loading" (if isActive=true, isDisabled=false, isLoading=true)
 * ```
 *
 * @example
 * Arrays and nested structures
 * ```typescript
 * import { cn } from '@fimbul-works/seidr';
 *
 * const className = cn('btn', ['btn-primary', { 'large': isLarge }]);
 * // Returns: "btn btn-primary large" (if isLarge=true)
 * ```
 *
 * @example
 * Dynamic classes with functions
 * ```typescript
 * import { cn } from '@fimbul-works/seidr';
 *
 * const className = cn('btn', () => 'btn-primary', () => isDisabled && 'disabled');
 * // Returns: "btn btn-primary disabled" (if isDisabled=true)
 * ```
 *
 * @example
 * Reactive classes with Seidr observables
 * ```typescript
 * import { cn, Seidr } from '@fimbul-works/seidr';
 *
 * const isActive = new Seidr(true);
 * const size = new Seidr('large');
 *
 * const className = cn('btn', isActive.as(active => active && 'active'), size);
 * // Returns: "btn active large"
 * ```
 *
 * @example
 * Complex combinations
 * ```typescript
 * import { cn, Seidr } from '@fimbul-works/seidr';
 *
 * const theme = new Seidr('dark');
 * const isLoading = new Seidr(false);
 * const hasError = new Seidr(false);
 *
 * const className = cn(
 *   'component',
 *   theme.as(theme => `theme-${theme.value}`),
 *   ['base-class', { 'loading': isLoading.value }],
 *   () => hasError.value && 'error'
 * );
 * // Returns: "component theme-dark base-class"
 * ```
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
