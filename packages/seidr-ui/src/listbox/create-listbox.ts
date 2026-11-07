import { isObj } from "@fimbul-works/hvat";
import {
  $,
  List,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementTagNameMap,
  SeidrError,
  Switch,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { ListboxItem } from "./listbox-item.js";
import { ListboxItemDescription } from "./listbox-item-description.js";
import { ListboxItemIndicator } from "./listbox-item-indicator.js";
import { ListboxItemLabel } from "./listbox-item-label.js";
import { ListboxRoot } from "./listbox-root.js";
import { ListboxSection } from "./listbox-section.js";
import { ListboxSectionLabel } from "./listbox-section-label.js";
import type {
  ListboxInstance,
  ListboxItemData,
  ListboxItemDescriptionProps,
  ListboxItemIndicatorProps,
  ListboxItemInstance,
  ListboxItemLabelProps,
  ListboxItemProps,
  ListboxListRenderOptions,
  ListboxNode,
  ListboxRootProps,
  ListboxSectionData,
  ListboxSectionLabelProps,
  ListboxSectionProps,
  UseListboxItemOptions,
  UseListboxItemResult,
  UseListboxOptions,
} from "./types.js";
import { useListbox } from "./use-listbox.js";
import { useListboxItem } from "./use-listbox-item.js";

/**
 * Creates a Listbox state coordinator instance with pre-bound compound element helpers (Tier 2).
 */
export function createListbox(options: UseListboxOptions = {}): ListboxInstance {
  const instance = useListbox(options);

  let currentItemInstance: UseListboxItemResult | null = null;

  const createItem = (itemOptions: UseListboxItemOptions): ListboxItemInstance => {
    const itemInstance = useListboxItem(instance, itemOptions);

    const Root = <T extends keyof SeidrElementTagNameMap = "li">(
      props: Omit<ListboxItemProps<T>, "instance" | "value"> = {} as Omit<ListboxItemProps<T>, "instance" | "value">,
      children?: SeidrChild | SeidrChild[],
    ) => ListboxItem({ instance: itemInstance, value: itemOptions.value, ...props } as ListboxItemProps<T>, children);

    const Label = <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<ListboxItemLabelProps<T>, "instance"> = {} as Omit<ListboxItemLabelProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ListboxItemLabel({ instance: itemInstance, ...props } as ListboxItemLabelProps<T>, children);

    const Description = <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<ListboxItemDescriptionProps<T>, "instance"> = {} as Omit<ListboxItemDescriptionProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ListboxItemDescription({ instance: itemInstance, ...props } as ListboxItemDescriptionProps<T>, children);

    const Indicator = <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<ListboxItemIndicatorProps<T>, "instance"> = {} as Omit<ListboxItemIndicatorProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ListboxItemIndicator({ instance: itemInstance, ...props } as ListboxItemIndicatorProps<T>, children);

    return {
      ...itemInstance,
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

  const Root = <T extends keyof SeidrElementTagNameMap = "ul">(
    props: Omit<ListboxRootProps<T>, "instance"> = {} as Omit<ListboxRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => ListboxRoot({ instance, ...props } as ListboxRootProps<T>, children);

  const Item = <T extends keyof SeidrElementTagNameMap = "li">(
    props: Omit<ListboxItemProps<T>, "instance"> & { value: string },
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInstance = useListboxItem(instance, {
      value: props.value,
      disabled: props.disabled,
      textValue: props.textValue,
      id: typeof props.id === "string" ? props.id : undefined,
    });
    const previous = currentItemInstance;
    currentItemInstance = itemInstance;
    try {
      return ListboxItem({ instance: itemInstance, ...props } as ListboxItemProps<T>, children);
    } finally {
      currentItemInstance = previous;
    }
  };

  const ItemLabel = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<ListboxItemLabelProps<T>, "instance"> & { instance?: UseListboxItemResult } = {} as Omit<
      ListboxItemLabelProps<T>,
      "instance"
    > & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance ?? currentItemInstance;
    if (!itemInst) {
      throw new SeidrError("ListboxItemLabel requires an item instance or must be rendered inside ListboxItem");
    }
    return ListboxItemLabel({ instance: itemInst, ...props } as ListboxItemLabelProps<T>, children);
  };

  const ItemDescription = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<ListboxItemDescriptionProps<T>, "instance"> & { instance?: UseListboxItemResult } = {} as Omit<
      ListboxItemDescriptionProps<T>,
      "instance"
    > & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance ?? currentItemInstance;
    if (!itemInst) {
      throw new SeidrError("ListboxItemDescription requires an item instance or must be rendered inside ListboxItem");
    }
    return ListboxItemDescription({ instance: itemInst, ...props } as ListboxItemDescriptionProps<T>, children);
  };

  const ItemIndicator = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<ListboxItemIndicatorProps<T>, "instance"> & { instance?: UseListboxItemResult } = {} as Omit<
      ListboxItemIndicatorProps<T>,
      "instance"
    > & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance ?? currentItemInstance;
    if (!itemInst) {
      throw new SeidrError("ListboxItemIndicator requires an item instance or must be rendered inside ListboxItem");
    }
    return ListboxItemIndicator({ instance: itemInst, ...props } as ListboxItemIndicatorProps<T>, children);
  };

  const Section = <T extends keyof SeidrElementTagNameMap = "li">(
    props: ListboxSectionProps<T> = {} as ListboxSectionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ListboxSection(props, children);

  const SectionLabel = <T extends keyof SeidrElementTagNameMap = "span">(
    props: ListboxSectionLabelProps<T> = {} as ListboxSectionLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => ListboxSectionLabel(props, children);

  const ListHelper = (
    itemsProp: ReactiveValue<ListboxNode[]>,
    listOptions: ListboxListRenderOptions = {},
  ): SeidrChild => {
    const { renderItem, renderSection, indicator, itemProps } = listOptions;
    const itemsObservable = wrapValue(itemsProp) as Value<ListboxNode[]>;

    const defaultRenderItem = (itemVal: Value<ListboxItemData>): SeidrChild => {
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

    const defaultRenderSection = (sectionVal: Value<ListboxSectionData>): SeidrChild => {
      const secKey = sectionVal().key;
      const sectionItems = sectionVal.as((s) => s.items ?? []) as Value<ListboxItemData[]>;
      return Section({ id: secKey }, [
        SectionLabel({}, sectionVal.as((s) => s.label)),
        $("ul", { role: "group" }, [
          List<ListboxItemData, string>(
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

    return List<ListboxNode, string>(
      itemsObservable,
      (node) =>
        isObj(node) && "type" in node && (node as any).type === "section"
          ? (node as ListboxSectionData).key
          : (node as ListboxItemData).value,
      (nodeVal) => {
        const node = nodeVal();
        const isSection =
          isObj(node) &&
          (("type" in node && (node as any).type === "section") ||
            ("items" in node && Array.isArray((node as any).items)));

        if (isSection) {
          const secVal = nodeVal as Value<ListboxSectionData>;
          const secKey = secVal().key;
          if (renderSection) {
            return renderSection(secVal, secKey);
          }
          return defaultRenderSection(secVal);
        }

        const itemVal = nodeVal as Value<ListboxItemData>;
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
    Item,
    ItemLabel,
    ItemDescription,
    ItemIndicator,
    Section,
    SectionLabel,
    List: ListHelper,
  };
}
