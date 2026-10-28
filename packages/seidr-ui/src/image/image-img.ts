import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  type DerivedValue,
  type ReactiveValue,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  wrapValue,
} from "@fimbul-works/seidr";
import { type UseImageResult } from "./use-image.js";

export interface ImageImgOptions<T extends keyof SeidrElementTagNameMap = "img"> {
  /**
   * The image URL to load.
   */
  src?: ReactiveValue<string | undefined | null>;

  /**
   * The HTML element tag name to render.
   * @default "img"
   */
  as?: T;

  /**
   * Bound Image instance providing reactive loading status.
   */
  instance?: UseImageResult;

  /**
   * Direct reactive condition controlling whether the image element is mounted.
   */
  isLoaded?: DerivedValue<boolean>;

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
  props: ImageImgProps<T>,
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { as = "img" as T, instance, isLoaded, src, alt, crossOrigin, referrerPolicy, ...rest } = props;

  if (!instance) {
    throw new SeidrError("ImageImg requires an instance prop");
  }

  const condition = wrapValue(isLoaded ?? instance.isLoaded);

  const elementProps = {
    dataComponent: "image",
    dataPart: "img",
    ...rest,
  } as ImageImgProps;
  if (!isUndef(src)) elementProps.src = src;
  if (!isUndef(alt)) elementProps.alt = alt;
  if (!isUndef(crossOrigin)) elementProps.crossOrigin = crossOrigin;
  if (!isUndef(referrerPolicy)) elementProps.referrerPolicy = referrerPolicy;

  const renderEl = () => $(as, elementProps as SeidrElementProps<T>);

  return Show(condition, renderEl) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
