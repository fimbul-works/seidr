import {
  $,
  createComponent,
  type SeidrChild,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { createTimeField } from "./create-time-field.js";
import type { TimeFieldProps, TimeFieldRootProps } from "./types.js";

/**
 * All-in-One Tier 1 TimeField component.
 * Provides an accessible time input using segmented tokens (hours, minutes, seconds, AM/PM)
 * with keyboard stepping, spinbutton accessibility, and native form integration.
 */
export const TimeField = createComponent(
  <T extends keyof SeidrElementTagNameMap = "div">(
    props: TimeFieldProps<T> = {} as TimeFieldProps<T>,
  ): SeidrElementTagNameMap[T] => {
    const {
      as = "div" as T,
      label,
      description,
      errorMessage,
      rootProps,
      labelProps,
      inputProps,
      hiddenInputProps,
      children,
      ...timeFieldOptions
    } = props;

    const timeField = createTimeField(timeFieldOptions);

    if (children) {
      return timeField.Root(
        { as, ...rootProps } as TimeFieldRootProps<T>,
        children,
      );
    }

    const content: (SeidrChild | undefined)[] = [];

    if (label) {
      content.push(timeField.Label(labelProps, label));
    }

    const inputChildren: (SeidrChild | undefined)[] = [];
    const segs = timeField.segments();

    inputChildren.push(timeField.Segment({ segment: "hour" }));

    if (segs.includes("minute")) {
      inputChildren.push(
        timeField.Separator({}, ":"),
        timeField.Segment({ segment: "minute" }),
      );
    }

    if (segs.includes("second")) {
      inputChildren.push(
        timeField.Separator({}, ":"),
        timeField.Segment({ segment: "second" }),
      );
    }

    if (segs.includes("dayPeriod")) {
      inputChildren.push(
        $("span", { style: { margin: "0 0.25rem", userSelect: "none" } }, " "),
        timeField.Segment({ segment: "dayPeriod" }),
      );
    }

    content.push(
      timeField.Input(inputProps, inputChildren),
      timeField.HiddenInput(hiddenInputProps),
      timeField.ValueDescription(),
    );

    if (description) {
      content.push(timeField.Description({}, description));
    }

    if (errorMessage) {
      content.push(timeField.ErrorMessage({}, errorMessage));
    }

    return timeField.Root(
      { as, ...rootProps } as TimeFieldRootProps<T>,
      content,
    );
  },
  "TimeField",
);

