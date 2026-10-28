import { isNum, isObj } from "@fimbul-works/hvat";
import {
  $,
  type ReactiveValue,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";

export interface SkeletonOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;
  /**
   * Whether the skeleton is visible.
   * @default true
   */
  visible?: boolean;
  /**
   * Whether the skeleton should animate.
   * @default true
   */
  animate?: boolean;
  /**
   * Width of the skeleton in pixels (if number) or CSS string (e.g. "50%").
   * Defaults to "100%".
   */
  width?: number | string;
  /**
   * Height of the skeleton in pixels (if number) or CSS string (e.g. "2rem").
   * Defaults to "auto".
   */
  height?: number | string;
  /**
   * Whether the skeleton should be circular (sets border-radius to 9999px and width to height).
   * @default false
   */
  circle?: boolean;
  /**
   * Roundedness of the skeleton in pixels (if number) or CSS string.
   */
  radius?: number | string;
  /**
   * ARIA role for the skeleton.
   * @default "group"
   */
  role?: ReactiveValue<string>;
}

export type SkeletProps<T extends keyof SeidrElementTagNameMap = "div"> = SkeletonOptions<T> &
  Omit<SeidrElementProps<T>, "role" | "animate">;

/**
 * Skeleton is a placeholder for content while data is loading.
 */
export function Skeleton<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Skeleton<T extends keyof SeidrElementTagNameMap = "div">(
  props: SkeletProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Skeleton<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: SkeletProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<SkeletProps<T>>(propsOrChildren, children);

  const {
    as = "div" as T,
    visible = true,
    animate = true,
    width,
    height,
    circle = false,
    radius,
    role = "group",
    style,
    ...rest
  } = props;

  const resolvedHeight = circle
    ? isNum(height)
      ? `${height}px`
      : (height ?? (isNum(width) ? `${width}px` : (width ?? "auto")))
    : isNum(height)
      ? `${height}px`
      : (height ?? "auto");

  const resolvedWidth = circle ? resolvedHeight : isNum(width) ? `${width}px` : (width ?? "100%");

  const resolvedRadius = circle ? "9999px" : isNum(radius) ? `${radius}px` : radius;

  const skeletonStyles: Record<string, string | number | undefined> = {
    width: resolvedWidth,
    height: resolvedHeight,
    borderRadius: resolvedRadius,
  };

  const finalStyle = isObj(style) ? { ...skeletonStyles, ...style } : (style ?? skeletonStyles);

  return $(
    as as T,
    {
      role,
      ariaBusy: visible ? "true" : undefined,
      dataVisible: visible ? "" : undefined,
      dataAnimate: animate ? "" : undefined,
      style: finalStyle,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
