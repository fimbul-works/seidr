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
import { ComboboxContent } from "../combobox/combobox-content.js";
import { ComboboxControl } from "../combobox/combobox-control.js";
import { ComboboxHiddenSelect } from "../combobox/combobox-hidden-select.js";
import { ComboboxIcon } from "../combobox/combobox-icon.js";
import { ComboboxInput } from "../combobox/combobox-input.js";
import { ComboboxLabel } from "../combobox/combobox-label.js";
import { ComboboxListbox } from "../combobox/combobox-listbox.js";
import { ComboboxRoot } from "../combobox/combobox-root.js";
import { ComboboxTrigger } from "../combobox/combobox-trigger.js";
import { DATA_COMPONENT_SEARCH } from "../constants.js";
import type { FormControlDescriptionProps } from "../form-control/form-control-description.js";
import { FormControlDescription } from "../form-control/form-control-description.js";
import type { FormControlErrorMessageProps } from "../form-control/form-control-error-message.js";
import { FormControlErrorMessage } from "../form-control/form-control-error-message.js";
import { ListboxItem } from "../listbox/listbox-item.js";
import { ListboxItemDescription } from "../listbox/listbox-item-description.js";
import { ListboxItemIndicator } from "../listbox/listbox-item-indicator.js";
import { ListboxItemLabel } from "../listbox/listbox-item-label.js";
import { ListboxSection } from "../listbox/listbox-section.js";
import { ListboxSectionLabel } from "../listbox/listbox-section-label.js";
import type {
  ListboxItemDescriptionProps,
  ListboxItemIndicatorProps,
  ListboxItemLabelProps,
  ListboxItemProps,
  ListboxListRenderOptions,
  ListboxSectionLabelProps,
  ListboxSectionProps,
  UseListboxItemOptions,
} from "../listbox/types.js";
import { useListboxItem } from "../listbox/use-listbox-item.js";
import { PopperArrow } from "../popper/popper-arrow.js";
import type { PopperArrowProps } from "../popper/types.js";
import { SearchIndicator } from "./search-indicator.js";
import { SearchNoResult } from "./search-no-result.js";
import type {
  SearchArrowProps,
  SearchContentProps,
  SearchControlProps,
  SearchDescriptionProps,
  SearchErrorMessageProps,
  SearchHiddenSelectProps,
  SearchIconProps,
  SearchIndicatorProps,
  SearchInputProps,
  SearchInstance,
  SearchItemData,
  SearchItemDescriptionProps,
  SearchItemIndicatorProps,
  SearchItemInstance,
  SearchItemLabelProps,
  SearchItemProps,
  SearchLabelProps,
  SearchListboxProps,
  SearchNode,
  SearchNoResultProps,
  SearchRootProps,
  SearchSectionData,
  SearchSectionLabelProps,
  SearchSectionProps,
  SearchTriggerProps,
  UseSearchOptions,
} from "./types.js";
import { useSearch } from "./use-search.js";

/**
 * Creates a headless Search state coordinator with pre-bound compound element helpers.
 */
