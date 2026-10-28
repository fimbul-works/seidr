import {
  $,
  type ReactiveValue,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseRadioGroupItemResult } from "./types.js";

export interface RadioGroupItemLabelOptions<T extends keyof SeidrElementTagNameMap = "label"> {
  /**
   * The HTML element tag name to render.
   * @default "label"
   */
  as?: T;

  /**
   * Explicit radio group item instance providing reactive state.
   */
  instance?: UseRadioGroupItemResult;

  /**
   * The id of the input that this label is associated with.
   */
  htmlFor?: ReactiveValue<string>;
}

export type RadioGroupItemLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = RadioGroupItemLabelOptions<T> &
  SeidrElementProps<T>;

/**
 * The accessible label associated with an individual radio option.
 */
export function RadioGroupItemLabel<T extends keyof SeidrElementTagNameMap = "label">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupItemLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props?: RadioGroupItemLabelProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupItemLabel<T extends keyof SeidrElementTagNameMap = "label">(
  propsOrChildren?: RadioGroupItemLabelProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<RadioGroupItemLabelProps<T>>(propsOrChildren, children);
  const { as = "label" as T, instance: item, id, htmlFor, ...rest } = props;

  if (!item) {
    throw new SeidrError("RadioGroupItemLabel requires an instance prop");
  }

  const effectiveHtmlFor = as === "label" ? (htmlFor ?? item.inputId) : undefined;

  return $(
    as as T,
    {
      id: id ?? item.labelId,
      htmlFor: effectiveHtmlFor,
      ...item.dataset,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
