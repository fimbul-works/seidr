import { isUndef } from "@fimbul-works/hvat";
import { resolvePropsAndChildren, type SeidrChild } from "@fimbul-works/seidr";
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

    const Root = (
      propsOrChildren?: RadioGroupItemProps<any> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupItem({ ...props, instance: itemInstance }, content);
    };

    const Input = (props: RadioGroupItemInputProps = {}) => RadioGroupItemInput({ ...props, instance: itemInstance });

    const Control = (
      propsOrChildren?: RadioGroupItemControlProps<any> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupItemControl({ ...props, instance: itemInstance }, content);
    };

    const Indicator = (
      propsOrChildren?: RadioGroupItemIndicatorProps<any> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupItemIndicator({ ...props, instance: itemInstance }, content);
    };

    const Label = (
      propsOrChildren?: RadioGroupItemLabelProps<any> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupItemLabel({ ...props, instance: itemInstance }, content);
    };

    const Description = (
      propsOrChildren?: RadioGroupItemDescriptionProps<any> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupItemDescription({ ...props, instance: itemInstance }, content);
    };

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
    Root: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupRoot({ ...props, instance } as RadioGroupRootProps<any>, content);
    },
    Label: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupLabel({ ...props, instance } as RadioGroupLabelProps<any>, content);
    },
    Description: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupDescription({ ...props, instance } as RadioGroupDescriptionProps<any>, content);
    },
    ErrorMessage: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupErrorMessage({ ...props, instance } as RadioGroupErrorMessageProps<any>, content);
    },
    Item: (itemOptionsOrProps, children?: SeidrChild | SeidrChild[]) => {
      const {
        value,
        disabled,
        id,
        label,
        description,
        indicator,
        inputProps,
        controlProps,
        indicatorProps,
        labelProps,
        descriptionProps,
        ...rootProps
      } = itemOptionsOrProps;

      const itemInstance = useRadioGroupItem(instance, { value, disabled, id });

      if (!isUndef(children)) {
        return RadioGroupItem({ ...rootProps, instance: itemInstance }, children);
      }

      return RadioGroupItem({ ...rootProps, instance: itemInstance }, [
        RadioGroupItemInput({ ...(inputProps ?? {}), instance: itemInstance }),
        RadioGroupItemControl({ ...(controlProps ?? {}), instance: itemInstance }, [
          RadioGroupItemIndicator({ ...(indicatorProps ?? {}), instance: itemInstance }, indicator ?? "●"),
        ]),
        label ? RadioGroupItemLabel({ ...(labelProps ?? {}), instance: itemInstance }, label) : null,
        description
          ? RadioGroupItemDescription({ ...(descriptionProps ?? {}), instance: itemInstance }, description)
          : null,
      ]);
    },
    ItemInput: (props = {}) => RadioGroupItemInput(props),
    ItemControl: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupItemControl(props, content);
    },
    ItemIndicator: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupItemIndicator(props, content);
    },
    ItemLabel: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupItemLabel(props, content);
    },
    ItemDescription: (propsOrChildren, children) => {
      const [props, content] = resolvePropsAndChildren(propsOrChildren, children);
      return RadioGroupItemDescription(props, content);
    },
  };
}
