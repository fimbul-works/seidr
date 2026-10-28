import { isValue, List, type SeidrChild, ReactiveValue } from "@fimbul-works/seidr";
import { createRadioGroup } from "./create-radio-group.js";
import { RadioGroupDescriptionProps } from "./radio-group-description.js";
import { RadioGroupErrorMessageProps } from "./radio-group-error-message.js";
import { RadioGroupLabelProps } from "./radio-group-label.js";
import { type RadioGroupRootProps } from "./radio-group-root.js";
import type { RadioGroupItemDescriptor, UseRadioGroupOptions } from "./types.js";
import { createComponent } from "@fimbul-works/seidr";

export interface RadioGroupProps extends UseRadioGroupOptions {
  /** Optional class name for the root container. */
  className?: ReactiveValue<string>;

  /** Accessible group label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Optional group description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Optional group error message text or element. */
  errorMessage?: SeidrChild | SeidrChild[];

  /** Declarative list of items to render, supports static arrays or reactive observable arrays. */
  items?: ReactiveValue<RadioGroupItemDescriptor[]>;

  /** Props passed to RadioGroup.Root. */
  rootProps?: RadioGroupRootProps;

  /** Props passed to RadioGroup.Label. */
  labelProps?: RadioGroupLabelProps;

  /** Props passed to RadioGroup.Description. */
  descriptionProps?: RadioGroupDescriptionProps;

  /** Props passed to RadioGroup.ErrorMessage. */
  errorMessageProps?: RadioGroupErrorMessageProps;
}

/**
 * Unified all-in-one RadioGroup factory function.
 * Creates an accessible radio group with full WAI-ARIA and form-control integration in one call.
 * Supports static item arrays, reactive observable arrays (dynamic radio groups), or custom children.
 */
export const RadioGroup = createComponent((props: RadioGroupProps = {}, children?: SeidrChild | SeidrChild[]) => {
  const {
    className,
    label,
    description,
    errorMessage,
    items,
    rootProps = {},
    labelProps = {},
    descriptionProps = {},
    errorMessageProps = {},
    ...radioGroupOptions
  } = props;

  const rg = createRadioGroup(radioGroupOptions);

  const itemElements: SeidrChild | SeidrChild[] =
    children !== undefined
      ? children
      : isValue<RadioGroupItemDescriptor[]>(items)
        ? List(
            items,
            (item) => item.value,
            (itemVal) => rg.Item(itemVal()),
          )
        : (items?.map((item) => rg.Item(item)) ?? []);

  const renderedItems = Array.isArray(itemElements) ? itemElements : [itemElements];

  return rg.Root({ className, ...rootProps } as RadioGroupRootProps, [
    label ? rg.Label(labelProps, label) : null,
    description ? rg.Description(descriptionProps, description) : null,
    errorMessage ? rg.ErrorMessage(errorMessageProps, errorMessage) : null,
    ...renderedItems,
  ]);
}, "RadioGroup")
