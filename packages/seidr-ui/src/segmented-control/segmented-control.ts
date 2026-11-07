import { createComponent, isValue, List, type ReactiveValue, type SeidrChild } from "@fimbul-works/seidr";
import { createSegmentedControl } from "./create-segmented-control.js";
import type { SegmentedControlDescriptionProps } from "./segmented-control-description.js";
import type { SegmentedControlErrorMessageProps } from "./segmented-control-error-message.js";
import type { SegmentedControlIndicatorProps } from "./segmented-control-indicator.js";
import type { SegmentedControlLabelProps } from "./segmented-control-label.js";
import type { SegmentedControlRootProps } from "./segmented-control-root.js";
import type { SegmentedControlItemDescriptor, UseSegmentedControlOptions } from "./types.js";

export interface SegmentedControlProps extends UseSegmentedControlOptions {
  /** Optional class name for the root container. */
  className?: ReactiveValue<string>;

  /** Accessible group label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Optional group description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Optional group error message text or element. */
  errorMessage?: SeidrChild | SeidrChild[];

  /** Declarative list of items to render, supports static arrays or reactive observable arrays. */
  items?: ReactiveValue<SegmentedControlItemDescriptor[]>;

  /** Props passed to SegmentedControl.Root. */
  rootProps?: SegmentedControlRootProps;

  /** Props passed to SegmentedControl.Indicator. */
  indicatorProps?: SegmentedControlIndicatorProps;

  /** Props passed to SegmentedControl.Label. */
  labelProps?: SegmentedControlLabelProps;

  /** Props passed to SegmentedControl.Description. */
  descriptionProps?: SegmentedControlDescriptionProps;

  /** Props passed to SegmentedControl.ErrorMessage. */
  errorMessageProps?: SegmentedControlErrorMessageProps;
}

/**
 * Unified all-in-one SegmentedControl factory function.
 * Creates an accessible segmented control with sliding indicator, WAI-ARIA radiogroup,
 * and form-control integration in one call.
 * Supports static item arrays, reactive observable arrays (dynamic lists), or custom children.
 */
export const SegmentedControl = createComponent(
  (props: SegmentedControlProps = {}, children?: SeidrChild | SeidrChild[]) => {
    const {
      className,
      label,
      description,
      errorMessage,
      items,
      rootProps = {},
      indicatorProps = {},
      labelProps = {},
      descriptionProps = {},
      errorMessageProps = {},
      ...segmentedControlOptions
    } = props;

    const sc = createSegmentedControl(segmentedControlOptions);

    const itemElements: SeidrChild | SeidrChild[] =
      children !== undefined
        ? children
        : items !== undefined
          ? sc.List(items)
          : [];

    const renderedItems = Array.isArray(itemElements) ? itemElements : [itemElements];

    return sc.Root({ className, ...rootProps } as SegmentedControlRootProps, [
      label ? sc.Label(labelProps, label) : null,
      description ? sc.Description(descriptionProps, description) : null,
      errorMessage ? sc.ErrorMessage(errorMessageProps, errorMessage) : null,
      sc.Indicator(indicatorProps),
      ...renderedItems,
    ]);
  },
  "SegmentedControl",
);
