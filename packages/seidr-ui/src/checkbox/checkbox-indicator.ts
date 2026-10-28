import {
  $,
  type DerivedValue,
  mergeValues,
  resolvePropsAndChildren,
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
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function CheckboxIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  props: CheckboxIndicatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function CheckboxIndicator<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CheckboxIndicatorProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const [props, content] = resolvePropsAndChildren<CheckboxIndicatorProps<T>>(propsOrChildren, children);

  const { as = "div" as T, instance: cb, forceMount, id, ...rest } = props;

  if (!cb) {
    throw new SeidrError("CheckboxIndicator requires an instance prop");
  }

  const elementProps = {
    id: id ?? cb.id.as((base) => `${base}-indicator`),
    ...cb.dataset,
    ...rest,
  };

  const isVisible = mergeValues(() => Boolean(unwrapValue(forceMount) || cb.checked() || cb.indeterminate()), {
    parents: [forceMount, cb.checked, cb.indeterminate],
  });

  return Show(isVisible, () => $(as as T, elementProps as SeidrElementProps<T>, content)) as DerivedValue<
    SeidrElementTagNameMap[T] | null
  >;
}
