import { createComponent, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createTextField } from "./create-text-field.js";
import type { TextFieldProps, TextFieldRootProps } from "./types.js";

/**
 * Unified all-in-one TextField component (Tier 1).
 * Coordinates a text input (single-line or multi-line) with label, description, and error message.
 */
export const TextField = createComponent(
  <T extends keyof SeidrElementTagNameMap = "div">(props: TextFieldProps<T> = {}): SeidrElementTagNameMap[T] => {
    const {
      as = "div" as T,
      id,
      name,
      value,
      defaultValue,
      onChange,
      validationState,
      required,
      disabled,
      readOnly,
      fieldId,
      label,
      description,
      errorMessage,
      placeholder,
      multiline = false,
      autoResize = false,
      submitOnEnter = false,
      rootProps = {},
      labelProps = {},
      inputProps = {},
      textAreaProps = {},
      descriptionProps = {},
      errorMessageProps = {},
      children,
      ...restProps
    } = props;

    const instance = createTextField({
      id,
      name,
      value,
      defaultValue,
      onChange,
      validationState,
      required,
      disabled,
      readOnly,
      fieldId,
    });

    const fieldElement = multiline
      ? instance.TextArea({
          autoResize,
          submitOnEnter,
          placeholder,
          ...textAreaProps,
        })
      : instance.Input({
          placeholder,
          ...inputProps,
        });

    return instance.Root({ as, ...restProps, ...rootProps } as Omit<TextFieldRootProps<T>, "instance">, [
      label ? instance.Label(labelProps, label) : null,
      fieldElement,
      description ? instance.Description(descriptionProps, description) : null,
      errorMessage ? instance.ErrorMessage(errorMessageProps, errorMessage) : null,
      children,
    ]);
  },
  "TextField",
);
