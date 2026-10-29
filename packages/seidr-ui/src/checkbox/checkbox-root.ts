import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseCheckboxOptions, UseCheckboxResult } from "./types.js";

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
  props: CheckboxRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
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
  } = props;

  if (!instance) {
    throw new SeidrError("CheckboxRoot requires an instance coordinator");
  }

  const cb = instance;

  const handlePointerDown = (e: PointerEvent) => {
    (onpointerdown as any)?.(e);
    if (e.defaultPrevented) return;

    // For consistency with native controls, prevent blur on pointerdown when already focused
    if (cb.isFocused()) {
      e.preventDefault();
    }
  };

  return $(
    as as T,
    {
      role: "group",
      id: cb.id,
      ref: cb.rootRef,
      ...cb.dataset,
      onpointerdown: handlePointerDown,
      dataComponent: "checkbox",
      dataPart: "root",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
