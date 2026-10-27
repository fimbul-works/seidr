import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type { UseCheckboxOptions, UseCheckboxResult } from "./types.js";
import { useCheckbox } from "./use-checkbox.js";

export interface CheckboxRootOptions<T extends keyof SeidrElementTagNameMap = "div"> extends UseCheckboxOptions {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit checkbox instance providing reactive state.
   */
  instance?: UseCheckboxResult;
}

export type CheckboxRootProps<T extends keyof SeidrElementTagNameMap = "div"> = CheckboxRootOptions<T> &
  SeidrElementProps<T>;

/**
 * CheckboxRoot is the outer container for a checkbox widget (role="group").
 */
export function CheckboxRoot<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props?: CheckboxRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxRoot<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CheckboxRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<CheckboxRootProps<T>>(propsOrChildren, children);

  const {
    as = "div" as T,
    instance,
    id,
    name,
    checked,
    defaultChecked,
    onChange,
    indeterminate,
    value,
    validationState,
    required,
    disabled,
    readOnly,
    onpointerdown,
    ...rest
  } = props as any;

  const cb =
    instance ??
    useCheckbox({
      id,
      name,
      checked,
      defaultChecked,
      onChange,
      indeterminate,
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
    if (cb.isFocused()) {
      e.preventDefault();
    }
  };

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      role: "group",
      id: cb.id,
      ref: cb.rootRef,
      ...cb.dataset,
      onpointerdown: handlePointerDown,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
