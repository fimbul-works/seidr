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
   * The role of the button.
   * @default "button"
   */
  role?: string;

  /**
   * The tab index of the button.
   */
  tabIndex?: ReactiveValue<number>;

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
  props: ButtonProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ButtonRoot<T extends keyof SeidrElementTagNameMap = "button">(
  propsOrChildren?: ButtonProps<T> | SeidrChild | SeidrChild[],
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
  } = props;

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
    (userOnClick as any)?.(e as any);
  };

  const elementProps = {
    ...rest,
    onclick,
    ...(native
      ? {
          type,
          disabled,
          dataDisabled: isDisabledValue
            ? isDisabledValue.as((d) => (d ? "" : undefined))
            : disabled
              ? ""
              : undefined,
        }
      : {
          role: role ?? "button",
          tabIndex:
            tabIndex ?? (isDisabledValue ? isDisabledValue.as((d) => (d ? undefined : 0)) : disabled ? undefined : 0),
          ariaDisabled: isDisabledValue
            ? isDisabledValue.as((d) => (d ? "true" : undefined))
            : disabled
              ? "true"
              : undefined,
          dataDisabled: isDisabledValue
            ? isDisabledValue.as((d) => (d ? "" : undefined))
            : disabled
              ? ""
              : undefined,
          onkeydown: (e: KeyboardEvent) => {
            if (e.key === "Enter") {
              if (!isCurrentlyDisabled()) {
                e.preventDefault();
                (e.currentTarget as HTMLElement).click();
              }
            } else if (e.key === " ") {
              e.preventDefault();
            }
            (userOnKeyDown as any)?.(e as any);
          },
          onkeyup: (e: KeyboardEvent) => {
            if (e.key === " ") {
              e.preventDefault();
              if (!isCurrentlyDisabled()) {
                (e.currentTarget as HTMLElement).click();
              }
            }
            (userOnKeyUp as any)?.(e as any);
          },
        }),
  } as SeidrElementProps<T>;

  return $(as as T, elementProps, content);
}

export const Button = Object.assign(ButtonRoot, {
  Root: ButtonRoot,
});
