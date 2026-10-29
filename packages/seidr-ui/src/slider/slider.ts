import { createComponent } from "@fimbul-works/seidr";
import { createSlider } from "./create-slider.js";
import type { SliderProps, SliderRootProps } from "./types.js";

/**
 * Unified all-in-one Slider component.
 * Creates an accessible continuous or stepped slider with full WAI-ARIA compliance in one call.
 */
export const Slider = createComponent((props: SliderProps = {}) => {
  const {
    id,
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    minValue,
    maxValue,
    step,
    minStepsBetweenThumbs,
    orientation = "horizontal",
    inverted,
    disabled,
    readOnly,
    name,
    getValueLabel,
    as = "div",
    label,
    valueLabel,
    description,
    errorMessage,
    thumbs,
    rootProps = {},
    trackProps = {},
    fillProps = {},
    thumbProps = {},
    inputProps = {},
    children,
  } = props;

  const slider = createSlider({
    id,
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    minValue,
    maxValue,
    step,
    minStepsBetweenThumbs,
    orientation,
    inverted,
    disabled,
    readOnly,
    name,
    getValueLabel,
  });

  const thumbCount =
    thumbs ??
    (Array.isArray(value)
      ? value.length
      : Array.isArray(defaultValue)
        ? defaultValue.length
        : 1);

  const thumbElements = Array.from({ length: thumbCount }, (_, index) =>
    slider.Thumb({ index, ...(thumbProps ?? {}) }),
  );

  const inputElements = Array.from({ length: thumbCount }, (_, index) =>
    slider.Input({ index, ...(inputProps ?? {}) }),
  );

  const trackElement = slider.Track(trackProps, [
    slider.Fill(fillProps),
    ...thumbElements,
    ...inputElements,
  ]);

  return slider.Root({ as, ...rootProps } as Omit<SliderRootProps<"div">, "instance">, [
    label ? slider.Label({}, label) : null,
    valueLabel ? slider.ValueLabel({}, typeof valueLabel === "boolean" ? undefined : valueLabel) : null,
    trackElement,
    description ? slider.Description({}, description) : null,
    errorMessage ? slider.ErrorMessage({}, errorMessage) : null,
    children,
  ]);
}, "Slider");
