import { isFn } from "@fimbul-works/hvat";
import { $, mergeStyleProps, type SeidrElementProps, SeidrError } from "@fimbul-works/seidr";
import { VISUALLY_HIDDEN_STYLES } from "../constants.js";
import { extractAriaProps } from "../utils/aria.js";
import type { SliderInputProps } from "./types.js";

/**
 * Visually hidden native HTML input for form integration and accessibility.
 */
export function SliderInput(props: SliderInputProps = {}): HTMLInputElement {
  const [aria, restProps] = extractAriaProps(props);

  const {
    instance: slider,
    index = 0,
    id: customId,
    name: customName,
    style: userStyle,
    onchange: userOnChange,
    ...rest
  } = restProps;

  if (!slider) {
    throw new SeidrError("SliderInput requires an instance coordinator");
  }

  const inputId = customId ?? slider.generateInputId(index);
  const name = customName ?? (slider.name ? (index === 0 ? slider.name : `${slider.name}[${index}]`) : undefined);

  const handleChange = (e: Event) => {
    if (isFn(userOnChange)) {
      Reflect.apply(userOnChange, e.currentTarget, [e]);
    }
    const target = e.target as HTMLInputElement;
    slider.setThumbValue(index, Number.parseFloat(target.value));
  };

  const ariaLabel = aria.ariaLabel;
  const ariaLabelledby = aria.ariaLabelledBy ?? (ariaLabel ? undefined : `${slider.id}-label`);

  return $("input", {
    id: inputId,
    type: "range",
    name,
    tabIndex: -1,
    min: slider.minValue,
    max: slider.maxValue,
    step: slider.step,
    value: slider.values.as((v) => v[index] ?? slider.minValue),
    disabled: slider.isDisabled,
    ariaLabel,
    ariaLabelledby,
    onchange: handleChange,
    style: mergeStyleProps(VISUALLY_HIDDEN_STYLES, userStyle),
    dataOrientation: slider.orientation,
    dataDisabled: slider.isDisabled.as((d) => (d ? "" : undefined)),
    dataComponent: "slider",
    dataPart: "input",
    ...rest,
  } as SeidrElementProps<"input">);
}
