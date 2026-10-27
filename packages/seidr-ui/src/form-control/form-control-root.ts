import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { UseFormControlOptions, UseFormControlResult } from "./types.js";
import { useFormControl } from "./use-form-control.js";

export interface FormControlRootOptions<T extends keyof SeidrElementTagNameMap = "div"> extends UseFormControlOptions {
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

export type FormControlRootProps<T extends keyof SeidrElementTagNameMap = "div"> = FormControlRootOptions<T> &
  SeidrElementProps<T>;

/**
 * FormControlRoot is the top-level container for an accessible form control group.
 */
export function FormControlRoot<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function FormControlRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props?: FormControlRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function FormControlRoot<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: FormControlRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<FormControlRootProps<T>>(propsOrChildren, children);

  const {
    as = "div" as T,
    instance,
    id,
    name,
    validationState,
    required,
    disabled,
    readOnly,
    fieldId,
    ...rest
  } = props as any;

  const form =
    instance ??
    useFormControl({
      id,
      name,
      validationState,
      required,
      disabled,
      readOnly,
      fieldId,
    });

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      id: form.id,
      ...form.dataset,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
