import { $, createComponent, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { DATA_COMPONENT_NUMBER_FIELD, DATA_PART_CONTROLS, DATA_PART_GROUP } from "../constants.js";
import { createNumberField } from "./create-number-field.js";
import type { NumberFieldProps } from "./types.js";

/**
 * Unified all-in-one NumberField component (Tier 1).
 * Composes a numeric spinbutton input with optional increment/decrement triggers,
 * hidden form submission input, label, description, and error message.
 */
export const NumberField = createComponent(
  <T extends keyof SeidrElementTagNameMap = "div">(props: NumberFieldProps<T> = {}): SeidrElementTagNameMap[T] => {
    const {
      as = "div" as T,
      label,
      description,
      errorMessage,
      placeholder,
      controls = true,
      rootProps = {},
      inputProps = {},
      incrementProps = {},
      decrementProps = {},
      hiddenInputProps = {},
      labelProps = {},
      descriptionProps = {},
      errorMessageProps = {},
      children,
      ...numberFieldOptions
    } = props;

    const nf = createNumberField(numberFieldOptions);

    if (children !== undefined) {
      return nf.Root({ as, ...rootProps }, children);
    }

    const defaultControls = controls
      ? $(
          "div",
          {
            className: "number-field-controls",
            dataComponent: DATA_COMPONENT_NUMBER_FIELD,
            dataPart: DATA_PART_CONTROLS,
          },
          [nf.DecrementTrigger(decrementProps), nf.IncrementTrigger(incrementProps)],
        )
      : null;

    const defaultGroup = $(
      "div",
      {
        className: "number-field-group",
        dataComponent: DATA_COMPONENT_NUMBER_FIELD,
        dataPart: DATA_PART_GROUP,
      },
      [nf.Input({ placeholder, ...inputProps }), defaultControls],
    );

    return nf.Root({ as, ...rootProps }, [
      label ? nf.Label(labelProps, label) : null,
      defaultGroup,
      nf.HiddenInput(hiddenInputProps),
      description ? nf.Description(descriptionProps, description) : null,
      errorMessage ? nf.ErrorMessage(errorMessageProps, errorMessage) : null,
    ]);
  },
  "NumberField",
);
