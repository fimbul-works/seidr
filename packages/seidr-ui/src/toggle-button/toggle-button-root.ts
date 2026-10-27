import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap, type Value } from "@fimbul-works/seidr";
import { type ButtonOptions, type ButtonProps, ButtonRoot } from "../button.js";
import { type UseToggleStateResult, useToggleState } from "../hooks/use-toggle-state.js";

export interface ToggleButtonRootState {
  /** The reactive pressed state Value (derived read-only). */
  pressed: Value<boolean>;
  /** Direct access to the underlying toggle state instance. */
  state: UseToggleStateResult;
}

export type ToggleButtonRenderContent = (state: ToggleButtonRootState) => SeidrChild | SeidrChild[];

export interface ToggleButtonRootOptions<T extends keyof SeidrElementTagNameMap = "button"> extends ButtonOptions<T> {
  /** The controlled pressed state of the toggle button. */
  pressed?: boolean | Value<boolean>;

  /** The default pressed state when initially rendered (uncontrolled). */
  defaultPressed?: boolean | Value<boolean>;

  /** Event handler called when the pressed state of the toggle button changes. */
  onChange?: (pressed: boolean) => void;

  /**
   * Optional render function to dynamically construct button content based on internal state.
   * Kept as a separate named prop to prevent collisions with standard SeidrChild functions.
   */
  renderContent?: ToggleButtonRenderContent;
}

export type ToggleButtonRootProps<T extends keyof SeidrElementTagNameMap = "button"> = ToggleButtonRootOptions<T> &
  Omit<ButtonProps<T>, "aria-pressed" | "data-pressed">;

/**
 * ToggleButton is a two-state button that allows users to toggle a selection on or off.
 * Based on the WAI-ARIA Button Pattern (aria-pressed).
 */
export function ToggleButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ToggleButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  props?: ToggleButtonRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ToggleButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  propsOrChildren?: ToggleButtonRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<ToggleButtonRootProps<T>>(propsOrChildren, children);
  const { pressed, defaultPressed, onChange, disabled, renderContent, onclick: userOnClick, ...rest } = props as any;

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

  const resolvedChildren = renderContent ? renderContent({ pressed: isPressed, state }) : content;

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
