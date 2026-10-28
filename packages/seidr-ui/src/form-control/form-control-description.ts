import {
  $,
  onUnmounted,
  resolvePropsAndChildren,
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
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function FormControlDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: FormControlDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function FormControlDescription<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: FormControlDescriptionProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<FormControlDescriptionProps<T>>(propsOrChildren, children);
  const { as = "div" as T, instance: form, id: customId, ...rest } = props;

  if (!form) {
    throw new SeidrError("FormControlDescription requires an instance prop");
  }

  const descriptionId = customId ?? form.id.as((base) => `${base}-description`);
  onUnmounted(form.registerDescription(descriptionId));

  return $(
    as as T,
    {
      id: descriptionId,
      ...form.dataset,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
