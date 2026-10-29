import { isFn } from "@fimbul-works/hvat";
import {
  $,
  mergeStyleProps,
  type ReactiveStyleDeclaration,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { extractAriaProps } from "../utils/aria.js";
import type { SliderThumbProps } from "./types.js";

/**
 * Draggable handle element representing a value on the slider (role="slider").
 */
export function SliderThumb<T extends keyof SeidrElementTagNameMap = "span">(
  props: SliderThumbProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [aria, restProps] = extractAriaProps(props);

  const {
    as = "span" as T,
    instance: slider,
    index = 0,
    id: customId,
    style: userStyle,
    onpointerdown: userOnPointerDown,
    onkeydown: userOnKeyDown,
    onfocus: userOnFocus,
    ...rest
  } = restProps;

  if (!slider) {
    throw new SeidrError("SliderThumb requires an instance coordinator");
  }

  const thumbId = customId ?? slider.generateThumbId(index);
  const percent = slider.getThumbPercent(index);
  const isVertical = slider.orientation === "vertical";

  const handlePointerDown = (e: PointerEvent) => {
    if (isFn(userOnPointerDown)) {
      Reflect.apply(userOnPointerDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;
    slider.handleThumbPointerDown(index, e);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;
    slider.handleThumbKeyDown(index, e);
  };

  const handleFocus = (e: FocusEvent) => {
    if (isFn(userOnFocus)) {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }
    slider.focusedThumb(index);
  };

  const baseStyle: ReactiveStyleDeclaration = {
    position: "absolute",
    ...(isVertical
      ? {
          bottom: percent.as((p) => `${p * 100}%`),
          left: "50%",
          transform: "translate(-50%, 50%)",
        }
      : {
          left: percent.as((p) => `${p * 100}%`),
          top: "50%",
          transform: "translate(-50%, -50%)",
        }),
  };

  const ariaLabel = aria.ariaLabel;
  const ariaLabelledby = aria.ariaLabelledBy ?? (ariaLabel ? undefined : `${slider.id}-label`);

  return $(
    as as T,
    {
      id: thumbId,
      role: "slider",
      tabIndex: slider.isDisabled.as((d) => (d ? undefined : 0)),
      ariaLabel,
      ariaLabelledby,
      ariaValuemin: slider.minValue,
      ariaValuemax: slider.maxValue,
      ariaValuenow: slider.values.as((v) => v[index] ?? slider.minValue),
      ariaValuetext: slider.values.as((v) => String(v[index] ?? slider.minValue)),
      ariaOrientation: slider.orientation,
      ariaDisabled: slider.isDisabled.as((d) => (d ? "true" : undefined)),
      ariaReadonly: slider.isReadOnly.as((r) => (r ? "true" : undefined)),
      onpointerdown: handlePointerDown,
      onkeydown: handleKeyDown,
      onfocus: handleFocus,
      style: mergeStyleProps(baseStyle, userStyle),
      dataOrientation: slider.orientation,
      dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
      dataDragging: slider.isDragging.as((d) => (d ? "" : undefined)),
      dataComponent: "slider",
      dataPart: "thumb",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
