import {
  $,
  type DerivedValue,
  type ObservableValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  wrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_IMAGE, DATA_PART_FALLBACK } from "../constants.js";
import type { UseImageResult } from "./use-image.js";

export interface ImageFallbackOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  /**
   * The HTML element tag name to render.
   * @default "span"
   */
  as?: T;

  /**
   * Bound Image instance or state providing reactive loading status.
   */
  instance?: UseImageResult;

  /**
   * Direct reactive condition controlling whether the fallback should render.
   */
  canRender?: ObservableValue<boolean>;
}

export type ImageFallbackProps<T extends keyof SeidrElementTagNameMap = "span"> = ImageFallbackOptions<T> &
  SeidrElementProps<T>;

/**
 * Image.Fallback renders content when the image hasn't loaded (whilst loading or on error).
 */
export function ImageFallback<T extends keyof SeidrElementTagNameMap = "span">(
  props: ImageFallbackProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { as = "span" as T, instance, canRender, ...rest } = props;

  if (!instance) {
    throw new SeidrError("ImageFallback requires an instance coordinator");
  }

  const renderEl = () =>
    $(
      as,
      {
        dataComponent: DATA_COMPONENT_IMAGE,
        dataPart: DATA_PART_FALLBACK,
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );
  const condition = wrapValue(canRender ?? instance.canRenderFallback);

  return Show(condition, renderEl) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
