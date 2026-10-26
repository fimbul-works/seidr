import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  type Value,
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

  /**
   * Used to force mounting the error message element when more control is needed
   * (e.g. for CSS animations or discrete transitions).
   * @default false
   */
  forceMount?: boolean;
}

export type FormControlErrorMessageProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlErrorMessageOptions<T> & SeidrElementProps<T>;

/**
 * The error message that gives the user information about how to fix a validation error on the form control.
 */
export function FormControlErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function FormControlErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props?: FormControlErrorMessageProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function FormControlErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: FormControlErrorMessageProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null> {
  let props: FormControlErrorMessageProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as FormControlErrorMessageProps<T>) ?? ({} as FormControlErrorMessageProps<T>);
    content = children;
  } else {
    props = {} as FormControlErrorMessageProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "div" as T, instance, id: customId, forceMount = false, ...rest } = props as any;

  const form = instance;
  if (!form) {
    throw new SeidrError(
      "[seidr-ui]: FormControlErrorMessage requires an instance prop or must be created via FormControl.create() / FormControl.",
    );
  }

  const resolvedId = customId ?? form.errorMessageId() ?? `${form.id}-error-message`;
  onUnmounted(form.registerErrorMessage(resolvedId));

  const elementProps = {
    id: resolvedId,
    ...form.dataset,
    ...rest,
  };

  if (forceMount) {
    return $(
      as as keyof SeidrElementTagNameMap,
      {
        hidden: form.isInvalid.as((inv: boolean) => !inv),
        ...elementProps,
      } as SeidrElementProps<any>,
      content,
    ) as SeidrElementTagNameMap[T];
  }

  return Show(
    form.isInvalid,
    () =>
      $(
        as as keyof SeidrElementTagNameMap,
        elementProps as SeidrElementProps<any>,
        content,
      ) as SeidrElementTagNameMap[T],
  ) as Value<SeidrElementTagNameMap[T] | null>;
}
