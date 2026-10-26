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
  props?: FormControlDescriptionProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function FormControlDescription<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: FormControlDescriptionProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: FormControlDescriptionProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as FormControlDescriptionProps<T>) ?? ({} as FormControlDescriptionProps<T>);
    content = children;
  } else {
    props = {} as FormControlDescriptionProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "div" as T, instance, id: customId, ...rest } = props as any;

  const form = instance;
  if (!form) {
    throw new SeidrError(
      "[seidr-ui]: FormControlDescription requires an instance prop or must be created via FormControl.create() / FormControl.",
    );
  }

  const resolvedId = customId ?? form.descriptionId() ?? `${form.id}-description`;
  onUnmounted(form.registerDescription(resolvedId));

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      id: resolvedId,
      ...form.dataset,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
