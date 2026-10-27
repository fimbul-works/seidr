import {
  $,
  isValue,
  type ReactiveValue,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

const BUTTON_INPUT_TYPES = new Set(["button", "color", "file", "image", "reset", "submit"]);

/**
 * Checks whether an element tag with the given type is a native button.
 */
export function isNativeButton(tagName: string, type?: string): boolean {
  const tag = tagName.toLowerCase();
  if (tag === "button") return true;
  if (tag === "input" && type) return BUTTON_INPUT_TYPES.has(type);
  return false;
}

export interface ButtonOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  /**
   * The HTML element tag name to render.
   * @default "button"
   */
  as?: T;
  /**
   * Whether the button is disabled.
   */
  disabled?: ReactiveValue<boolean>;
  /**
   * The type attribute when rendered as a button or input.
   * @default "button"
   */
  type?: ReactiveValue<string>;
}

export type ButtonProps<T extends keyof SeidrElementTagNameMap = "button"> = ButtonOptions<T> &
  Omit<SeidrElementProps<T>, "disabled" | "type">;

/**
 * Button enables users to trigger an action or event, such as submitting a form,
 * opening a dialog, canceling an action, or performing a delete operation.
 * Based on the WAI-ARIA Button Pattern.
 */
export function ButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  props?: ButtonProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  propsOrChildren?: ButtonProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<ButtonProps<T>>(propsOrChildren, children);

  const {
    as = "button" as T,
    type = "button",
    disabled,
    role,
    tabIndex,
    onclick: userOnClick,
    onkeydown: userOnKeyDown,
    onkeyup: userOnKeyUp,
    ...rest
  } = props as any;

  const isDisabledValue = isValue(disabled) ? disabled : undefined;
  const isCurrentlyDisabled = () => (isDisabledValue ? !!isDisabledValue() : !!disabled);

  const tagNameStr = as as string;
  const native = isNativeButton(tagNameStr, typeof type === "string" ? type : undefined);

  const onclick = (e: MouseEvent) => {
    if (isCurrentlyDisabled()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    userOnClick?.(e as any);
  };

  const elementProps: Record<string, any> = {
    ...rest,
    onclick,
  };

  if (native) {
    elementProps.type = type;
    elementProps.disabled = disabled;
    elementProps.dataDisabled = isDisabledValue
      ? isDisabledValue.as((d) => (d ? "" : undefined))
      : disabled
        ? ""
        : undefined;
  } else {
    elementProps.role = role ?? "button";
    const resolvedTabIndex =
      tabIndex ?? (isDisabledValue ? isDisabledValue.as((d) => (d ? undefined : 0)) : disabled ? undefined : 0);
    if (resolvedTabIndex !== undefined) {
      elementProps.tabIndex = resolvedTabIndex;
    }
    elementProps.ariaDisabled = isDisabledValue
      ? isDisabledValue.as((d) => (d ? "true" : undefined))
      : disabled
        ? "true"
        : undefined;
    elementProps.dataDisabled = isDisabledValue
      ? isDisabledValue.as((d) => (d ? "" : undefined))
      : disabled
        ? ""
        : undefined;

    elementProps.onkeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (!isCurrentlyDisabled()) {
          e.preventDefault();
          (e.currentTarget as HTMLElement).click();
        }
      } else if (e.key === " ") {
        e.preventDefault();
      }
      userOnKeyDown?.(e as any);
    };

    elementProps.onkeyup = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        if (!isCurrentlyDisabled()) {
          (e.currentTarget as HTMLElement).click();
        }
      }
      userOnKeyUp?.(e as any);
    };
  }

  return $(as as any, elementProps as any, content) as SeidrElementTagNameMap[T];
}

export const Button = Object.assign(ButtonRoot, {
  Root: ButtonRoot,
});
