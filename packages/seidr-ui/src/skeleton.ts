import { isNum } from "@fimbul-works/hvat";
import { mergeValues } from "@fimbul-works/seidr";
import { mergeStyleProps } from "@fimbul-works/seidr";
import { wrapValue } from "@fimbul-works/seidr";
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
  visible?: ReactiveValue<boolean>;
  /**
   * Whether the skeleton should animate.
   * @default true
   */
  animate?: ReactiveValue<boolean>;
  /**
   * Width of the skeleton in pixels (if number) or CSS string (e.g. "50%").
   * Defaults to "100%".
   */
  width?: ReactiveValue<number | string>;
  /**
   * Height of the skeleton in pixels (if number) or CSS string (e.g. "2rem").
   * Defaults to "auto".
   */
  height?: ReactiveValue<number | string>;
  /**
   * Whether the skeleton should be circular (sets border-radius to 9999px and width to height).
   * @default false
   */
  circle?: ReactiveValue<boolean>;
  /**
   * Roundedness of the skeleton in pixels (if number) or CSS string.
   */
  radius?: ReactiveValue<number | string>;
  /**
   * ARIA role for the skeleton.
   * @default "group"
   */
  role?: ReactiveValue<string>;
}

export type SkeletonProps<T extends keyof SeidrElementTagNameMap = "div"> = SkeletonOptions<T> &
  Omit<SeidrElementProps<T>, "role" | "animate">;

/**
 * Skeleton is a placeholder for content while data is loading.
 */
export function Skeleton<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Skeleton<T extends keyof SeidrElementTagNameMap = "div">(
  props: SkeletonProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function Skeleton<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: SkeletonProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<SkeletonProps<T>>(propsOrChildren, children);
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

  type Dimensions = {
    c: boolean;
    w?: number | string;
    h?: number | string;
    r?: number | string;
  };

  const wrappedVisible = wrapValue(visible ?? true)
  const wrappedAnimate = wrapValue(animate ?? true)
  const wrappedCircle = wrapValue(circle ?? false);
  const wrappedWidth = wrapValue(width as string | number | undefined)
  const wrappedHeight = wrapValue(height as string | number | undefined)
  const wrappedRadius = wrapValue(radius as string | number | undefined)

  const dimensions = mergeValues<Dimensions>(() => ({
    c: wrappedCircle(),
    w: wrappedWidth(),
    h: wrappedHeight(),
    r: wrappedRadius(),
  }));

  const resolvedHeight = dimensions.as(({ c, w, h }: Dimensions) => {
    return isNum(h)
      ? `${h}px`
      : c
        ? (h ?? (isNum(w) ? `${w}px` : (w ?? "auto")))
        : (h ?? "auto");
  });

  const resolvedWidth = dimensions.as(({ c, w }: Dimensions) => {
    return c ? resolvedHeight() : isNum(w) ? `${w}px` : (w ?? "100%");
  });

  const resolvedRadius = dimensions.as(({ c, r }: Dimensions) => {
    return c ? "100%" : isNum(r) ? `${r}px` : r;
  });

  return $(
    as,
    {
      role,
      dataComponent: "skeleton",
      ...rest,
      ariaBusy: wrappedVisible.as(visible => visible ? "true" : undefined),
      dataVisible: wrappedVisible.as(visible => visible ? "" : undefined),
      dataAnimate: wrappedAnimate.as(animate => animate ? "" : undefined),
      style: mergeStyleProps(
        {
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius: resolvedRadius,
        },
        style,
      ),
    } as SeidrElementProps<T>,
    content,
  );
}
