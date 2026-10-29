import {
  $,
  inClient,
  onMounted,
  onUnmounted,
  type Ref,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { combineAriaDescribedBy, combineAriaLabelledBy, extractAriaProps } from "../utils/aria.js";
import type { TextFieldTextAreaProps } from "./types.js";

function adjustHeight(el: HTMLTextAreaElement): void {
  const prevAlignment = el.style.alignSelf;
  const prevOverflow = el.style.overflow;

  const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox");
  if (!isFirefox) {
    el.style.overflow = "hidden";
  }

  el.style.alignSelf = "start";
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + (el.offsetHeight - el.clientHeight)}px`;
  el.style.overflow = prevOverflow;
  el.style.alignSelf = prevAlignment;
}

/**
 * TextFieldTextArea multi-line textarea subcomponent with optional auto-resizing
 * and submit-on-enter capabilities.
 */
export function TextFieldTextArea<T extends keyof SeidrElementTagNameMap = "textarea">(
  props: TextFieldTextAreaProps<T> = {},
): SeidrElementTagNameMap[T] {
  const { as = "textarea" as T } = props;
  const [aria, restProps] = extractAriaProps(props);

  const {
    instance: tf,
    id: customId,
    name,
    value,
    required,
    disabled,
    readOnly,
    readonly,
    autoResize = false,
    submitOnEnter = false,
    ref: userRef,
    oninput,
    onkeydown,
    dataComponent = "text-field",
    dataPart = "text-area",
    ...rest
  } = restProps;

  if (!tf) {
    throw new SeidrError("TextFieldTextArea requires an instance coordinator");
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
    tf.textAreaRef.bind((el) => {
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (submitOnEnter && e.key === "Enter" && !e.shiftKey) {
      const el = e.currentTarget;
      if (el instanceof HTMLTextAreaElement && el.form) {
        el.form.requestSubmit();
        e.preventDefault();
      }
    }
    if (typeof onkeydown === "function") {
      Reflect.apply(onkeydown, e.currentTarget, [e]);
    }
  };

  inClient(() => {
    if (autoResize) {
      onMounted(() => {
        const el = tf.textAreaRef();
        if (el) adjustHeight(el);
      });

      tf.value.watch(() => {
        const el = tf.textAreaRef();
        if (el) adjustHeight(el);
      });
    }
  });

  return $<T>(as, {
    id: effectiveId,
    name: name ?? tf.formControl.name,
    value: value ?? tf.value,
    required: required ?? tf.formControl.isRequired,
    disabled: disabled ?? tf.formControl.isDisabled,
    readOnly: readOnly ?? readonly ?? tf.formControl.isReadOnly,
    ref: tf.textAreaRef as unknown as Ref<SeidrElementTagNameMap[T]>,
    oninput: handleInput,
    onkeydown: handleKeyDown,
    "aria-multiline": submitOnEnter ? "false" : undefined,
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
