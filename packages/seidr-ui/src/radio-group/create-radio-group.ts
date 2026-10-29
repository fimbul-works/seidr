import { isUndef } from "@fimbul-works/hvat";
import { $, type SeidrChild } from "@fimbul-works/seidr";
import { RadioGroupDescription, type RadioGroupDescriptionProps } from "./radio-group-description.js";
import { RadioGroupErrorMessage, type RadioGroupErrorMessageProps } from "./radio-group-error-message.js";
import { RadioGroupItem, type RadioGroupItemProps } from "./radio-group-item.js";
import { RadioGroupItemControl, type RadioGroupItemControlProps } from "./radio-group-item-control.js";
import { RadioGroupItemDescription, type RadioGroupItemDescriptionProps } from "./radio-group-item-description.js";
import { RadioGroupItemIndicator, type RadioGroupItemIndicatorProps } from "./radio-group-item-indicator.js";
import { RadioGroupItemInput, type RadioGroupItemInputProps } from "./radio-group-item-input.js";
import { RadioGroupItemLabel, type RadioGroupItemLabelProps } from "./radio-group-item-label.js";
import { RadioGroupLabel, type RadioGroupLabelProps } from "./radio-group-label.js";
import { RadioGroupRoot, type RadioGroupRootProps } from "./radio-group-root.js";
import type {
  RadioGroupInstance,
  RadioGroupItemInstance,
  UseRadioGroupItemOptions,
  UseRadioGroupOptions,
} from "./types.js";
import { useRadioGroup } from "./use-radio-group.js";
import { useRadioGroupItem } from "./use-radio-group-item.js";

/**
 * Creates a RadioGroup state coordinator instance with pre-bound compound element helpers.
 */
export function createRadioGroup(options: UseRadioGroupOptions = {}): RadioGroupInstance {
  const instance = useRadioGroup(options);

  const createItem = (itemOptions: UseRadioGroupItemOptions): RadioGroupItemInstance => {
    const itemInstance = useRadioGroupItem(instance, itemOptions);

    const Root = (props: RadioGroupItemProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      RadioGroupItem({ instance: itemInstance, ...props }, children);

    const Input = (props: RadioGroupItemInputProps = {}) => RadioGroupItemInput({ instance: itemInstance, ...props });

    const Control = (props: RadioGroupItemControlProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      RadioGroupItemControl({ instance: itemInstance, ...props }, children);

    const Indicator = (props: RadioGroupItemIndicatorProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      RadioGroupItemIndicator({ instance: itemInstance, ...props }, children);

    const Label = (props: RadioGroupItemLabelProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      RadioGroupItemLabel({ instance: itemInstance, ...props }, children);

    const Description = (props: RadioGroupItemDescriptionProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      RadioGroupItemDescription({ instance: itemInstance, ...props }, children);

    return {
      ...itemInstance,
      Root,
      Item: Root,
      Input,
      ItemInput: Input,
      Control,
      ItemControl: Control,
      Indicator,
      ItemIndicator: Indicator,
      Label,
      ItemLabel: Label,
      Description,
      ItemDescription: Description,
    };
  };

  return {
    ...instance,
    createItem,
    Root: (props = {}, children) => RadioGroupRoot({ instance, ...props }, children),
    Label: (props = {}, children) => RadioGroupLabel({ instance, ...instance.dataset, ...props }, children),
    Description: (props = {}, children) => RadioGroupDescription({ instance, ...instance.dataset, ...props }, children),
    ErrorMessage: (props = {}, children) =>
      RadioGroupErrorMessage({ instance, ...instance.dataset, ...props }, children),
    Item: (itemOptionsOrProps, children?: SeidrChild | SeidrChild[]) => {
      const {
        value,
        disabled,
        id,
        label,
        description,
        indicator,
        itemProps,
        inputProps,
        controlProps,
        indicatorProps,
        labelProps,
        descriptionProps,
        contentProps,
        ...rootProps
      } = itemOptionsOrProps;

      const itemInstance = useRadioGroupItem(instance, { value, disabled, id });

      if (!isUndef(children)) {
        return RadioGroupItem({ instance: itemInstance, ...(itemProps ?? {}), ...rootProps }, children);
      }

      const labelEl = label ? RadioGroupItemLabel({ instance: itemInstance, ...(labelProps ?? {}) }, label) : null;
      const descEl = description
        ? RadioGroupItemDescription({ instance: itemInstance, ...(descriptionProps ?? {}) }, description)
        : null;

      const textContent =
        contentProps || (labelEl && descEl)
          ? $("div", { ...(contentProps ?? {}) }, [labelEl, descEl])
          : (labelEl ?? descEl);

      return RadioGroupItem({ instance: itemInstance, ...(itemProps ?? {}), ...rootProps }, [
        RadioGroupItemInput({ instance: itemInstance, ...(inputProps ?? {}) }),
        RadioGroupItemControl({ instance: itemInstance, ...(controlProps ?? {}) }, [
          RadioGroupItemIndicator({ instance: itemInstance, ...(indicatorProps ?? {}) }, indicator),
        ]),
        textContent,
      ]);
    },
    ItemInput: (props = {}) => RadioGroupItemInput(props),
    ItemControl: (props = {}, children) => RadioGroupItemControl(props, children),
    ItemIndicator: (props = {}, children) => RadioGroupItemIndicator(props, children),
    ItemLabel: (props = {}, children) => RadioGroupItemLabel(props, children),
    ItemDescription: (props = {}, children) => RadioGroupItemDescription(props, children),
  };
}
