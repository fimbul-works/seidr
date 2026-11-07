import { isObj } from "@fimbul-works/hvat";
import {
  $,
  type DerivedValue,
  List,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementTagNameMap,
  SeidrError,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { FormControlDescription } from "../form-control/form-control-description.js";
import type { FormControlDescriptionProps } from "../form-control/form-control-description.js";
import { FormControlErrorMessage } from "../form-control/form-control-error-message.js";
import type { FormControlErrorMessageProps } from "../form-control/form-control-error-message.js";
import { ListboxItem } from "../listbox/listbox-item.js";
import { ListboxItemDescription } from "../listbox/listbox-item-description.js";
import { ListboxItemIndicator } from "../listbox/listbox-item-indicator.js";
import { ListboxItemLabel } from "../listbox/listbox-item-label.js";
import { ListboxSection } from "../listbox/listbox-section.js";
import { ListboxSectionLabel } from "../listbox/listbox-section-label.js";
import type {
  ListboxItemDescriptionProps,
  ListboxItemIndicatorProps,
  ListboxItemInstance,
  ListboxItemLabelProps,
  ListboxItemProps,
  ListboxListRenderOptions,
  ListboxSectionLabelProps,
  ListboxSectionProps,
  UseListboxItemOptions,
  UseListboxItemResult,
} from "../listbox/types.js";
import { useListboxItem } from "../listbox/use-listbox-item.js";
import { PopperArrow } from "../popper/popper-arrow.js";
import type { PopperArrowProps } from "../popper/types.js";
import { ComboboxContent } from "./combobox-content.js";
import { ComboboxControl } from "./combobox-control.js";
import { ComboboxHiddenSelect } from "./combobox-hidden-select.js";
import { ComboboxIcon } from "./combobox-icon.js";
import { ComboboxInput } from "./combobox-input.js";
import { ComboboxLabel } from "./combobox-label.js";
import { ComboboxListbox } from "./combobox-listbox.js";
import { ComboboxRoot } from "./combobox-root.js";
import { ComboboxTrigger } from "./combobox-trigger.js";
import type {
  ComboboxArrowProps,
  ComboboxContentProps,
  ComboboxControlProps,
  ComboboxDescriptionProps,
  ComboboxErrorMessageProps,
  ComboboxHiddenSelectProps,
  ComboboxIconProps,
  ComboboxInputProps,
  ComboboxInstance,
  ComboboxItemData,
  ComboboxItemDescriptionProps,
  ComboboxItemIndicatorProps,
  ComboboxItemInstance,
  ComboboxItemLabelProps,
  ComboboxItemProps,
  ComboboxLabelProps,
  ComboboxListboxProps,
  ComboboxNode,
  ComboboxRootProps,
  ComboboxSectionData,
  ComboboxSectionLabelProps,
  ComboboxSectionProps,
  ComboboxTriggerProps,
  UseComboboxOptions,
} from "./types.js";
import { useCombobox } from "./use-combobox.js";

/**
 * Creates a headless Combobox state coordinator with pre-bound compound element helpers.
 */
export function createCombobox<Option = any, OptGroup = any>(
  options: UseComboboxOptions<Option, OptGroup>,
): ComboboxInstance<Option> {
  const instance = useCombobox(options);

  const createItem = (itemOptions: UseListboxItemOptions): ComboboxItemInstance => {
    const itemResult = useListboxItem(instance.listbox, itemOptions);

    const Root = <T extends keyof SeidrElementTagNameMap = "li">(
      itemProps: Omit<ComboboxItemProps<T>, "instance" | "value"> = {} as Omit<ComboboxItemProps<T>, "instance" | "value">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItem(
        {
          instance: itemResult,
          listbox: instance.listbox,
          value: itemOptions.value,
          dataComponent: "combobox",
          id: `${instance.id}-item-${itemOptions.value}`,
          ...itemProps,
        } as ListboxItemProps<T>,
        children,
      );

    const Label = <T extends keyof SeidrElementTagNameMap = "div">(
      labelProps: Omit<ComboboxItemLabelProps<T>, "instance"> = {} as Omit<ComboboxItemLabelProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItemLabel(
        {
          instance: itemResult,
          dataComponent: "combobox",
          ...labelProps,
        } as ListboxItemLabelProps<T>,
        children,
      );

    const Description = <T extends keyof SeidrElementTagNameMap = "div">(
      descProps: Omit<ComboboxItemDescriptionProps<T>, "instance"> = {} as Omit<ComboboxItemDescriptionProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItemDescription(
        {
          instance: itemResult,
          dataComponent: "combobox",
          ...descProps,
        } as ListboxItemDescriptionProps<T>,
        children,
      );

    const Indicator = <T extends keyof SeidrElementTagNameMap = "div">(
      indProps: Omit<ComboboxItemIndicatorProps<T>, "instance"> = {} as Omit<ComboboxItemIndicatorProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItemIndicator(
        {
          instance: itemResult,
          dataComponent: "combobox",
          ...indProps,
        } as ListboxItemIndicatorProps<T>,
        children,
      );

    return {
      ...itemResult,
      Root,
      Item: Root,
      Label,
      ItemLabel: Label,
      Description,
      ItemDescription: Description,
      Indicator,
      ItemIndicator: Indicator,
    };
  };

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props: ComboboxRootProps<T> = {} as ComboboxRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxRoot({ instance, dataComponent: "combobox", ...props }, children);

  const Label = <T extends keyof SeidrElementTagNameMap = "label">(
    props: ComboboxLabelProps<T> = {} as ComboboxLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxLabel({ instance, dataComponent: "combobox", ...props }, children);

  const Control = <T extends keyof SeidrElementTagNameMap = "div">(
    props: ComboboxControlProps<T> = {} as ComboboxControlProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxControl({ instance, dataComponent: "combobox", ...props }, children);

  const Input = <T extends keyof SeidrElementTagNameMap = "input">(
    props: ComboboxInputProps<T> = {} as ComboboxInputProps<T>,
  ) => ComboboxInput({ instance, dataComponent: "combobox", ...props });

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: ComboboxTriggerProps<T> = {} as ComboboxTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxTrigger({ instance, dataComponent: "combobox", ...props }, children);

  const Icon = <T extends keyof SeidrElementTagNameMap = "span">(
    props: ComboboxIconProps<T> = {} as ComboboxIconProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxIcon({ instance, dataComponent: "combobox", ...props }, children);

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: ComboboxContentProps<T> = {} as ComboboxContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxContent({ instance, dataComponent: "combobox", ...props }, children);

  const Listbox = <T extends keyof SeidrElementTagNameMap = "ul">(
    props: ComboboxListboxProps<T> = {} as ComboboxListboxProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxListbox({ instance, dataComponent: "combobox", ...props }, children);

  const Item = <T extends keyof SeidrElementTagNameMap = "li">(
    props: ComboboxItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) =>
    ListboxItem(
      {
        listbox: instance.listbox,
        dataComponent: "combobox",
        id: `${instance.id}-item-${props.value}`,
        ...props,
      },
      children,
    );

  const ItemLabel = <T extends keyof SeidrElementTagNameMap = "div">(
    props: ComboboxItemLabelProps<T> = {} as ComboboxItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance;
    if (!itemInst) {
      throw new SeidrError("ComboboxItemLabel requires an item instance");
    }
    return ListboxItemLabel({ instance: itemInst, dataComponent: "combobox", ...props } as ListboxItemLabelProps<T>, children);
  };

  const ItemDescription = <T extends keyof SeidrElementTagNameMap = "div">(
    props: ComboboxItemDescriptionProps<T> = {} as ComboboxItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance;
    if (!itemInst) {
      throw new SeidrError("ComboboxItemDescription requires an item instance");
    }
    return ListboxItemDescription(
      { instance: itemInst, dataComponent: "combobox", ...props } as ListboxItemDescriptionProps<T>,
      children,
    );
  };

  const ItemIndicator = <T extends keyof SeidrElementTagNameMap = "div">(
    props: ComboboxItemIndicatorProps<T> = {} as ComboboxItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance;
    if (!itemInst) {
      throw new SeidrError("ComboboxItemIndicator requires an item instance");
    }
    return ListboxItemIndicator(
      { instance: itemInst, dataComponent: "combobox", ...props } as ListboxItemIndicatorProps<T>,
      children,
    );
  };

  const Section = <T extends keyof SeidrElementTagNameMap = "li">(
    props: ComboboxSectionProps<T> = {} as ComboboxSectionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    ListboxSection<T>({ dataComponent: "combobox", ...props } as ListboxSectionProps<T>, children);

  const SectionLabel = <T extends keyof SeidrElementTagNameMap = "span">(
    props: ComboboxSectionLabelProps<T> = {} as ComboboxSectionLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    ListboxSectionLabel<T>({ dataComponent: "combobox", ...props } as ListboxSectionLabelProps<T>, children);

  const HiddenSelect = (props: ComboboxHiddenSelectProps = {}) =>
    ComboboxHiddenSelect({ instance, dataComponent: "combobox", ...props });

  const Arrow = <T extends keyof SeidrElementTagNameMap = "div">(
    props: ComboboxArrowProps<T> = {} as ComboboxArrowProps<T>,
  ): SeidrElementTagNameMap[T] =>
    PopperArrow<T>({ instance: instance.popper, dataComponent: "combobox", ...props } as PopperArrowProps<T>);

  const Description = <T extends keyof SeidrElementTagNameMap = "div">(
    props: ComboboxDescriptionProps<T> = {} as ComboboxDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FormControlDescription<T>(
      {
        id: instance.descriptionId,
        dataComponent: "combobox",
        ...props,
      } as FormControlDescriptionProps<T>,
      children,
    );

  const ErrorMessage = <T extends keyof SeidrElementTagNameMap = "div">(
    props: ComboboxErrorMessageProps<T> = {} as ComboboxErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    FormControlErrorMessage<T>(
      {
        id: instance.errorMessageId,
        dataComponent: "combobox",
        ...props,
      } as FormControlErrorMessageProps<T>,
      children,
    );

  const ListHelper = (
    itemsProp: ReactiveValue<ComboboxNode<Option>[]>,
    listOptions: ListboxListRenderOptions = {},
  ): SeidrChild => {
    const { renderItem, renderSection, indicator, itemProps } = listOptions;
    const itemsObservable = wrapValue(itemsProp) as Value<ComboboxNode<Option>[]>;

    const defaultRenderItem = (itemVal: Value<ComboboxItemData<Option>>): SeidrChild => {
      const itemKey = itemVal().value;
      return Item({
        value: itemKey,
        label: itemVal.as((i) => i.label ?? i.value),
        textValue: itemVal().textValue,
        description: itemVal.as((i) => i.description),
        disabled: itemVal.as((i) => Boolean(i.disabled)),
        indicator,
        ...(itemProps ?? {}),
      });
    };

    const defaultRenderSection = (sectionVal: Value<ComboboxSectionData>): SeidrChild => {
      const secKey = sectionVal().key;
      const sectionItems = sectionVal.as((s) => s.items ?? []) as Value<ComboboxItemData[]>;
      return Section({ id: secKey }, [
        SectionLabel({}, sectionVal.as((s) => s.label)),
        $("ul", { role: "group" }, [
          List<ComboboxItemData, string>(
            sectionItems,
            (item) => item.value,
            (childItemVal) => {
              const childKey = childItemVal().value;
              if (renderItem) {
                const childItemInstance = createItem({
                  value: childKey,
                  disabled: childItemVal().disabled,
                  textValue: childItemVal().textValue,
                });
                return renderItem(childItemVal, childKey, childItemInstance);
              }
              return defaultRenderItem(childItemVal);
            },
          ),
        ]),
      ]);
    };

    return List<ComboboxNode<Option>, string>(
      itemsObservable,
      (node) => {
        if (isObj(node) && "key" in node && typeof (node as ComboboxSectionData).key === "string") {
          return (node as ComboboxSectionData).key;
        }
        return (node as ComboboxItemData).value;
      },
      (nodeVal, nodeKey) => {
        const initialNode = nodeVal();
        const isSec = isObj(initialNode) && "items" in initialNode && Array.isArray((initialNode as ComboboxSectionData).items);

        if (isSec) {
          const secVal = nodeVal as unknown as Value<ComboboxSectionData>;
          const secKey = secVal().key;
          if (renderSection) {
            return renderSection(secVal, secKey);
          }
          return defaultRenderSection(secVal);
        }

        const itemVal = nodeVal as unknown as Value<ComboboxItemData<Option>>;
        const itemKey = itemVal().value;
        if (renderItem) {
          const itemInstance = createItem({
            value: itemKey,
            disabled: itemVal().disabled,
            textValue: itemVal().textValue,
          });
          return renderItem(itemVal, itemKey, itemInstance);
        }
        return defaultRenderItem(itemVal);
      },
    );
  };

  return {
    ...instance,
    createItem,
    Root,
    Label,
    Control,
    Input,
    Trigger,
    Icon,
    Content,
    Listbox,
    Item,
    ItemLabel,
    ItemDescription,
    ItemIndicator,
    Section,
    SectionLabel,
    HiddenSelect,
    Arrow,
    Description,
    ErrorMessage,
    List: ListHelper,
  };
}
