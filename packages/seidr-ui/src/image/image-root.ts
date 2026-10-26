import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  createValue,
  isValidSeidrChild,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  type Value,
} from "@fimbul-works/seidr";
import { type ImageContextValue, imageContext } from "./image-context.js";
import { ImageFallback, type ImageFallbackProps } from "./image-fallback.js";
import { ImageImg, type ImageImgProps } from "./image-img.js";
import type { ImageLoadingStatus } from "./types.js";

export interface ImageRootOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;
  /**
   * The delay (in ms) before displaying the image fallback.
   */
  fallbackDelay?: number;
  /**
   * A callback providing information about the loading status of the image.
   */
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

export type ImageRootProps<T extends keyof SeidrElementTagNameMap = "span"> = ImageRootOptions<T> &
  SeidrElementProps<T>;

/**
 * Scoped API provided to child render functions or returned by createImage().
 */
export interface ImageScopedApi extends ImageContextValue {
  Img: <K extends keyof SeidrElementTagNameMap = "img">(
    propsOrChildren?: ImageImgProps<K> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => Value<SeidrElementTagNameMap[K] | null>;
  Fallback: <K extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren?: ImageFallbackProps<K> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => Value<SeidrElementTagNameMap[K] | null>;
}

/**
 * Creates an image state instance with scoped components.
 */
export function createImage({ fallbackDelay, onLoadingStatusChange }: ImageRootOptions = {}): ImageScopedApi {
  const status = createValue<ImageLoadingStatus>("idle");
  const ctx: ImageContextValue = {
    fallbackDelay,
    status,
    onLoadingStatusChange,
  };

  const scopedApi: ImageScopedApi = {
    ...ctx,
    Img: ((props?: any, children?: any) => ImageImg(props, children, ctx)) as any,
    Fallback: ((props?: any, children?: any) => ImageFallback(props, children, ctx)) as any,
  };

  return scopedApi;
}

/**
 * Image container element with fallback handling.
 */
export function ImageRoot<T extends keyof SeidrElementTagNameMap = "span">(
  render: (api: ImageScopedApi) => SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ImageRoot<T extends keyof SeidrElementTagNameMap = "span">(
  props: ImageRootProps<T> | null | undefined,
  render: (api: ImageScopedApi) => SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ImageRoot<T extends keyof SeidrElementTagNameMap = "span">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ImageRoot<T extends keyof SeidrElementTagNameMap = "span">(
  props?: ImageRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function ImageRoot<T extends keyof SeidrElementTagNameMap = "span">(
  propsOrChildren?:
    | ImageRootProps<T>
    | ((api: ImageScopedApi) => SeidrChild | SeidrChild[])
    | SeidrChild
    | SeidrChild[]
    | null,
  children?: ((api: ImageScopedApi) => SeidrChild | SeidrChild[]) | SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: ImageRootProps<T>;
  let content: ((api: ImageScopedApi) => SeidrChild | SeidrChild[]) | SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as ImageRootProps<T>) ?? ({} as ImageRootProps<T>);
    content = children;
  } else {
    props = {} as ImageRootProps<T>;
    content = propsOrChildren as any;
  }

  const { as = "span" as T, fallbackDelay, onLoadingStatusChange, ...rest } = props;

  const scopedApi = createImage({ fallbackDelay, onLoadingStatusChange });

  let resolvedChildren: SeidrChild | SeidrChild[] | undefined;
  if (typeof content === "function") {
    resolvedChildren = imageContext.runWith(scopedApi, () => {
      return (content as (api: ImageScopedApi) => SeidrChild | SeidrChild[])(scopedApi);
    });
  } else {
    resolvedChildren = content;
  }

  const elementProps = {
    ...rest,
    "data-status": scopedApi.status,
  };

  return $(as, elementProps as any, resolvedChildren) as SeidrElementTagNameMap[T];
}

export const Image = Object.assign(ImageRoot, {
  Root: ImageRoot,
  Img: ImageImg,
  Fallback: ImageFallback,
  create: createImage,
});
