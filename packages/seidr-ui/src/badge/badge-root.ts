import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export interface BadgeRootOptions<T extends keyof SeidrElementTagNameMap = "span"> {
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

export type BadgeRootProps<T extends keyof SeidrElementTagNameMap = "span"> = BadgeRootOptions<T> &
  Omit<SeidrElementProps<T>, "role">;

/**
 * Badge generates a small badge element, useful for status, counts, or categories.
 */
export function BadgeRoot<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function BadgeRoot<T extends keyof SeidrElementTagNameMap = "span">(
  props?: BadgeRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function BadgeRoot<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: BadgeRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: BadgeRootProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as BadgeRootProps<T>) ?? ({} as BadgeRootProps<T>);
    content = children;
  } else {
    props = {} as BadgeRootProps<T>;
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

export const Badge = Object.assign(BadgeRoot, {
  Root: BadgeRoot,
});
