import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { UseSwitchOptions, UseSwitchResult } from "./types.js";
import { useSwitch } from "./use-switch.js";

export interface SwitchRootOptions<T extends keyof SeidrElementTagNameMap = "div"> extends UseSwitchOptions {
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

export type SwitchRootProps<T extends keyof SeidrElementTagNameMap = "div"> = SwitchRootOptions<T> &
  SeidrElementProps<T>;

/**
 * SwitchRoot is the outer container for a switch widget (role="group").
 */
export function SwitchRoot<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props?: SwitchRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchRoot<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: SwitchRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<SwitchRootProps<T>>(propsOrChildren, children);

  const {
    as = "div" as T,
    instance,
    id,
    name,
    checked,
    defaultChecked,
    onChange,
    value,
    validationState,
    required,
    disabled,
    readOnly,
    onpointerdown,
    ...rest
  } = props as any;

  const sw =
    instance ??
    useSwitch({
      id,
      name,
      checked,
      defaultChecked,
      onChange,
      value,
      validationState,
      required,
      disabled,
      readOnly,
    });

  const handlePointerDown = (e: PointerEvent) => {
    (onpointerdown as any)?.(e);
    if (e.defaultPrevented) return;

    // For consistency with native controls, prevent blur on pointerdown when already focused
    if (sw.isFocused()) {
      e.preventDefault();
    }
  };

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      role: "group",
      id: sw.id,
      ref: sw.rootRef,
      ...sw.dataset,
      onpointerdown: handlePointerDown,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
