import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_SWITCH, DATA_PART_ROOT } from "../constants.js";
import type { UseSwitchOptions, UseSwitchResult } from "./types.js";

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
  props: SwitchRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: sw,
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
  } = props;

  if (!sw) {
    throw new SeidrError("SwitchRoot requires an instance coordinator");
  }

  const handlePointerDown = (e: PointerEvent) => {
    (onpointerdown as any)?.(e);
    if (e.defaultPrevented) return;

    // For consistency with native controls, prevent blur on pointerdown when already focused
    if (sw.isFocused()) {
      e.preventDefault();
    }
  };

  return $(
    as,
    {
      role: "group",
      id: sw.id,
      ref: sw.rootRef,
      ...sw.dataset,
      onpointerdown: handlePointerDown,
      dataComponent: DATA_COMPONENT_SWITCH,
      dataPart: DATA_PART_ROOT,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
