import {
  $,
  type ReactiveValue,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export interface BadgeOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;
  /**
   * Accessible text description of the badge (sets aria-label), especially useful when children are icons or non-text.
   */
  textValue?: ReactiveValue<string>;
  /**
   * Accessible aria-label for the badge element.
   */
  ariaLabel?: ReactiveValue<string>;
  /**
   * ARIA role for the badge element.
   * @default "status"
   */
  role?: ReactiveValue<string>;
}

export type BadgeProps<T extends keyof SeidrElementTagNameMap = "span"> = BadgeOptions<T> &
  Omit<SeidrElementProps<T>, "role">;

/**
 * Badge generates a small badge element, useful for status, counts, or categories.
 */
export function Badge<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Badge<T extends keyof SeidrElementTagNameMap = "span">(
  props: BadgeProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Badge<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: BadgeProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<BadgeProps<T>>(propsOrChildren, children);
  const { as = "span" as T, role = "status", textValue, ariaLabel, ...rest } = props;
  const resolvedAriaLabel = ariaLabel ?? textValue;

  return $(
    as as T,
    {
      role,
      ariaLabel: resolvedAriaLabel,
      dataComponent: "badge",
      ...rest,
    } as SeidrElementProps<T>,
    content,
  ) as SeidrElementTagNameMap[T];
}
