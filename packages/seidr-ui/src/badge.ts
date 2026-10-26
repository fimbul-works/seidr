import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  type ReactiveValue,
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
  props?: BadgeProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Badge<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: BadgeProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: BadgeProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as BadgeProps<T>) ?? ({} as BadgeProps<T>);
    content = children;
  } else {
    props = {} as BadgeProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "span" as T, role = "status", textValue, ariaLabel, ...rest } = props;
  const resolvedAriaLabel = ariaLabel ?? textValue;

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      role,
      ...(resolvedAriaLabel !== undefined ? { ariaLabel: resolvedAriaLabel } : {}),
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
