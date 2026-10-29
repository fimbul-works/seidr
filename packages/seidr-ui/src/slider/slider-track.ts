import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { SliderTrackProps } from "./types.js";

/**
 * Visual rail container for the slider thumb and fill.
 */
export function SliderTrack<T extends keyof SeidrElementTagNameMap = "div">(
  props: SliderTrackProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: slider, ref: userRef, onpointerdown: userOnPointerDown, ...rest } = props;

  if (!slider) {
    throw new SeidrError("SliderTrack requires an instance coordinator");
  }

  const trackRef = createRef<SeidrElementTagNameMap[T]>();
  trackRef.bind((el) => {
    if (userRef && el) {
      if (isFn(userRef)) {
        Reflect.apply(userRef, null, [el]);
      }
    }
    if (el) {
      slider.registerTrack(el);
    }
  });

  const handlePointerDown = (e: PointerEvent) => {
    if (isFn(userOnPointerDown)) {
      Reflect.apply(userOnPointerDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;
    slider.handleTrackPointerDown(e);
  };

  return $(
    as as T,
    {
      ref: trackRef,
      onpointerdown: handlePointerDown,
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: "slider",
      dataPart: "track",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
