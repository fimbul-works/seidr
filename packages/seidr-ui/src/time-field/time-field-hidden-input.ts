import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrElementProps,
  SeidrError,
} from "@fimbul-works/seidr";
import type { TimeFieldHiddenInputProps } from "./types.js";
import { parseTime } from "./util.js";

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
 * Visually hidden native `<input type="text">` element that holds the formatted time for form submission.
 */
export function TimeFieldHiddenInput(
  props: TimeFieldHiddenInputProps = {} as TimeFieldHiddenInputProps,
): HTMLInputElement {
  const {
    instance,
    dataComponent = "time-field",
    ref: userRef,
    onchange: userOnChange,
    style: userStyle,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("TimeFieldHiddenInput requires an instance coordinator");
  }

  const internalRef = createRef<HTMLInputElement>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
  });

  const handleChange = (e: Event) => {
    if (isFn(userOnChange)) {
      Reflect.apply(userOnChange, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (instance.isDisabled() || instance.isReadOnly()) return;

    const target = e.currentTarget as HTMLInputElement;
    const parsed = parseTime(target.value);
    instance.setValue(parsed);
  };

  const mergedStyle =
    typeof userStyle === "object" && userStyle !== null
      ? { ...HIDDEN_STYLES, ...userStyle }
      : HIDDEN_STYLES;

  return $("input", {
    ref: internalRef,
    type: "text",
    name: instance.formControl.name,
    value: instance.formattedValue,
    required: instance.isRequired,
    disabled: instance.isDisabled,
    readOnly: instance.isReadOnly,
    tabIndex: -1,
    ariaHidden: "true",
    style: mergedStyle,
    dataComponent,
    dataPart: "hidden-input",
    onchange: handleChange,
    ...rest,
  } as SeidrElementProps<"input">);
}

