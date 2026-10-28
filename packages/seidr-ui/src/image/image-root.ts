import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { type UseImageOptions, type UseImageResult } from "./use-image.js";

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
  props: ImageRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance: img,
    src,
    fallbackDelay,
    crossOrigin,
    referrerPolicy,
    onLoadingStatusChange,
    ...rest
  } = props;

  if (!img) {
    throw new SeidrError("ImageRoot requires an instance prop");
  }

  return $(
    as,
    {
      dataComponent: "image",
      dataPart: "root",
      "data-status": img.status,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
