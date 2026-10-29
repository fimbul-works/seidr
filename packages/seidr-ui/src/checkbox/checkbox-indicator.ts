import {
  $,
  type DerivedValue,
  mergeValues,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  unwrapValue,
} from "@fimbul-works/seidr";
import type { UseCheckboxResult } from "./types.js";

export interface CheckboxIndicatorOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit checkbox instance providing reactive state.
   */
  instance?: UseCheckboxResult;
}

export type CheckboxIndicatorProps<T extends keyof SeidrElementTagNameMap = "div"> = CheckboxIndicatorOptions<T> &
  SeidrElementProps<T>;

/**
 * The visual indicator rendered when the checkbox is in a checked or indeterminate state.
 */
export function CheckboxIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  props: CheckboxIndicatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { as = "div" as T, instance: cb, forceMount, id, ...rest } = props;

  if (!cb) {
    throw new SeidrError("CheckboxIndicator requires an instance coordinator");
  }

  const elementProps = {
    id: id ?? cb.id.as((base) => `${base}-indicator`),
    ...cb.dataset,
    dataComponent: "checkbox",
    dataPart: "indicator",
    ...rest,
  } as SeidrElementProps<T>;

  const isVisible = mergeValues(() => !!(unwrapValue(forceMount) || cb.checked() || cb.indeterminate()), {
    parents: [forceMount, cb.checked, cb.indeterminate],
  });

  return Show(isVisible, () => $(as as T, elementProps, children)) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
