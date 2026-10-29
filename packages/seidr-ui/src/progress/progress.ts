import { createComponent } from "@fimbul-works/seidr";
import { createProgress } from "./create-progress.js";
import type { ProgressProps, ProgressRootProps } from "./types.js";

/**
 * Unified all-in-one Progress component (Tier 1).
 * Renders an accessible progress bar (role="progressbar") with label, value label, track, and fill.
 */
export const Progress = createComponent((props: ProgressProps = {}) => {
  const {
    id,
    value,
    minValue,
    maxValue,
    indeterminate,
    getValueLabel,
    role,
    dataComponent,
    as = "div",
    label,
    valueLabel,
    rootProps = {},
    headerProps = {},
    trackProps = {},
    fillProps = {},
    labelProps = {},
    valueLabelProps = {},
    children,
  } = props;

  const progress = createProgress({
    id,
    value,
    minValue,
    maxValue,
    indeterminate,
    getValueLabel,
    role,
    dataComponent,
  });

  const hasHeader = Boolean(label || valueLabel);
  const header = hasHeader
    ? progress.Header(headerProps, [
        label ? progress.Label(labelProps, label) : null,
        valueLabel
          ? progress.ValueLabel(valueLabelProps, typeof valueLabel === "boolean" ? undefined : valueLabel)
          : null,
      ])
    : null;

  return progress.Root({ as, ...rootProps } as Omit<ProgressRootProps<"div">, "instance">, [
    header,
    progress.Track(trackProps, [progress.Fill(fillProps)]),
    children,
  ]);
}, "Progress");
