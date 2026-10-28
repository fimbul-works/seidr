import {
  type DerivedValue,
  type SeidrChild,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { ImageFallback, type ImageFallbackProps } from "./image-fallback.js";
import { ImageImg, type ImageImgProps } from "./image-img.js";
import { ImageRoot, type ImageRootProps } from "./image-root.js";
import { type UseImageOptions, type UseImageResult, useImage } from "./use-image.js";

export interface ImageInstance extends UseImageResult {
  /**
   * Pre-bound Image.Root container.
   */
  Root: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: ImageRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound Image.Img element.
   */
  Img: <T extends keyof SeidrElementTagNameMap = "img">(
    props?: ImageImgProps<T>,
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /**
   * Pre-bound Image.Fallback container.
   */
  Fallback: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: ImageFallbackProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
}

/**
 * Creates an image state instance with pre-bound compound element helpers.
 */
export function createImage(options: UseImageOptions = {}): ImageInstance {
  const instance = useImage(options);

  return {
    ...instance,
    Root: (props = {}, children) => ImageRoot({ instance, ...props }, children),
    Img: (props = {} as ImageImgProps<any>) => ImageImg({ instance, ...props }),
    Fallback: (props = {}, children) => ImageFallback({ instance, ...props }, children),
  };
}
