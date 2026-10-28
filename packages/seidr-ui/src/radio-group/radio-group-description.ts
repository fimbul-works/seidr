import {
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { UseRadioGroupResult } from "./types.js";

export interface RadioGroupDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;

  /**
   * Explicit radio group instance providing reactive state.
   */
  instance?: UseRadioGroupResult;
}

export type RadioGroupDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  RadioGroupDescriptionOptions<T> & SeidrElementProps<T>;

/**
 * The description text or element giving additional information about the radio group.
 */
export function RadioGroupDescription<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupDescription<T extends keyof SeidrElementTagNameMap = "span">(
  props?: RadioGroupDescriptionProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupDescription<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: RadioGroupDescriptionProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<RadioGroupDescriptionProps<T>>(propsOrChildren, children);
  const { as = "span" as T, instance: rg, ...rest } = props;

  if (!rg) {
    throw new SeidrError("RadioGroupDescription requires an instance prop");
  }

  return FormControlDescription(
    { as, instance: rg.formControl, ...rg.dataset, ...rest } as FormControlDescriptionProps<T>,
    content,
  );
}
