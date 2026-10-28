import { isObj } from "@fimbul-works/hvat";
import type { ReactiveStyleDeclaration, ReactiveValue } from "../element/types.js";
import { isValue, mergeValues, unwrapValue } from "../observable/index.js";

/**
 * Merges two reactive style declarations, combining static values and reactive `Value` observables
 * into a unified `ReactiveStyleDeclaration`.
 *
 * ### Override Semantics:
 * - **Nullish Coalescing (`??`)**: If a property in `newStyle` is `null` or `undefined`,
 *   it falls back to the corresponding property in `oldStyle`.
 * - **Erasing Declarations (`""`)**: Setting a property in `newStyle` to an empty string (`""`)
 *   explicitly overrides and unsets the style from `oldStyle`, clearing the CSS declaration.
 * - **Preserving Numeric Values (`0`)**: Falsy CSS values such as `0` (e.g. `opacity: 0`, `zIndex: 0`)
 *   are preserved and will correctly override `oldStyle`.
 * - **Reactivity**: If either property is an observable `Value`, a `DerivedValue` is created
 *   via `mergeValues` that tracks both sources and re-evaluates dynamically.
 *
 * @param oldStyle - Base/default style declaration.
 * @param newStyle - Overriding style declaration.
 * @returns Merged reactive style declaration.
 */
export function mergeStyleProps(
  oldStyle?: ReactiveStyleDeclaration,
  newStyle?: ReactiveStyleDeclaration,
): ReactiveStyleDeclaration {
  oldStyle = isObj(oldStyle) ? oldStyle : ({} as ReactiveStyleDeclaration);
  newStyle = isObj(newStyle) ? newStyle : ({} as ReactiveStyleDeclaration);

  const allKeys = new Set([
    ...Object.keys(oldStyle),
    ...Object.keys(newStyle),
  ]) as unknown as (keyof ReactiveStyleDeclaration)[];

  const merged: Record<string, ReactiveValue<any>> = {};
  for (const key of allKeys) {
    const oldProp = oldStyle[key];
    const newProp = newStyle[key];
    // Cast to any due to the merged union being too complex for the type system
    merged[key] = (
      isValue(oldProp) || isValue(newProp)
        ? mergeValues(() => unwrapValue(newProp) ?? unwrapValue(oldProp), { parents: [oldProp, newProp] })
        : (newProp ?? oldProp)
    ) as any;
  }

  return merged as ReactiveStyleDeclaration;
}
