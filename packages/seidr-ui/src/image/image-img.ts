import { isStr, isUndef } from "@fimbul-works/hvat";
import {
  $,
  inClient,
  isServer,
  isValidSeidrChild,
  isValue,
  onUnmounted,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  type Value,
} from "@fimbul-works/seidr";
import { type ImageContextValue, useImageContext } from "./image-context.js";

export interface ImageImgOptions<T extends keyof SeidrElementTagNameMap = "img"> {
  /**
   * The HTML element tag name to render.
   * @default "img"
   */
  as?: T;
  /**
   * The image URL to load.
   */
  src?: ReactiveValue<string>;
  /**
   * Accessible alternative text description.
   */
  alt?: ReactiveValue<string>;
  /**
   * CORS settings attribute.
   */
  crossOrigin?: "anonymous" | "use-credentials" | "";
  /**
   * Referrer policy attribute.
   */
  referrerPolicy?: ReferrerPolicy;
}

export type ImageImgProps<T extends keyof SeidrElementTagNameMap = "img"> = ImageImgOptions<T> &
  Omit<SeidrElementProps<T>, "src" | "alt" | "crossOrigin" | "referrerPolicy">;

/**
 * Image.Img renders an image element once it has successfully loaded.
 */
export function ImageImg<T extends keyof SeidrElementTagNameMap = "img">(
  children?: SeidrChild | SeidrChild[],
): Value<SeidrElementTagNameMap[T] | null>;
export function ImageImg<T extends keyof SeidrElementTagNameMap = "img">(
  props?: ImageImgProps<T> | null,
  children?: SeidrChild | SeidrChild[],
  explicitContext?: ImageContextValue,
): Value<SeidrElementTagNameMap[T] | null>;
export function ImageImg<T extends keyof SeidrElementTagNameMap = "img">(
  propsOrChildren?: ImageImgProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
  explicitContext?: ImageContextValue,
): Value<SeidrElementTagNameMap[T] | null> {
  let props: ImageImgProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as ImageImgProps<T>) ?? ({} as ImageImgProps<T>);
    content = children;
  } else {
    props = {} as ImageImgProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "img" as T, src, alt, crossOrigin, referrerPolicy, ...rest } = props;

  const context = explicitContext ?? useImageContext();

  let active = true;

  const updateStatus = (nextUrl: string | undefined) => {
    if (!nextUrl) {
      context.status("error");
      context.onLoadingStatusChange?.("error");
      return;
    }

    context.status("loading");
    context.onLoadingStatusChange?.("loading");

    if (isServer()) return;

    const image = new window.Image();
    if (!isUndef(crossOrigin)) image.crossOrigin = crossOrigin;
    if (!isUndef(referrerPolicy)) image.referrerPolicy = referrerPolicy;

    image.onload = () => {
      if (!active) return;
      context.status("loaded");
      context.onLoadingStatusChange?.("loaded");
    };

    image.onerror = () => {
      if (!active) return;
      context.status("error");
      context.onLoadingStatusChange?.("error");
    };

    image.src = nextUrl;
  };

  const resolveUrl = (val: unknown): string | undefined => (isStr(val) ? val : undefined);

  inClient(() => {
    if (isValue(src)) {
      updateStatus(resolveUrl(src()));
      const unbind = src.watch((nextUrl) => {
        if (active) updateStatus(resolveUrl(nextUrl));
      });
      onUnmounted(() => {
        active = false;
        unbind();
      });
    } else {
      updateStatus(resolveUrl(src));
      onUnmounted(() => {
        active = false;
      });
    }
  });

  const elementProps: Record<string, any> = {
    ...rest,
  };
  if (!isUndef(src)) elementProps.src = src;
  if (!isUndef(alt)) elementProps.alt = alt;
  if (!isUndef(crossOrigin)) elementProps.crossOrigin = crossOrigin;
  if (!isUndef(referrerPolicy)) elementProps.referrerPolicy = referrerPolicy;

  return context.status.as((s) => (s === "loaded" ? ($(as, elementProps as any, content) as any) : null));
}
