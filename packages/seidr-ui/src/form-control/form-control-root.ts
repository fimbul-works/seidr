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
} from "./form-control-description.js";
import {
  FormControlErrorMessage,
  type FormControlErrorMessageProps,
} from "./form-control-error-message.js";
import {
  FormControlLabel,
  type FormControlLabelProps,
} from "./form-control-label.js";
import type { UseFormControlOptions, UseFormControlResult } from "./types.js";
import { useFormControl } from "./use-form-control.js";

export interface FormControlInstance extends UseFormControlResult {
  /**
   * Pre-bound FormControl.Root container.
   */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: FormControlRootProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound FormControl.Label element.
   */
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    propsOrChildren?: FormControlLabelProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound FormControl.Description element.
   */
  Description: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: FormControlDescriptionProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound FormControl.ErrorMessage element.
   */
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: FormControlErrorMessageProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
}

/**
 * Creates a form control state instance with pre-bound compound element helpers.
 */
export function createFormControl(options: UseFormControlOptions = {}): FormControlInstance {
  const instance = useFormControl(options);

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
      return FormControlRoot({ instance, ...props }, content);
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
      return FormControlLabel({ instance, ...props }, content);
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
      return FormControlDescription({ instance, ...props }, content);
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
      return FormControlErrorMessage({ instance, ...props }, content);
    },
  };
}

export interface FormControlRootOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends UseFormControlOptions {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit instance providing reactive state.
   */
  instance?: UseFormControlResult;
}

export type FormControlRootProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FormControlRootOptions<T> & SeidrElementProps<T>;

/**
 * FormControlRoot is the top-level container for an accessible form control group.
 */
export function FormControlRoot<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function FormControlRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props?: FormControlRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function FormControlRoot<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: FormControlRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: FormControlRootProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as FormControlRootProps<T>) ?? ({} as FormControlRootProps<T>);
    content = children;
  } else {
    props = {} as FormControlRootProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const {
    as = "div" as T,
    instance,
    id,
    name,
    validationState,
    required,
    disabled,
    readOnly,
    fieldId,
    ...rest
  } = props as any;

  const form =
    instance ??
    useFormControl({
      id,
      name,
      validationState,
      required,
      disabled,
      readOnly,
      fieldId,
    });

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      id: form.id,
      ...form.dataset,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}

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
 * Unified all-in-one FormControl component for standard accessible layouts.
 */
function FormControlUnified<
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
    childrenToRender.push(form.Label(labelProps as any, label));
  }
  if (!isUndef(field)) {
    if (Array.isArray(field)) {
      childrenToRender.push(...field);
    } else {
      childrenToRender.push(field);
    }
  }
  if (!isUndef(description)) {
    childrenToRender.push(form.Description(descriptionProps as any, description));
  }
  if (!isUndef(errorMessage)) {
    childrenToRender.push(form.ErrorMessage(errorMessageProps as any, errorMessage));
  }
  if (!isUndef(children)) {
    if (Array.isArray(children)) {
      childrenToRender.push(...children);
    } else {
      childrenToRender.push(children);
    }
  }

  return form.Root({ as, ...rootProps } as any, childrenToRender);
}

export const FormControl = Object.assign(FormControlUnified, {
  create: createFormControl,
  Root: FormControlRoot,
  Label: FormControlLabel,
  Description: FormControlDescription,
  ErrorMessage: FormControlErrorMessage,
});
