import { type SeidrChild, type SeidrElementProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_NUMBER_FIELD, DATA_PART_DESCRIPTION } from "../constants.js";
import { FormControlDescription, type FormControlDescriptionProps } from "../form-control/form-control-description.js";
import type { UseNumberFieldResult } from "./types.js";

export interface NumberFieldDescriptionOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit number field coordinator instance providing reactive state.
   */
  instance?: UseNumberFieldResult;
}

export type NumberFieldDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  NumberFieldDescriptionOptions<T> & SeidrElementProps<T>;

/**
 * NumberFieldDescription provides accessible hint text linked to the input via aria-describedby.
 */
export function NumberFieldDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: NumberFieldDescriptionProps<T> = {} as NumberFieldDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    instance: nf,
    dataComponent = DATA_COMPONENT_NUMBER_FIELD,
    dataPart = DATA_PART_DESCRIPTION,
    ...rest
  } = props;

  if (!nf) {
    throw new SeidrError("NumberFieldDescription requires an instance coordinator");
  }

  return FormControlDescription(
    {
      instance: nf.formControl,
      dataComponent,
      dataPart,
      ...rest,
    } as FormControlDescriptionProps<T>,
    children,
  );
}
