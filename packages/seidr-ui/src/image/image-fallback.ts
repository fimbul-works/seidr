import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  Show,
  type Value,
} from "@fimbul-works/seidr";
import type { UseImageResult } from "./use-image.js";

export interface ImageFallbackOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;

  /**
   * Bound Image instance or state providing reactive loading status.
   */
  instance?: UseImageResult;

  /**
   * Direct reactive condition controlling whether the fallback should render.
   */
  canRender?: Value<boolean>;
}

export type ImageFallbackProps<T extends keyof SeidrElementTagNameMap = "span"> = ImageFallbackOptions<T> &
  SeidrElementProps<T>;

/**
 * Image.Fallback renders content when the image hasn't loaded (whilst loading or on error).
 */
export function ImageFallback<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): Value<SeidrElementTagNameMap[T] | null>;
export function ImageFallback<T extends keyof SeidrElementTagNameMap = "span">(
  props?: ImageFallbackProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): Value<SeidrElementTagNameMap[T] | null>;
export function ImageFallback<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: ImageFallbackProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): Value<SeidrElementTagNameMap[T] | null> {
  const [props, content] = resolvePropsAndChildren<ImageFallbackProps<T>>(propsOrChildren, children);

  const { as = "span" as T, instance, canRender, ...rest } = props;

  const renderEl = () => $(as, rest as any, content) as SeidrElementTagNameMap[T];
  const condition = canRender ?? instance?.canRenderFallback;

  if (condition) {
    return Show(condition, renderEl) as Value<SeidrElementTagNameMap[T] | null>;
  }

  // Fallback if rendered without a bound state: immediate render wrapped in a Value
  return $(as, rest as any, content) as any;
}
