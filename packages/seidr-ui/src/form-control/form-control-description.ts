import {
  $,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseFormControlResult } from "./types.js";

export interface FormControlDescriptionOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit instance providing reactive state.
   */
  instance?: UseFormControlResult;
}

export type FormControlDescriptionProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlDescriptionOptions<T> & SeidrElementProps<T>;

/**
 * The description that gives the user more information on the form control.
 */
export function FormControlDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: FormControlDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: form, id: customId, ...rest } = props;

  if (!form) {
    throw new SeidrError("FormControlDescription requires an instance coordinator");
  }

  const descriptionId = customId ?? form.id.as((base) => `${base}-description`);
  onUnmounted(form.registerDescription(descriptionId));

  return $(
    as,
    {
      id: descriptionId,
      dataComponent: "form-control",
      dataPart: "description",
      ...form.dataset,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
