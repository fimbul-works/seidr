import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { type UseImageOptions, type UseImageResult, useImage } from "./use-image.js";
import { SeidrError } from "@fimbul-works/seidr";

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
      ...rest,
      "data-status": img.status,
    } as SeidrElementProps<T>,
    content,
  );
}
