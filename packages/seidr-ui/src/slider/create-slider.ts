import { SliderDescription } from "./slider-description.js";
import { SliderErrorMessage } from "./slider-error-message.js";
import { SliderFill } from "./slider-fill.js";
import { SliderInput } from "./slider-input.js";
import { SliderLabel } from "./slider-label.js";
import { SliderRoot } from "./slider-root.js";
import { SliderThumb } from "./slider-thumb.js";
import { SliderTrack } from "./slider-track.js";
import { SliderValueLabel } from "./slider-value-label.js";
import type { SliderInstance, UseSliderOptions } from "./types.js";
import { useSlider } from "./use-slider.js";

/**
 * Creates a fine-grained coordinate instance for Slider with pre-bound compound element helpers.
 */
export function createSlider(options: UseSliderOptions = {}): SliderInstance {
  const instance = useSlider(options);

  return {
    ...instance,
    Root: (props: any = {}, children?: any) => SliderRoot({ instance, ...props }, children),
    Track: (props: any = {}, children?: any) => SliderTrack({ instance, ...props }, children),
    Fill: (props: any = {}, children?: any) => SliderFill({ instance, ...props }, children),
    Thumb: (props: any = {}, children?: any) => SliderThumb({ instance, ...props }, children),
    Input: (props: any = {}) => SliderInput({ instance, ...props }),
    Label: (props: any = {}, children?: any) => SliderLabel({ instance, ...props }, children),
    ValueLabel: (props: any = {}, children?: any) => SliderValueLabel({ instance, ...props }, children),
    Description: (props: any = {}, children?: any) => SliderDescription({ instance, ...props }, children),
    ErrorMessage: (props: any = {}, children?: any) => SliderErrorMessage({ instance, ...props }, children),
  };
}
