import {
  $,
  onUnmounted,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseFormControlResult } from "./types.js";

export interface FormControlLabelOptions<T extends keyof SeidrElementTagNameMap = "label"> {
  /**
   * The HTML element tag name to render.
   * @default "label"
   */
  as?: T;

  /**
   * Explicit instance providing reactive state.
   */
  instance?: UseFormControlResult;

  /**
   * The id of the form control that this label is associated with.
   */
  htmlFor?: ReactiveValue<string>;
}

export type FormControlLabelProps<T extends keyof SeidrElementTagNameMap = "label"> = FormControlLabelOptions<T> &
  SeidrElementProps<T>;

/**
 * The label that gives the user information on the form control.
 */
export function FormControlLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: FormControlLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "label" as T, instance: form, id: customId, htmlFor, ...rest } = props;

  if (!form) {
    throw new SeidrError("FormControlLabel requires an instance coordinator");
  }

  const id = customId ?? form.id.as((base) => `${base}-label`);
  onUnmounted(form.registerLabel(id));

  const effectiveHtmlFor = as === "label" ? (htmlFor ?? form.fieldId) : undefined;

  return $(
    as,
    {
      id,
      htmlFor: effectiveHtmlFor,
      dataComponent: "form-control",
      dataPart: "label",
      ...form.dataset,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
