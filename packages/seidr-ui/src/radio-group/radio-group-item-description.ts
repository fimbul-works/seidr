import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseRadioGroupItemResult } from "./types.js";

export interface RadioGroupItemDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;

  /**
   * Explicit radio group item instance providing reactive state.
   */
  instance?: UseRadioGroupItemResult;
}

export type RadioGroupItemDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  RadioGroupItemDescriptionOptions<T> & SeidrElementProps<T>;

/**
 * Descriptive text associated with an individual radio option.
 */
export function RadioGroupItemDescription<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupItemDescription<T extends keyof SeidrElementTagNameMap = "span">(
  props?: RadioGroupItemDescriptionProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupItemDescription<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: RadioGroupItemDescriptionProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<RadioGroupItemDescriptionProps<T>>(propsOrChildren, children);
  const { as = "span" as T, instance: item, id, ...rest } = props;

  if (!item) {
    throw new SeidrError("RadioGroupItemDescription requires an instance prop");
  }

  return $(
    as as T,
    {
      id: id ?? item.descriptionId,
      ...item.dataset,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
