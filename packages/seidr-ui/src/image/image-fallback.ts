import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  createValue,
  inClient,
  isValidSeidrChild,
  mergeValues,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  type Value,
} from "@fimbul-works/seidr";
import { type ImageContextValue, useImageContext } from "./image-context.js";

export interface ImageFallbackOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;
  /**
   * Delay in milliseconds before rendering fallback, overriding root fallbackDelay.
   */
  delayMs?: number;
}

export type ImageFallbackProps<T extends keyof SeidrElementTagNameMap = "span"> = ImageFallbackOptions<T> &
  SeidrElementProps<T>;

/**
 * Image.Fallback renders when the image hasn't loaded (whilst loading or on error).
 */
export function ImageFallback<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): Value<SeidrElementTagNameMap[T] | null>;
export function ImageFallback<T extends keyof SeidrElementTagNameMap = "span">(
  props?: ImageFallbackProps<T> | null,
  children?: SeidrChild | SeidrChild[],
  explicitContext?: ImageContextValue,
): Value<SeidrElementTagNameMap[T] | null>;
export function ImageFallback<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: ImageFallbackProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
  explicitContext?: ImageContextValue,
): Value<SeidrElementTagNameMap[T] | null> {
  let props: ImageFallbackProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as ImageFallbackProps<T>) ?? ({} as ImageFallbackProps<T>);
    content = children;
  } else {
    props = {} as ImageFallbackProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "span" as T, delayMs, ...rest } = props;

  const context = explicitContext ?? useImageContext();
  const delay = delayMs ?? context.fallbackDelay;

  const canRender = createValue(isUndef(delay) || delay <= 0);

  inClient(() => {
    if (!isUndef(delay) && delay > 0) {
      const timer = window.setTimeout(() => canRender(true), delay);
      onUnmounted(() => window.clearTimeout(timer));
    }
  });

  const isVisible = mergeValues(() => canRender() && context.status() !== "loaded", {
    parents: [canRender, context.status],
  });

  return isVisible.as((visible) => (visible ? ($(as, rest as any, content) as any) : null));
}
