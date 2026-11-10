import { isFn } from "@fimbul-works/hvat";
import { $, createRef, mergeStyleProps, type SeidrElementProps, SeidrError } from "@fimbul-works/seidr";
import { DATA_COMPONENT_FILE_FIELD, DATA_PART_HIDDEN_INPUT } from "../constants.js";
import type { FileFieldHiddenInputProps } from "./types.js";

const HIDDEN_STYLES: Record<string, string | number> = {
  border: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap",
};

/**
 * Visually hidden native `<input type="file">` element.
 */
export function FileFieldHiddenInput(
  props: FileFieldHiddenInputProps = {} as FileFieldHiddenInputProps,
): HTMLInputElement {
  const {
    instance,
    dataComponent = DATA_COMPONENT_FILE_FIELD,
    ref: userRef,
    onchange: userOnChange,
    style: userStyle,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldHiddenInput requires an instance coordinator");
  }

  const internalRef = createRef<HTMLInputElement>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      instance.fileInputRef(el);
    }
  });

  const handleChange = (e: Event) => {
    if (isFn(userOnChange)) {
      Reflect.apply(userOnChange, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (instance.isDisabled() || instance.isReadOnly()) return;

    const target = e.currentTarget as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    instance.processFiles(files);
    target.value = "";
  };

  return $("input", {
    ref: internalRef,
    type: "file",
    id: instance.inputId,
    accept: instance.accept,
    multiple: instance.multiple,
    required: instance.isRequired,
    disabled: instance.isDisabled,
    readOnly: instance.isReadOnly,
    tabIndex: -1,
    ariaHidden: "true",
    style: mergeStyleProps(HIDDEN_STYLES, userStyle),
    dataComponent,
    dataPart: DATA_PART_HIDDEN_INPUT,
    onchange: handleChange,
    ...rest,
  } as SeidrElementProps<"input">);
}
