import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  List,
  type ReactiveValue,
  type SeidrChild,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { SegmentedControlDescription } from "./segmented-control-description.js";
import { SegmentedControlErrorMessage } from "./segmented-control-error-message.js";
import { SegmentedControlIndicator } from "./segmented-control-indicator.js";
import { SegmentedControlItem, type SegmentedControlItemProps } from "./segmented-control-item.js";
import {
  SegmentedControlItemControl,
  type SegmentedControlItemControlProps,
} from "./segmented-control-item-control.js";
import {
  SegmentedControlItemDescription,
  type SegmentedControlItemDescriptionProps,
} from "./segmented-control-item-description.js";
import {
  SegmentedControlItemIndicator,
  type SegmentedControlItemIndicatorProps,
} from "./segmented-control-item-indicator.js";
import { SegmentedControlItemInput, type SegmentedControlItemInputProps } from "./segmented-control-item-input.js";
import { SegmentedControlItemLabel, type SegmentedControlItemLabelProps } from "./segmented-control-item-label.js";
import { SegmentedControlLabel } from "./segmented-control-label.js";
import { SegmentedControlRoot } from "./segmented-control-root.js";
import type {
  SegmentedControlInstance,
  SegmentedControlItemDescriptor,
  SegmentedControlItemInstance,
  SegmentedControlListRenderOptions,
  UseSegmentedControlItemOptions,
  UseSegmentedControlOptions,
} from "./types.js";
import { useSegmentedControl } from "./use-segmented-control.js";
import { useSegmentedControlItem } from "./use-segmented-control-item.js";

/**
 * Creates a SegmentedControl state coordinator instance with pre-bound compound element helpers.
 */
export function createSegmentedControl(options: UseSegmentedControlOptions = {}): SegmentedControlInstance {
  const instance = useSegmentedControl(options);

  const createItem = (itemOptions: UseSegmentedControlItemOptions): SegmentedControlItemInstance => {
    const itemInstance = useSegmentedControlItem(instance, itemOptions);

    const Root = (props: SegmentedControlItemProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      SegmentedControlItem({ instance: itemInstance, ...props }, children);

    const Input = (props: SegmentedControlItemInputProps = {}) =>
      SegmentedControlItemInput({ instance: itemInstance, ...props });

    const Control = (props: SegmentedControlItemControlProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      SegmentedControlItemControl({ instance: itemInstance, ...props }, children);

    const Indicator = (props: SegmentedControlItemIndicatorProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      SegmentedControlItemIndicator({ instance: itemInstance, ...props }, children);

    const Label = (props: SegmentedControlItemLabelProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      SegmentedControlItemLabel({ instance: itemInstance, ...props }, children);

    const Description = (props: SegmentedControlItemDescriptionProps<any> = {}, children?: SeidrChild | SeidrChild[]) =>
      SegmentedControlItemDescription({ instance: itemInstance, ...props }, children);

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

  const Item = (
    itemOptionsOrProps: SegmentedControlItemDescriptor & Record<string, any>,
    children?: SeidrChild | SeidrChild[],
  ) => {
    const {
      value,
      disabled,
      id,
      label,
      description,
      indicator,
      control = true,
      itemProps,
      inputProps,
      controlProps,
      indicatorProps,
      labelProps,
      descriptionProps,
      contentProps,
      ...rootProps
    } = itemOptionsOrProps;

    const itemInstance = useSegmentedControlItem(instance, { value, disabled, id });

    if (!isUndef(children)) {
      return SegmentedControlItem({ instance: itemInstance, ...(itemProps ?? {}), ...rootProps }, [
        SegmentedControlItemInput({ instance: itemInstance, ...(inputProps ?? {}) }),
        ...(Array.isArray(children) ? children : [children]),
      ]);
    }

    const labelEl = label
      ? SegmentedControlItemLabel({ instance: itemInstance, ...(labelProps ?? {}) }, label)
      : null;
    const descEl = description
      ? SegmentedControlItemDescription({ instance: itemInstance, ...(descriptionProps ?? {}) }, description)
      : null;

    const textContent =
      contentProps || (labelEl && descEl)
        ? $("div", { ...(contentProps ?? {}) }, [labelEl, descEl])
        : (labelEl ?? descEl);

    const controlEl = control
      ? SegmentedControlItemControl({ instance: itemInstance, ...(controlProps ?? {}) }, [
          SegmentedControlItemIndicator({ instance: itemInstance, ...(indicatorProps ?? {}) }, indicator),
        ])
      : null;

    return SegmentedControlItem({ instance: itemInstance, ...(itemProps ?? {}), ...rootProps }, [
      SegmentedControlItemInput({ instance: itemInstance, ...(inputProps ?? {}) }),
      controlEl,
      textContent,
    ]);
  };

  const ListComponent = (
    itemsProp: ReactiveValue<SegmentedControlItemDescriptor[]>,
    listOptions: SegmentedControlListRenderOptions = {},
  ): SeidrChild => {
    const { renderItem, itemProps } = listOptions;
    const itemsObservable = wrapValue(itemsProp);

    return List<SegmentedControlItemDescriptor, string>(
      itemsObservable,
      (item) => item.value,
      (itemVal) => {
        const descriptor = itemVal();
        const itemKey = descriptor.value;
        if (renderItem) {
          const itemInst = createItem({
            value: itemKey,
            disabled: descriptor.disabled,
            id: descriptor.id,
          });
          return renderItem(itemVal, itemKey, itemInst);
        }
        return Item({
          value: itemKey,
          label: itemVal.as((i) => i.label ?? i.value),
          description: itemVal.as((i) => i.description),
          disabled: itemVal.as((i) => Boolean(i.disabled)),
          indicator: descriptor.indicator,
          ...(itemProps ?? {}),
        });
      },
    );
  };

  return {
    ...instance,
    createItem,
    Root: (props = {}, children) => SegmentedControlRoot({ instance, ...props }, children),
    Indicator: (props = {}, children) => SegmentedControlIndicator({ instance, ...props }, children),
    Label: (props = {}, children) => SegmentedControlLabel({ instance, ...instance.dataset, ...props }, children),
    Description: (props = {}, children) =>
      SegmentedControlDescription({ instance, ...instance.dataset, ...props }, children),
    ErrorMessage: (props = {}, children) =>
      SegmentedControlErrorMessage({ instance, ...instance.dataset, ...props }, children),
    Item,
    ItemInput: (props = {}) => SegmentedControlItemInput(props),
    ItemControl: (props = {}, children) => SegmentedControlItemControl(props, children),
    ItemIndicator: (props = {}, children) => SegmentedControlItemIndicator(props, children),
    ItemLabel: (props = {}, children) => SegmentedControlItemLabel(props, children),
    ItemDescription: (props = {}, children) => SegmentedControlItemDescription(props, children),
    List: ListComponent,
  };
}
