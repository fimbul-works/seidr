import {
  $,
  onUnmounted,
  type Ref,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { combineAriaDescribedBy, combineAriaLabelledBy, extractAriaProps } from "../utils/aria.js";
import type { TextFieldInputProps } from "./types.js";

/**
 * TextFieldInput single-line text input subcomponent.
 */
export function TextFieldInput<T extends keyof SeidrElementTagNameMap = "input">(
  props: TextFieldInputProps<T> = {},
): SeidrElementTagNameMap[T] {
  const { as = "input" as T } = props;
  const [aria, restProps] = extractAriaProps(props);

  const {
    instance: tf,
    id: customId,
    type = "text",
    name,
    value,
    required,
    disabled,
    readOnly,
    readonly,
    ref: userRef,
    oninput,
    dataComponent = "text-field",
    dataPart = "input",
    ...rest
  } = restProps;

  if (!tf) {
    throw new SeidrError("TextFieldInput requires an instance coordinator");
  }

  const effectiveId = customId ?? tf.formControl.fieldId;
  onUnmounted(tf.formControl.registerField(effectiveId));

  const effectiveAriaLabelledBy = combineAriaLabelledBy({
    ariaLabelledBy: aria.ariaLabelledBy,
    ariaLabel: aria.ariaLabel,
    internalLabelId: tf.formControl.labelId,
    fieldId: effectiveId,
  });

  const effectiveAriaDescribedBy = combineAriaDescribedBy({
    ariaDescribedBy: aria.ariaDescribedBy,
    internalDescribedBy: tf.formControl.ariaDescribedBy,
  });

  if (userRef) {
    tf.inputRef.bind((el) => {
      if (typeof userRef === "function") {
        Reflect.apply(userRef, null, [el]);
      }
    });
  }

  const handleInput = (e: Event) => {
    tf.onInput(e);
    if (typeof oninput === "function") {
      Reflect.apply(oninput, e.currentTarget, [e]);
    }
  };

  return $<T>(as, {
    type,
    id: effectiveId,
    name: name ?? tf.formControl.name,
    value: value ?? tf.value,
    required: required ?? tf.formControl.isRequired,
    disabled: disabled ?? tf.formControl.isDisabled,
    readOnly: readOnly ?? readonly ?? tf.formControl.isReadOnly,
    ref: tf.inputRef as unknown as Ref<SeidrElementTagNameMap[T]>,
    oninput: handleInput,
    "aria-invalid": tf.formControl.isInvalid.as((inv) => (inv ? "true" : undefined)),
    "aria-required": tf.formControl.isRequired.as((req) => (req ? "true" : undefined)),
    "aria-disabled": tf.formControl.isDisabled.as((dis) => (dis ? "true" : undefined)),
    "aria-readonly": tf.formControl.isReadOnly.as((ro) => (ro ? "true" : undefined)),
    "aria-labelledby": effectiveAriaLabelledBy,
    "aria-describedby": effectiveAriaDescribedBy,
    dataComponent,
    dataPart,
    ...tf.dataset,
    ...rest,
  } as SeidrElementProps<T>);
}
