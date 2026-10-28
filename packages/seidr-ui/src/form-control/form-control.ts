import { isUndef } from "@fimbul-works/hvat";
import type { SeidrChild, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createFormControl } from "./create-form-control.js";
import { FormControlDescription, type FormControlDescriptionProps } from "./form-control-description.js";
import { FormControlErrorMessage, type FormControlErrorMessageProps } from "./form-control-error-message.js";
import { FormControlLabel, type FormControlLabelProps } from "./form-control-label.js";
import { FormControlRoot, type FormControlRootProps } from "./form-control-root.js";
import type { UseFormControlOptions } from "./types.js";

export interface FormControlProps<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TLabel extends keyof SeidrElementTagNameMap = "label",
  TDescription extends keyof SeidrElementTagNameMap = "div",
  TErrorMessage extends keyof SeidrElementTagNameMap = "div",
> extends UseFormControlOptions {
  /** Tag for root container. Default "div". */
  as?: TRoot;
  /** Props for root container. */
  rootProps?: Omit<
    FormControlRootProps<TRoot>,
    "id" | "name" | "validationState" | "required" | "disabled" | "readOnly" | "fieldId"
  >;
  /** Content for the label. */
  label?: SeidrChild | SeidrChild[];
  /** Props for label element. */
  labelProps?: FormControlLabelProps<TLabel>;
  /** The form field element (e.g. $input(...)). */
  field?: SeidrChild | SeidrChild[];
  /** Helper description text. */
  description?: SeidrChild | SeidrChild[];
  /** Props for description element. */
  descriptionProps?: FormControlDescriptionProps<TDescription>;
  /** Validation error message text. */
  errorMessage?: SeidrChild | SeidrChild[];
  /** Props for error message element. */
  errorMessageProps?: FormControlErrorMessageProps<TErrorMessage>;
  /** Additional children to render in root. */
  children?: SeidrChild | SeidrChild[];
}

/**
 * FormControl component.
 */
export function FormControlFactory<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TLabel extends keyof SeidrElementTagNameMap = "label",
  TDescription extends keyof SeidrElementTagNameMap = "div",
  TErrorMessage extends keyof SeidrElementTagNameMap = "div",
>(props: FormControlProps<TRoot, TLabel, TDescription, TErrorMessage>): SeidrElementTagNameMap[TRoot] {
  const {
    id,
    name,
    validationState,
    required,
    disabled,
    readOnly,
    fieldId,
    as = "div" as TRoot,
    rootProps = {},
    label,
    labelProps = {},
    field,
    description,
    descriptionProps = {},
    errorMessage,
    errorMessageProps = {},
    children,
  } = props;

  const form = createFormControl({
    id,
    name,
    validationState,
    required,
    disabled,
    readOnly,
    fieldId,
  });

  const childrenToRender: SeidrChild[] = [];

  if (!isUndef(label)) {
    childrenToRender.push(form.Label(labelProps as FormControlLabelProps<TLabel>, label));
  }

  if (!isUndef(field)) {
    childrenToRender.push(field);
  }

  if (!isUndef(description)) {
    childrenToRender.push(form.Description(descriptionProps as FormControlDescriptionProps<TDescription>, description));
  }

  if (!isUndef(errorMessage)) {
    childrenToRender.push(
      form.ErrorMessage(errorMessageProps as FormControlErrorMessageProps<TErrorMessage>, errorMessage),
    );
  }

  if (!isUndef(children)) {
    childrenToRender.push(children);
  }

  return form.Root({ as, ...rootProps } as FormControlRootProps<TRoot>, childrenToRender.flat());
}

export const FormControl = Object.assign(FormControlFactory, {
  create: createFormControl,
  Root: FormControlRoot,
  Label: FormControlLabel,
  Description: FormControlDescription,
  ErrorMessage: FormControlErrorMessage,
});
