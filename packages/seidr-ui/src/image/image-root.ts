import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { type UseImageOptions, type UseImageResult, useImage } from "./use-image.js";

export interface ImageRootOptions<T extends keyof SeidrElementTagNameMap = "span"> extends UseImageOptions {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;

  /**
   * Explicit ImageInstance or UseImageResult providing reactive state.
   */
  instance?: UseImageResult;
}

export type ImageRootProps<T extends keyof SeidrElementTagNameMap = "span"> = ImageRootOptions<T> &
  SeidrElementProps<T>;

/**
 * Image.Root is the container element for an image and its fallback.
 */
export function ImageRoot<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ImageRoot<T extends keyof SeidrElementTagNameMap = "span">(
  props?: ImageRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ImageRoot<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?: ImageRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<ImageRootProps<T>>(propsOrChildren, children);

  const {
    as = "span" as T,
    instance,
    src,
    fallbackDelay,
    crossOrigin,
    referrerPolicy,
    onLoadingStatusChange,
    ...rest
  } = props;

  const state =
    instance ??
    (src || !isUndef(fallbackDelay) || onLoadingStatusChange
      ? useImage({ src, fallbackDelay, crossOrigin, referrerPolicy, onLoadingStatusChange })
      : undefined);

  const elementProps: Record<string, any> = {
    ...rest,
    "data-status": state ? state.status : "idle",
  };

  return $(as, elementProps as any, content) as SeidrElementTagNameMap[T];
}
