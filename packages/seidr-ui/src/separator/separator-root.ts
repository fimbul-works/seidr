import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export type Orientation = "horizontal" | "vertical";

export interface SeparatorRootOptions<T extends keyof SeidrElementTagNameMap = "hr"> {
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

export type SeparatorRootProps<T extends keyof SeidrElementTagNameMap = "hr"> = SeparatorRootOptions<T> &
  Omit<SeidrElementProps<T>, "role">;

/**
 * A separator visually or semantically separates content.
 */
export function SeparatorRoot<T extends keyof SeidrElementTagNameMap = "hr">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SeparatorRoot<T extends keyof SeidrElementTagNameMap = "hr">(
  props?: SeparatorRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SeparatorRoot<T extends keyof SeidrElementTagNameMap = "hr">(
  propsOrChildren?: SeparatorRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: SeparatorRootProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as SeparatorRootProps<T>) ?? ({} as SeparatorRootProps<T>);
    content = children;
  } else {
    props = {} as SeparatorRootProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "hr" as T, orientation = "horizontal", role, ...rest } = props;
  const isHr = as === "hr";

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      role: role ?? (!isHr ? "separator" : undefined),
      ariaOrientation: orientation === "vertical" ? "vertical" : undefined,
      dataOrientation: orientation,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}

export const Separator = Object.assign(SeparatorRoot, {
  Root: SeparatorRoot,
});
