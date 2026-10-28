import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseFormControlOptions, UseFormControlResult } from "./types.js";

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
  props: FormControlRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: form,
    id,
    name,
    validationState,
    required,
    disabled,
    readOnly,
    fieldId,
    ...rest
  } = props;

  if (!form) {
    throw new SeidrError("FormControlRoot requires an instance prop");
  }

  return $(
    as,
    {
      id: form.id,
      dataComponent: "form-control",
      dataPart: "root",
      ...form.dataset,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
