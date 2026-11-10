import { isFn } from "@fimbul-works/hvat";
import { $, createRef, type SeidrElementProps, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_COMBOBOX, DATA_PART_INPUT } from "../constants.js";
import type { ComboboxInputProps } from "./types.js";

/**
 * Editable text input element for searching and filtering combobox options.
 */
export function ComboboxInput<T extends keyof SeidrElementTagNameMap = "input">(
  props: ComboboxInputProps<T> = {} as ComboboxInputProps<T>,
): SeidrElementTagNameMap[T] {
  const {
    as = "input" as T,
    instance: combobox,
    dataComponent = DATA_COMPONENT_COMBOBOX,
    id: userId,
    ref: userRef,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    oninput: userOnInput,
    onkeydown: userOnKeyDown,
    onfocus: userOnFocus,
    onblur: userOnBlur,
    onclick: userOnClick,
    ...rest
  } = props;

  if (!combobox) {
    throw new SeidrError("ComboboxInput requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    combobox.inputRef(el as unknown as HTMLInputElement);
  });

  const handleInput = (e: Event) => {
    if (typeof userOnInput === "function") {
      Reflect.apply(userOnInput, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      combobox.handleInput(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (typeof userOnKeyDown === "function") {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      combobox.handleInputKeyDown(e);
    }
  };

  const handleFocus = (e: FocusEvent) => {
    if (typeof userOnFocus === "function") {
      Reflect.apply(userOnFocus, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      combobox.handleInputFocus(e);
    }
  };

  const handleBlur = (e: FocusEvent) => {
    if (typeof userOnBlur === "function") {
      Reflect.apply(userOnBlur, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      combobox.handleInputBlur(e);
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (typeof userOnClick === "function") {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      combobox.handleInputClick(e);
    }
  };

  return $(as, {
    ref: internalRef,
    id: userId ?? combobox.inputId,
    type: "text",
    role: "combobox",
    dataComponent,
    dataPart: DATA_PART_INPUT,
    value: combobox.inputValue,
    disabled: combobox.isDisabled,
    readonly: combobox.isReadOnly,
    required: combobox.isRequired,
    placeholder: combobox.placeholder,
    autocomplete: "off",
    autocorrect: "off",
    spellcheck: false,
    ariaHaspopup: "listbox",
    ariaAutocomplete: "list",
    ariaExpanded: combobox.isOpen.as((o) => (o ? "true" : "false")),
    ariaControls: combobox.isOpen.as((o) => (o ? combobox.listboxId : undefined)),
    ariaActivedescendant: combobox.activeDescendantId,
    ariaLabel,
    ariaLabelledby: ariaLabelledBy ?? combobox.labelId,
    ariaDescribedby: ariaDescribedBy ?? combobox.descriptionId,
    ariaInvalid: combobox.validationState.as((s) => (s === "invalid" ? "true" : undefined)),
    ariaRequired: combobox.isRequired.as((r) => (r ? "true" : undefined)),
    ariaDisabled: combobox.isDisabled.as((d) => (d ? "true" : undefined)),
    ariaReadonly: combobox.isReadOnly.as((r) => (r ? "true" : undefined)),
    oninput: handleInput,
    onkeydown: handleKeyDown,
    onfocus: handleFocus,
    onblur: handleBlur,
    onclick: handleClick,
    ...rest,
  } as SeidrElementProps<T>);
}
