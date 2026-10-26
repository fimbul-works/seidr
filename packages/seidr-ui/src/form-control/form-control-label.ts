import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  onUnmounted,
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
  let props: FormControlLabelProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as FormControlLabelProps<T>) ?? ({} as FormControlLabelProps<T>);
    content = children;
  } else {
    props = {} as FormControlLabelProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "label" as T, instance, id: customId, htmlFor, ...rest } = props as any;

  const form = instance;
  if (!form) {
    throw new SeidrError(
      "[seidr-ui]: FormControlLabel requires an instance prop or must be created via FormControl.create() / FormControl.",
    );
  }

  const resolvedId = customId ?? form.labelId() ?? `${form.id}-label`;
  onUnmounted(form.registerLabel(resolvedId));

  const isNativeLabel = as === "label";
  const effectiveHtmlFor = isNativeLabel ? (htmlFor ?? form.fieldId) : undefined;

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      id: resolvedId,
      htmlFor: effectiveHtmlFor,
      ...form.dataset,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
