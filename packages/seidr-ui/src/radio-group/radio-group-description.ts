import { type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
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
  props: RadioGroupDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "span" as T, instance: rg, ...rest } = props;

  if (!rg) {
    throw new SeidrError("RadioGroupDescription requires an instance coordinator");
  }

  return FormControlDescription(
    {
      as,
      instance: rg.formControl,
      ...rg.dataset,
      dataComponent: "radio-group",
      ...rest,
    } as FormControlDescriptionProps<T>,
    children,
  );
}
