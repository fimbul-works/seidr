import type { DerivedValue, SeidrChild, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { TextFieldDescription } from "./text-field-description.js";
import { TextFieldErrorMessage } from "./text-field-error-message.js";
import { TextFieldInput } from "./text-field-input.js";
import { TextFieldLabel } from "./text-field-label.js";
import { TextFieldRoot } from "./text-field-root.js";
import { TextFieldTextArea } from "./text-field-text-area.js";
import type {
  TextFieldDescriptionProps,
  TextFieldErrorMessageProps,
  TextFieldInputProps,
  TextFieldInstance,
  TextFieldLabelProps,
  TextFieldRootProps,
  TextFieldTextAreaProps,
  UseTextFieldOptions,
} from "./types.js";
import { useTextField } from "./use-text-field.js";

/**
 * Creates a fine-grained coordinator for a TextField component (Tier 2).
 * Returns reactive state and pre-bound subcomponent factories (Root, Label, Input, TextArea, Description, ErrorMessage).
 */
export function createTextField(options: UseTextFieldOptions = {}): TextFieldInstance {
  const instance = useTextField(options);

  return {
    ...instance,
    Root: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: Omit<TextFieldRootProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ): SeidrElementTagNameMap[T] => TextFieldRoot({ instance, ...props } as TextFieldRootProps<T>, children),

    Label: <T extends keyof SeidrElementTagNameMap = "label">(
      props?: Omit<TextFieldLabelProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ): SeidrElementTagNameMap[T] => TextFieldLabel({ instance, ...props } as TextFieldLabelProps<T>, children),

    Input: <T extends keyof SeidrElementTagNameMap = "input">(
      props?: Omit<TextFieldInputProps<T>, "instance">,
    ): SeidrElementTagNameMap[T] => TextFieldInput({ instance, ...props } as TextFieldInputProps<T>),

    TextArea: <T extends keyof SeidrElementTagNameMap = "textarea">(
      props?: Omit<TextFieldTextAreaProps<T>, "instance">,
    ): SeidrElementTagNameMap[T] => TextFieldTextArea({ instance, ...props } as TextFieldTextAreaProps<T>),

    Description: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: Omit<TextFieldDescriptionProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ): SeidrElementTagNameMap[T] =>
      TextFieldDescription({ instance, ...props } as TextFieldDescriptionProps<T>, children),

    ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: Omit<TextFieldErrorMessageProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
      TextFieldErrorMessage({ instance, ...props } as TextFieldErrorMessageProps<T>, children),
  };
}
