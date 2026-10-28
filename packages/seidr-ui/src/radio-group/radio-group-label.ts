import {
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { FormControlLabel, type FormControlLabelProps } from "../form-control/form-control-label.js";
import type { UseRadioGroupResult } from "./types.js";

export interface RadioGroupLabelOptions<T extends keyof SeidrElementTagNameMap = "span"> {
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

export type RadioGroupLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = RadioGroupLabelOptions<T> &
  SeidrElementProps<T>;

/**
 * The label that gives the user information on the radio group.
 */
export function RadioGroupLabel<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props?: RadioGroupLabelProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupLabel<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: RadioGroupLabelProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<RadioGroupLabelProps<T>>(propsOrChildren, children);
  const { as = "span" as T, instance: rg, ...rest } = props;

  if (!rg) {
    throw new SeidrError("RadioGroupLabel requires an instance prop");
  }

  return FormControlLabel(
    { as, instance: rg.formControl, ...rg.dataset, ...rest } as FormControlLabelProps<T>,
    content,
  );
}
