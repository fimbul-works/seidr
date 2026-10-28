import { isObj } from "@fimbul-works/hvat";
import type { ReactiveStyleDeclaration, ReactiveValue } from "../element/types.js";
import { isValue, mergeValues, unwrapValue } from "../observable/index.js";

/**
 * Merge style declarations, combining values and functions into a single declaration.
 *
 * @param oldStyle - Old style declaration.
 * @param newStyle - New style declaration.
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
