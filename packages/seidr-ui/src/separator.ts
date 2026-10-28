import {
  $,
  type ReactiveValue,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export type Orientation = "horizontal" | "vertical";

export interface SeparatorOptions<T extends keyof SeidrElementTagNameMap = "hr"> {
  /**
   * The HTML element tag name to render.
   * @default "hr"
   */
  as?: T;
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: Orientation;
  /**
   * ARIA role for the separator.
   * Defaults to "separator" if `as` is not "hr", or undefined if native hr.
   */
  role?: ReactiveValue<string>;
}

export type SeparatorProps<T extends keyof SeidrElementTagNameMap = "hr"> = SeparatorOptions<T> &
  Omit<SeidrElementProps<T>, "role">;

/**
 * A separator visually or semantically separates content.
 */
export function Separator<T extends keyof SeidrElementTagNameMap = "hr">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Separator<T extends keyof SeidrElementTagNameMap = "hr">(
  props: SeparatorProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Separator<T extends keyof SeidrElementTagNameMap = "hr">(
  propsOrChildren?: SeparatorProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<SeparatorProps<T>>(propsOrChildren, children);

  const { as = "hr" as T, orientation = "horizontal", role, ...rest } = props;
  const isHr = as === "hr";

  return $(
    as as T,
    {
      role: role ?? (!isHr ? "separator" : undefined),
      ariaOrientation: orientation === "vertical" ? "vertical" : undefined,
      dataOrientation: orientation,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
