import { isFn, isUndef } from "@fimbul-works/hvat";
import { isValidSeidrChild, type SeidrChild, type SeidrElementTagNameMap, type Value } from "@fimbul-works/seidr";
import { ButtonRoot, type ButtonRootOptions, type ButtonRootProps } from "../button/button-root.js";
import { useToggleState } from "../hooks/use-toggle-state.js";

export interface ToggleButtonRootState {
  /** The reactive pressed state Value. */
  pressed: Value<boolean>;
}

export type ToggleButtonChildren =
  | SeidrChild
  | SeidrChild[]
  | ((state: ToggleButtonRootState) => SeidrChild | SeidrChild[]);

export interface ToggleButtonRootOptions<T extends keyof SeidrElementTagNameMap = "button">
  extends ButtonRootOptions<T> {
  /** The controlled pressed state of the toggle button. */
  pressed?: boolean | Value<boolean>;

  /** The default pressed state when initially rendered (uncontrolled). */
  defaultPressed?: boolean | Value<boolean>;

  /** Event handler called when the pressed state of the toggle button changes. */
  onChange?: (pressed: boolean) => void;
}

export type ToggleButtonRootProps<T extends keyof SeidrElementTagNameMap = "button"> = ToggleButtonRootOptions<T> &
  Omit<ButtonRootProps<T>, "aria-pressed" | "data-pressed">;

/**
 * ToggleButton is a two-state button that allows users to toggle a selection on or off.
 * Based on the WAI-ARIA Button Pattern (aria-pressed).
 */
export function ToggleButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  render: (state: ToggleButtonRootState) => SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ToggleButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  props: ToggleButtonRootProps<T> | null | undefined,
  render: (state: ToggleButtonRootState) => SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ToggleButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ToggleButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  props?: ToggleButtonRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ToggleButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  propsOrChildren?: ToggleButtonRootProps<T> | ToggleButtonChildren | null,
  children?: ToggleButtonChildren,
): SeidrElementTagNameMap[T] {
  let props: ToggleButtonRootProps<T>;
  let content: ToggleButtonChildren | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as ToggleButtonRootProps<T>) ?? ({} as ToggleButtonRootProps<T>);
    content = children;
  } else {
    props = {} as ToggleButtonRootProps<T>;
    content = propsOrChildren as ToggleButtonChildren;
  }

  const { pressed, defaultPressed, onChange, disabled, onclick: userOnClick, ...rest } = props as any;

  const state = useToggleState({
    isSelected: pressed,
    defaultIsSelected: defaultPressed,
    onSelectedChange: onChange,
    isDisabled: disabled,
  });

  const isPressed = state.isSelected;

  const onclick = (e: MouseEvent) => {
    userOnClick?.(e);
    state.toggle();
  };

  const resolvedChildren = isFn(content)
    ? content({ pressed: isPressed })
    : (content as SeidrChild | SeidrChild[] | undefined);

  return ButtonRoot<T>(
    {
      ...rest,
      disabled,
      ariaPressed: isPressed.as((p) => (p ? "true" : "false")),
      dataPressed: isPressed.as((p) => (p ? "" : undefined)),
      onclick,
    } as any,
    resolvedChildren,
  );
}

export const ToggleButton = Object.assign(ToggleButtonRoot, {
  Root: ToggleButtonRoot,
});
