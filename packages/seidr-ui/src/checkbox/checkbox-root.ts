import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  type Value,
} from "@fimbul-works/seidr";
import {
  FormControlDescription,
  type FormControlDescriptionProps,
} from "../form-control/form-control-description.js";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "../form-control/form-control-error-message.js";
import {
  FormControlLabel,
  type FormControlLabelProps,
} from "../form-control/form-control-label.js";
import { CheckboxControl, type CheckboxControlProps } from "./checkbox-control.js";
import { CheckboxIndicator, type CheckboxIndicatorProps } from "./checkbox-indicator.js";
import { CheckboxInput, type CheckboxInputProps } from "./checkbox-input.js";
import type { CheckboxInstance, UseCheckboxOptions, UseCheckboxResult } from "./types.js";
import { useCheckbox } from "./use-checkbox.js";

/**
 * Creates a checkbox state coordinator instance with pre-bound compound element helpers.
 */
export function createCheckbox(options: UseCheckboxOptions = {}): CheckboxInstance {
  const instance = useCheckbox(options);

  return {
    ...instance,
    Root: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return CheckboxRoot({ instance, ...props }, content);
    },
    Input: (props = {}) => CheckboxInput({ instance, ...props }),
    Control: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return CheckboxControl({ instance, ...props }, content);
    },
    Indicator: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return CheckboxIndicator({ instance, ...props }, content);
    },
    Label: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return FormControlLabel(
        { instance: instance.formControl, ...instance.dataset, ...props },
        content,
      );
    },
    Description: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return FormControlDescription(
        { instance: instance.formControl, ...instance.dataset, ...props },
        content,
      );
    },
    ErrorMessage: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return FormControlErrorMessage(
        { instance: instance.formControl, ...instance.dataset, ...props },
        content,
      );
    },
  };
}

export interface CheckboxRootOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends UseCheckboxOptions {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit checkbox instance providing reactive state.
   */
  instance?: UseCheckboxResult;
}

export type CheckboxRootProps<T extends keyof SeidrElementTagNameMap = "div"> =
  CheckboxRootOptions<T> & SeidrElementProps<T>;

/**
 * CheckboxRoot is the outer container for a checkbox widget (role="group").
 */
export function CheckboxRoot<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props?: CheckboxRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxRoot<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CheckboxRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: CheckboxRootProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as CheckboxRootProps<T>) ?? ({} as CheckboxRootProps<T>);
    content = children;
  } else {
    props = {} as CheckboxRootProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const {
    as = "div" as T,
    instance,
    id,
    name,
    checked,
    defaultChecked,
    onChange,
    indeterminate,
    value,
    validationState,
    required,
    disabled,
    readOnly,
    onpointerdown,
    ...rest
  } = props as any;

  const cb =
    instance ??
    useCheckbox({
      id,
      name,
      checked,
      defaultChecked,
      onChange,
      indeterminate,
      value,
      validationState,
      required,
      disabled,
      readOnly,
    });

  const handlePointerDown = (e: PointerEvent) => {
    (onpointerdown as any)?.(e);
    if (e.defaultPrevented) return;

    // For consistency with native controls, prevent blur on pointerdown when already focused
    if (cb.isFocused()) {
      e.preventDefault();
    }
  };

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      role: "group",
      id: cb.id,
      ref: cb.rootRef,
      ...cb.dataset,
      onpointerdown: handlePointerDown,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}

/**
 * CheckboxLabel standalone component.
 */
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props?: FormControlLabelProps<T> & { instance?: UseCheckboxResult } | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxLabel<T extends keyof SeidrElementTagNameMap = "label">(
  propsOrChildren?: any,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: any;
  let content: any;
  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = propsOrChildren ?? {};
    content = children;
  } else {
    props = {};
    content = propsOrChildren;
  }
  const { instance, ...rest } = props;
  const form = instance?.formControl ?? instance;
  return FormControlLabel(
    { instance: form, ...(instance ? instance.dataset : {}), ...rest },
    content,
  );
}

/**
 * CheckboxDescription standalone component.
 */
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props?: FormControlDescriptionProps<T> & { instance?: UseCheckboxResult } | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxDescription<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: any,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: any;
  let content: any;
  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = propsOrChildren ?? {};
    content = children;
  } else {
    props = {};
    content = propsOrChildren;
  }
  const { instance, ...rest } = props;
  const form = instance?.formControl ?? instance;
  return FormControlDescription(
    { instance: form, ...(instance ? instance.dataset : {}), ...rest },
    content,
  );
}

/**
 * CheckboxErrorMessage standalone component.
 */
export function CheckboxErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CheckboxErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  props?: FormControlErrorMessageProps<T> & { instance?: UseCheckboxResult } | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CheckboxErrorMessage<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: any,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null> {
  let props: any;
  let content: any;
  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = propsOrChildren ?? {};
    content = children;
  } else {
    props = {};
    content = propsOrChildren;
  }
  const { instance, ...rest } = props;
  const form = instance?.formControl ?? instance;
  return FormControlErrorMessage(
    { instance: form, ...(instance ? instance.dataset : {}), ...rest },
    content,
  );
}

export interface UnifiedCheckboxProps extends UseCheckboxOptions {
  /** Optional class name for the root container. */
  className?: string;

  /** Accessible label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Optional description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Optional error message text or element. */
  errorMessage?: SeidrChild | SeidrChild[];

  /** Optional custom indicator element. Defaults to checkmark. */
  indicator?: SeidrChild | SeidrChild[];

  /** Props passed to Checkbox.Root. */
  rootProps?: Record<string, any>;

  /** Props passed to Checkbox.Input. */
  inputProps?: CheckboxInputProps;

  /** Props passed to Checkbox.Control. */
  controlProps?: CheckboxControlProps<any>;

  /** Props passed to Checkbox.Indicator. */
  indicatorProps?: CheckboxIndicatorProps<any>;

  /** Props passed to Checkbox.Label. */
  labelProps?: FormControlLabelProps<any>;

  /** Props passed to Checkbox.Description. */
  descriptionProps?: FormControlDescriptionProps<any>;

  /** Props passed to Checkbox.ErrorMessage. */
  errorMessageProps?: FormControlErrorMessageProps<any>;
}

/**
 * Unified all-in-one Checkbox factory function.
 * Creates an accessible checkbox with full WAI-ARIA and form-control integration in one call.
 */
export function Checkbox(options: UnifiedCheckboxProps = {}) {
  const {
    className,
    label,
    description,
    errorMessage,
    indicator,
    rootProps = {},
    inputProps = {},
    controlProps = {},
    indicatorProps = {},
    labelProps = {},
    descriptionProps = {},
    errorMessageProps = {},
    ...checkboxOptions
  } = options;

  const cb = createCheckbox(checkboxOptions);

  return cb.Root({ className, ...rootProps }, [
    cb.Input(inputProps),
    cb.Control(controlProps, [
      cb.Indicator(indicatorProps, indicator ?? "✓"),
    ]),
    label ? cb.Label(labelProps, label) : null,
    description ? cb.Description(descriptionProps, description) : null,
    errorMessage ? cb.ErrorMessage(errorMessageProps, errorMessage) : null,
  ]);
}

Checkbox.create = createCheckbox;
Checkbox.Root = CheckboxRoot;
Checkbox.Input = CheckboxInput;
Checkbox.Control = CheckboxControl;
Checkbox.Indicator = CheckboxIndicator;
Checkbox.Label = CheckboxLabel;
Checkbox.Description = CheckboxDescription;
Checkbox.ErrorMessage = CheckboxErrorMessage;
