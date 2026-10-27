import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseSwitchResult } from "./types.js";

export interface SwitchThumbOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit switch instance providing reactive state.
   */
  instance?: UseSwitchResult;
}

export type SwitchThumbProps<T extends keyof SeidrElementTagNameMap = "div"> = SwitchThumbOptions<T> &
  SeidrElementProps<T>;

/**
 * The thumb that is used to visually indicate whether the switch is on or off.
 * Remains mounted permanently and slides across the control track based on data-checked.
 */
export function SwitchThumb<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchThumb<T extends keyof SeidrElementTagNameMap = "div">(
  props?: SwitchThumbProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchThumb<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: SwitchThumbProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<SwitchThumbProps<T>>(propsOrChildren, children);

  const { as = "div" as T, instance, id, ...rest } = props as any;

  if (!instance) {
    throw new SeidrError(
      "[seidr-ui]: SwitchThumb requires an instance prop or must be created via Switch.create() / Switch.",
    );
  }

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      id: id ?? `${instance.id}-thumb`,
      ref: instance.thumbRef,
      ...instance.dataset,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
