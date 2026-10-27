import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  Show,
} from "@fimbul-works/seidr";
import { createImage } from "./create-image.js";
import { ImageFallback } from "./image-fallback.js";
import { ImageImg } from "./image-img.js";
import { ImageRoot } from "./image-root.js";
import { type UseImageOptions, useImage } from "./use-image.js";

export interface ImageOptions<T extends keyof SeidrElementTagNameMap = "span"> extends UseImageOptions {
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
  fallbackAs?: keyof SeidrElementTagNameMap;

  /**
   * Props to apply to the fallback element.
   */
  fallbackProps?: SeidrElementProps<any>;

  /**
   * Props to apply to the <img> element.
   */
  imgProps?: SeidrElementProps<"img">;
}

export type ImageComponentProps<T extends keyof SeidrElementTagNameMap = "span"> = ImageOptions<T> &
  Omit<SeidrElementProps<T>, "src" | "alt" | "crossOrigin" | "referrerPolicy">;

/**
 * Unified Image component rendering an accessible image with fallback.
 */
export function ImageComponent<T extends keyof SeidrElementTagNameMap = "span">(
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

  const img = useImage({
    src,
    fallbackDelay,
    crossOrigin,
    referrerPolicy,
    onLoadingStatusChange,
  });

  const children: SeidrChild[] = [];

  if (!isUndef(fallback)) {
    children.push(
      Show(img.canRenderFallback, () => $(fallbackAs, { className: "image-fallback", ...fallbackProps }, fallback)),
    );
  }

  if (!isUndef(src)) {
    const finalImgProps: SeidrElementProps<"img"> = {
      src: src as any,
      alt,
      crossOrigin,
      referrerPolicy,
      className: "image-img",
      ...imgProps,
    };
    children.push(Show(img.isLoaded, () => $("img", finalImgProps)));
  }

  return $(as, { "data-status": img.status, ...rest } as any, children) as SeidrElementTagNameMap[T];
}

/**
 * Image namespace offering both a unified component and compound element factories.
 */
export const Image = Object.assign(ImageComponent, {
  Root: ImageRoot,
  Img: ImageImg,
  Fallback: ImageFallback,
  create: createImage,
});
