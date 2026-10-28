import {
  $,
  type DerivedValue,
  mergeValues,
  onUnmounted,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  unwrapValue,
} from "@fimbul-works/seidr";
import type { UseFormControlResult } from "./types.js";

export interface FormControlErrorMessageOptions<T extends keyof SeidrElementTagNameMap = "div"> {
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

export type FormControlErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlErrorMessageOptions<T> & SeidrElementProps<T>;

/**
 * The error message that gives the user information about how to fix a validation error on the form control.
 */
export function FormControlErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function FormControlErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props: FormControlErrorMessageProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null>;
export function FormControlErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: FormControlErrorMessageProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const [props, content] = resolvePropsAndChildren<FormControlErrorMessageProps<T>>(propsOrChildren, children);

  const { as = "div" as T, instance: form, id: customId, forceMount, ...rest } = props;

  if (!form) {
    throw new SeidrError("FormControlErrorMessage requires an instance prop");
  }

  const errorMessageId = customId ?? form.id.as((base) => `${base}-error-message`);
  onUnmounted(form.registerErrorMessage(errorMessageId));

  const condition = mergeValues(() => Boolean(unwrapValue(forceMount) || form.isInvalid()), {
    parents: [forceMount, form.isInvalid],
  });

  const elementProps = {
    id: errorMessageId,
    ...form.dataset,
    ...rest,
  } as SeidrElementProps<T>;

  return Show(condition, () =>
    $(
      as as T,
      {
        hidden: form.isInvalid.as((inv: boolean) => !inv),
        ...elementProps,
      } as SeidrElementProps<T>,
      content,
    ),
  ) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
