import type {
  SeidrChild,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { TimeFieldDescription } from "./time-field-description.js";
import { TimeFieldErrorMessage } from "./time-field-error-message.js";
import { TimeFieldHiddenInput } from "./time-field-hidden-input.js";
import { TimeFieldInput } from "./time-field-input.js";
import { TimeFieldLabel } from "./time-field-label.js";
import { TimeFieldRoot } from "./time-field-root.js";
import { TimeFieldSegment } from "./time-field-segment.js";
import { TimeFieldSeparator } from "./time-field-separator.js";
import { TimeFieldValueDescription } from "./time-field-value-description.js";
import type {
  TimeFieldDescriptionProps,
  TimeFieldErrorMessageProps,
  TimeFieldHiddenInputProps,
  TimeFieldInputProps,
  TimeFieldInstance,
  TimeFieldLabelProps,
  TimeFieldRootProps,
  TimeFieldSegmentProps,
  TimeFieldSeparatorProps,
  TimeFieldValueDescriptionProps,
  UseTimeFieldOptions,
} from "./types.js";
import { useTimeField } from "./use-time-field.js";

/**
 * Creates a headless coordinator for a TimeField system (Tier 2).
 * Returns pre-bound element helpers and fine-grained reactive state.
 */
export function createTimeField(
  options: UseTimeFieldOptions = {},
): TimeFieldInstance {
  const timeField = useTimeField(options);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: TimeFieldRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TimeFieldRoot<T>(
      { instance: timeField, ...props } as TimeFieldRootProps<T>,
      children,
    );

  const Label = <T extends keyof SeidrElementTagNameMap = "label">(
    props?: TimeFieldLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TimeFieldLabel<T>(
      { instance: timeField, ...props } as TimeFieldLabelProps<T>,
      children,
    );

  const Input = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: TimeFieldInputProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TimeFieldInput<T>(
      { instance: timeField, ...props } as TimeFieldInputProps<T>,
      children,
    );

  const Segment = <T extends keyof SeidrElementTagNameMap = "div">(
    props: TimeFieldSegmentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TimeFieldSegment<T>(
      { instance: timeField, ...props } as TimeFieldSegmentProps<T>,
      children,
    );

  const Separator = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: TimeFieldSeparatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TimeFieldSeparator<T>(
      { instance: timeField, ...props } as TimeFieldSeparatorProps<T>,
      children,
    );

  const HiddenInput = (
    props?: TimeFieldHiddenInputProps,
  ): HTMLInputElement =>
    TimeFieldHiddenInput({
      instance: timeField,
      ...props,
    });

  const ValueDescription = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: TimeFieldValueDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TimeFieldValueDescription<T>(
      { instance: timeField, ...props } as TimeFieldValueDescriptionProps<T>,
      children,
    );

  const Description = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: TimeFieldDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TimeFieldDescription<T>(
      { instance: timeField, ...props } as TimeFieldDescriptionProps<T>,
      children,
    );

  const ErrorMessage = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: TimeFieldErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TimeFieldErrorMessage<T>(
      { instance: timeField, ...props } as TimeFieldErrorMessageProps<T>,
      children,
    );

  return {
    ...timeField,
    Root,
    Label,
    Input,
    Segment,
    Separator,
    HiddenInput,
    ValueDescription,
    Description,
    ErrorMessage,
  };
}

