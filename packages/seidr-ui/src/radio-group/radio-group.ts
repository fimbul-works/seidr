import { isValue, List, type SeidrChild } from "@fimbul-works/seidr";
import { createRadioGroup } from "./create-radio-group.js";
import { RadioGroupDescription } from "./radio-group-description.js";
import { RadioGroupErrorMessage } from "./radio-group-error-message.js";
import { RadioGroupItem } from "./radio-group-item.js";
import { RadioGroupItemControl } from "./radio-group-item-control.js";
import { RadioGroupItemDescription } from "./radio-group-item-description.js";
import { RadioGroupItemIndicator } from "./radio-group-item-indicator.js";
import { RadioGroupItemInput } from "./radio-group-item-input.js";
import { RadioGroupItemLabel } from "./radio-group-item-label.js";
import { RadioGroupLabel } from "./radio-group-label.js";
import { RadioGroupRoot, type RadioGroupRootProps } from "./radio-group-root.js";
import type { RadioGroupItemDescriptor, RadioGroupProps } from "./types.js";

/**
 * Unified all-in-one RadioGroup factory function.
 * Creates an accessible radio group with full WAI-ARIA and form-control integration in one call.
 * Supports static item arrays, reactive observable arrays (dynamic radio groups), or custom children.
 */
function RadioGroupComponent(options: RadioGroupProps = {}, children?: SeidrChild | SeidrChild[]) {
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
  } = options;

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
}

export const RadioGroup = Object.assign(RadioGroupComponent, {
  create: createRadioGroup,
  Root: RadioGroupRoot,
  Label: RadioGroupLabel,
  Description: RadioGroupDescription,
  ErrorMessage: RadioGroupErrorMessage,
  Item: RadioGroupItem,
  ItemInput: RadioGroupItemInput,
  ItemControl: RadioGroupItemControl,
  ItemIndicator: RadioGroupItemIndicator,
  ItemLabel: RadioGroupItemLabel,
  ItemDescription: RadioGroupItemDescription,
});
