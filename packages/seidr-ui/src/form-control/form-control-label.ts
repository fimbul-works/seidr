import {
  $,
  onUnmounted,
  type ReactiveValue,
  resolvePropsAndChildren,
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
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function FormControlLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props?: FormControlLabelProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function FormControlLabel<T extends keyof SeidrElementTagNameMap = "label">(
  propsOrChildren?: FormControlLabelProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<FormControlLabelProps<T>>(propsOrChildren, children);

  const { as = "label" as T, instance: form, id: customId, htmlFor, ...rest } = props;

  if (!form) {
    throw new SeidrError("FormControlLabel requires an instance prop");
  }

  const id = customId ?? form.id.as((base) => `${base}-label`);
  onUnmounted(form.registerLabel(id));

  const isNativeLabel = as === "label";
  const effectiveHtmlFor = isNativeLabel ? (htmlFor ?? form.fieldId) : undefined;

  return $(
    as as T,
    {
      id,
      htmlFor: effectiveHtmlFor,
      ...form.dataset,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
