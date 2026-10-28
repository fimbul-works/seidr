import {
  type DerivedValue,
  resolvePropsAndChildren,
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
    propsOrChildren: ImageRootProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound Image.Img element.
   */
  Img: <T extends keyof SeidrElementTagNameMap = "img">(
    propsOrChildren: ImageImgProps<T> | SeidrChild | SeidrChild[],
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;

  /**
   * Pre-bound Image.Fallback container.
   */
  Fallback: <T extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren: ImageFallbackProps<T> | SeidrChild | SeidrChild[],
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
    Root: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return ImageRoot({ instance, ...props }, content);
    },
    Img: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return ImageImg({ instance, ...props }, content);
    },
    Fallback: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return ImageFallback({ instance, ...props }, content);
    },
  };
}
