import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseRadioGroupOptions, UseRadioGroupResult } from "./types.js";

export interface RadioGroupRootOptions<T extends keyof SeidrElementTagNameMap = "div"> extends UseRadioGroupOptions {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit radio group instance providing reactive state.
   */
  instance?: UseRadioGroupResult;
}

export type RadioGroupRootProps<T extends keyof SeidrElementTagNameMap = "div"> = RadioGroupRootOptions<T> &
  SeidrElementProps<T>;

/**
 * RadioGroupRoot is the outer container for a radio group (role="radiogroup").
 */
export function RadioGroupRoot<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props?: RadioGroupRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupRoot<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: RadioGroupRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<RadioGroupRootProps<T>>(propsOrChildren, children);

  const {
    as = "div" as T,
    instance: rg,
    id,
    name,
    value,
    defaultValue,
    onChange,
    orientation,
    validationState,
    required,
    disabled,
    readOnly,
    ...rest
  } = props;

  if (!rg) {
    throw new SeidrError("RadioGroupRoot requires an instance prop");
  }

  return $(
    as as T,
    {
      id: id ?? rg.id,
      ...rg.ariaProps,
      ...rg.dataset,
      ref: rg.rootRef,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}

