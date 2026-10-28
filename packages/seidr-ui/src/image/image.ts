import { isUndef } from "@fimbul-works/hvat";
import {
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { createImage } from "./create-image.js";
import { ImageFallback, type ImageFallbackProps } from "./image-fallback.js";
import { ImageImg, type ImageImgProps } from "./image-img.js";
import { ImageRoot, ImageRootProps } from "./image-root.js";
import { type UseImageOptions, useImage } from "./use-image.js";

export interface ImageOptions<
  T extends keyof SeidrElementTagNameMap = "span",
  F extends keyof SeidrElementTagNameMap = "span",
  I extends keyof SeidrElementTagNameMap = "img",
> extends UseImageOptions {
  /**
   * The HTML element tag name for the root container.
   * @default "span"
   */
  as?: T;

  /**
   * Accessible alternative text description.
   */
  alt?: ReactiveValue<string>;

  /**
   * Content to display while the image is loading or on error.
   */
  fallback?: SeidrChild | SeidrChild[];

  /**
   * Tag name for the fallback container.
   * @default "span"
   */
  fallbackAs?: F;

  /**
   * Props to apply to the fallback element.
   */
  fallbackProps?: ImageFallbackProps<F>;

  /**
   * Props to apply to the <img> element.
   */
  imgProps?: Omit<ImageImgProps<I>, "src"> & { src?: ReactiveValue<string | undefined | null> };
}

export type ImageComponentProps<T extends keyof SeidrElementTagNameMap = "span"> = ImageOptions<T> &
  Omit<SeidrElementProps<T>, "src" | "alt" | "crossOrigin" | "referrerPolicy">;

/**
 * Unified Image component rendering an accessible image with fallback.
 */
export function Image<T extends keyof SeidrElementTagNameMap = "span">(
  props: ImageComponentProps<T>,
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    src,
    alt,
    fallback,
    fallbackAs = "span",
    fallbackProps,
    imgProps,
    fallbackDelay,
    crossOrigin,
    referrerPolicy,
    onLoadingStatusChange,
    ...rest
  } = props;

  const image = createImage({
    src,
    fallbackDelay,
    crossOrigin,
    referrerPolicy,
    onLoadingStatusChange,
  });

  return image.Root(
    {
      as,
      ...rest,
    } as ImageRootProps<T>,
    [
      !isUndef(fallback) && image.Fallback({ as: fallbackAs, ...fallbackProps }, fallback),
      !isUndef(src) && image.Img({ alt, ...imgProps }),
    ],
  );
}
