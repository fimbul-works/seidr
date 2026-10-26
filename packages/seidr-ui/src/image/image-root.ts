import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  Show,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  type Value,
} from "@fimbul-works/seidr";
import { ImageFallback, type ImageFallbackProps } from "./image-fallback.js";
import { ImageImg, type ImageImgProps } from "./image-img.js";
import { useImage, type UseImageOptions, type UseImageResult } from "./use-image.js";

export interface ImageInstance extends UseImageResult {
  /**
   * Pre-bound Image.Root container.
   */
  Root: <T extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren?: ImageRootProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound Image.Img element.
   */
  Img: <T extends keyof SeidrElementTagNameMap = "img">(
    propsOrChildren?: ImageImgProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => Value<SeidrElementTagNameMap[T] | null>;

  /**
   * Pre-bound Image.Fallback container.
   */
  Fallback: <T extends keyof SeidrElementTagNameMap = "span">(
    propsOrChildren?: ImageFallbackProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => Value<SeidrElementTagNameMap[T] | null>;
}

/**
 * Creates an image state instance with pre-bound compound element helpers.
 */
export function createImage(options: UseImageOptions = {}): ImageInstance {
  const instance = useImage(options);

  return {
    ...instance,
    Root: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return ImageRoot({ instance, ...props }, content);
    },
    Img: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return ImageImg({ instance, ...props }, content);
    },
    Fallback: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return ImageFallback({ instance, ...props }, content);
    },
  };
}

export interface ImageRootOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends UseImageOptions {
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
  let props: ImageRootProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as ImageRootProps<T>) ?? ({} as ImageRootProps<T>);
    content = children;
  } else {
    props = {} as ImageRootProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

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

export interface UnifiedImageOptions<T extends keyof SeidrElementTagNameMap = "span">
  extends UseImageOptions {
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

export type UnifiedImageProps<T extends keyof SeidrElementTagNameMap = "span"> = UnifiedImageOptions<T> &
  Omit<SeidrElementProps<T>, "src" | "alt" | "crossOrigin" | "referrerPolicy">;

/**
 * Unified Image component rendering an accessible image with fallback.
 */
export function ImageComponent<T extends keyof SeidrElementTagNameMap = "span">(
  props: UnifiedImageProps<T>,
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
      Show(img.canRenderFallback, () =>
        $(fallbackAs, { className: "image-fallback", ...fallbackProps }, fallback),
      ),
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