export function createSearch<Option = any, OptGroup = any>(
  options: UseSearchOptions<Option, OptGroup>,
): SearchInstance<Option> {
  const instance = useSearch(options);

  const createItem = (itemOptions: UseListboxItemOptions): SearchItemInstance => {
    const itemResult = useListboxItem(instance.listbox, itemOptions);

    const Root = <T extends keyof SeidrElementTagNameMap = "li">(
      itemProps: Omit<SearchItemProps<T>, "instance" | "value"> = {} as Omit<SearchItemProps<T>, "instance" | "value">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItem(
        {
          instance: itemResult,
          listbox: instance.listbox,
          value: itemOptions.value,
          dataComponent: DATA_COMPONENT_SEARCH,
          id: `${instance.id}-item-${itemOptions.value}`,
          ...itemProps,
        } as ListboxItemProps<T>,
        children,
      );

    const Label = <T extends keyof SeidrElementTagNameMap = "div">(
      labelProps: Omit<SearchItemLabelProps<T>, "instance"> = {} as Omit<SearchItemLabelProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItemLabel(
        {
          instance: itemResult,
          dataComponent: DATA_COMPONENT_SEARCH,
          ...labelProps,
        } as ListboxItemLabelProps<T>,
        children,
      );

    const Description = <T extends keyof SeidrElementTagNameMap = "div">(
      descProps: Omit<SearchItemDescriptionProps<T>, "instance"> = {} as Omit<
        SearchItemDescriptionProps<T>,
        "instance"
      >,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItemDescription(
        {
          instance: itemResult,
          dataComponent: DATA_COMPONENT_SEARCH,
          ...descProps,
        } as ListboxItemDescriptionProps<T>,
        children,
      );

    const Indicator = <T extends keyof SeidrElementTagNameMap = "div">(
      indProps: Omit<SearchItemIndicatorProps<T>, "instance"> = {} as Omit<SearchItemIndicatorProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItemIndicator(
        {
          instance: itemResult,
          dataComponent: DATA_COMPONENT_SEARCH,
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
    props: SearchRootProps<T> = {} as SearchRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxRoot({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props }, children);

  const Label = <T extends keyof SeidrElementTagNameMap = "label">(
    props: SearchLabelProps<T> = {} as SearchLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxLabel({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props }, children);

  const Control = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SearchControlProps<T> = {} as SearchControlProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxControl({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props }, children);

  const Input = <T extends keyof SeidrElementTagNameMap = "input">(
    props: SearchInputProps<T> = {} as SearchInputProps<T>,
  ) => ComboboxInput({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props });

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: SearchTriggerProps<T> = {} as SearchTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxTrigger({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props }, children);

  const Icon = <T extends keyof SeidrElementTagNameMap = "span">(
    props: SearchIconProps<T> = {} as SearchIconProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxIcon({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props }, children);

  const Indicator = <T extends keyof SeidrElementTagNameMap = "span">(
    props: SearchIndicatorProps<T> = {} as SearchIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SearchIndicator({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props }, children);

  const NoResult = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SearchNoResultProps<T> = {} as SearchNoResultProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SearchNoResult({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props }, children);

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SearchContentProps<T> = {} as SearchContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxContent({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props }, children);

  const Listbox = <T extends keyof SeidrElementTagNameMap = "ul">(
    props: SearchListboxProps<T> = {} as SearchListboxProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ComboboxListbox({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props }, children);

  const Item = <T extends keyof SeidrElementTagNameMap = "li">(
    props: SearchItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) =>
    ListboxItem(
      {
        listbox: instance.listbox,
        dataComponent: DATA_COMPONENT_SEARCH,
        id: `${instance.id}-item-${props.value}`,
        ...props,
      },
      children,
    );

  const ItemLabel = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SearchItemLabelProps<T> = {} as SearchItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance;
    if (!itemInst) {
      throw new SeidrError("SearchItemLabel requires an item instance");
    }
    return ListboxItemLabel(
      { instance: itemInst, dataComponent: DATA_COMPONENT_SEARCH, ...props } as ListboxItemLabelProps<T>,
      children,
    );
  };

  const ItemDescription = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SearchItemDescriptionProps<T> = {} as SearchItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance;
    if (!itemInst) {
      throw new SeidrError("SearchItemDescription requires an item instance");
    }
    return ListboxItemDescription(
      { instance: itemInst, dataComponent: DATA_COMPONENT_SEARCH, ...props } as ListboxItemDescriptionProps<T>,
      children,
    );
  };

  const ItemIndicator = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SearchItemIndicatorProps<T> = {} as SearchItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance;
    if (!itemInst) {
      throw new SeidrError("SearchItemIndicator requires an item instance");
    }
    return ListboxItemIndicator(
      { instance: itemInst, dataComponent: DATA_COMPONENT_SEARCH, ...props } as ListboxItemIndicatorProps<T>,
      children,
    );
  };

  const Section = <T extends keyof SeidrElementTagNameMap = "li">(
    props: SearchSectionProps<T> = {} as SearchSectionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    ListboxSection<T>({ dataComponent: DATA_COMPONENT_SEARCH, ...props } as ListboxSectionProps<T>, children);

  const SectionLabel = <T extends keyof SeidrElementTagNameMap = "span">(
    props: SearchSectionLabelProps<T> = {} as SearchSectionLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    ListboxSectionLabel<T>({ dataComponent: DATA_COMPONENT_SEARCH, ...props } as ListboxSectionLabelProps<T>, children);

  const HiddenSelect = (props: SearchHiddenSelectProps = {}) =>
    ComboboxHiddenSelect({ instance, dataComponent: DATA_COMPONENT_SEARCH, ...props });

  const Arrow = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SearchArrowProps<T> = {} as SearchArrowProps<T>,
  ): SeidrElementTagNameMap[T] =>
    PopperArrow<T>({ instance: instance.popper, dataComponent: DATA_COMPONENT_SEARCH, ...props } as PopperArrowProps<T>);

  const Description = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SearchDescriptionProps<T> = {} as SearchDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FormControlDescription<T>(
      {
        id: instance.descriptionId,
        dataComponent: DATA_COMPONENT_SEARCH,
        ...props,
      } as FormControlDescriptionProps<T>,
      children,
    );

  const ErrorMessage = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SearchErrorMessageProps<T> = {} as SearchErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    FormControlErrorMessage<T>(
      {
        id: instance.errorMessageId,
        dataComponent: DATA_COMPONENT_SEARCH,
        ...props,
      } as FormControlErrorMessageProps<T>,
      children,
    );

  const ListHelper = (
    itemsProp: ReactiveValue<SearchNode<Option>[]>,
    listOptions: ListboxListRenderOptions = {},
  ): SeidrChild => {
    const { renderItem, renderSection, indicator, itemProps } = listOptions;
    const itemsObservable = wrapValue(itemsProp) as Value<SearchNode<Option>[]>;

    const defaultRenderItem = (itemVal: Value<SearchItemData<Option>>): SeidrChild => {
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

    const defaultRenderSection = (sectionVal: Value<SearchSectionData>): SeidrChild => {
      const secKey = sectionVal().key;
      const sectionItems = sectionVal.as((s) => s.items ?? []) as Value<SearchItemData[]>;
      return Section({ id: secKey }, [
        SectionLabel(
          {},
          sectionVal.as((s) => s.label),
        ),
        $("ul", { role: "group" }, [
          List<SearchItemData, string>(
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

    return List<SearchNode<Option>, string>(
      itemsObservable,
      (node) => {
        if (isObj(node) && "key" in node && typeof (node as SearchSectionData).key === "string") {
          return (node as SearchSectionData).key;
        }
        return (node as SearchItemData).value;
      },
      (nodeVal) => {
        const initialNode = nodeVal();
        const isSec =
          isObj(initialNode) && "items" in initialNode && Array.isArray((initialNode as SearchSectionData).items);

        if (isSec) {
          const secVal = nodeVal as unknown as Value<SearchSectionData>;
          const secKey = secVal().key;
          if (renderSection) {
            return renderSection(secVal, secKey);
          }
          return defaultRenderSection(secVal);
        }

        const itemVal = nodeVal as unknown as Value<SearchItemData<Option>>;
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
    Indicator,
    NoResult,
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
