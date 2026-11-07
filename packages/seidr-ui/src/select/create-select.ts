import { isObj } from "@fimbul-works/hvat";
import {
  $,
  type DerivedValue,
  getDocument,
  List,
  Portal,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
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
import { SelectContent } from "./select-content.js";
import { SelectHiddenSelect } from "./select-hidden-select.js";
import { SelectIcon } from "./select-icon.js";
import { SelectLabel } from "./select-label.js";
import { SelectListbox } from "./select-listbox.js";
import { SelectRoot } from "./select-root.js";
import { SelectTrigger } from "./select-trigger.js";
import { SelectValue } from "./select-value.js";
import type {
  SelectArrowProps,
  SelectContentProps,
  SelectDescriptionProps,
  SelectErrorMessageProps,
  SelectHiddenSelectProps,
  SelectIconProps,
  SelectInstance,
  SelectItemData,
  SelectItemDescriptionProps,
  SelectItemIndicatorProps,
  SelectItemLabelProps,
  SelectItemProps,
  SelectLabelProps,
  SelectListboxProps,
  SelectNode,
  SelectPortalProps,
  SelectRootProps,
  SelectSectionData,
  SelectSectionLabelProps,
  SelectSectionProps,
  SelectTriggerProps,
  SelectValueProps,
  UseSelectOptions,
} from "./types.js";
import { useSelect } from "./use-select.js";

/**
 * Creates a Select state coordinator instance with pre-bound compound element helpers (Tier 2).
 */
export function createSelect<Option = any, OptGroup = any>(
  options: UseSelectOptions<Option, OptGroup> = {},
): SelectInstance<Option> {
  const instance = useSelect<Option, OptGroup>(options);

  let currentItemInstance: UseListboxItemResult | null = null;

  const createItem = (itemOptions: UseListboxItemOptions): ListboxItemInstance => {
    const itemInstance = useListboxItem(instance.listbox, itemOptions);

    const Root = <T extends keyof SeidrElementTagNameMap = "li">(
      props: Omit<SelectItemProps<T>, "instance" | "value"> = {} as Omit<SelectItemProps<T>, "instance" | "value">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItem(
        {
          instance: itemInstance,
          value: itemOptions.value,
          dataComponent: "select",
          ...props,
        } as ListboxItemProps<T>,
        children,
      );

    const Label = <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<SelectItemLabelProps<T>, "instance"> = {} as Omit<SelectItemLabelProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItemLabel(
        { instance: itemInstance, dataComponent: "select", ...props } as ListboxItemLabelProps<T>,
        children,
      );

    const Description = <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<SelectItemDescriptionProps<T>, "instance"> = {} as Omit<SelectItemDescriptionProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItemDescription(
        { instance: itemInstance, dataComponent: "select", ...props } as ListboxItemDescriptionProps<T>,
        children,
      );

    const Indicator = <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<SelectItemIndicatorProps<T>, "instance"> = {} as Omit<SelectItemIndicatorProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) =>
      ListboxItemIndicator(
        { instance: itemInstance, dataComponent: "select", ...props } as ListboxItemIndicatorProps<T>,
        children,
      );

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

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<SelectRootProps<T>, "instance"> = {} as Omit<SelectRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SelectRoot({ instance, ...props } as SelectRootProps<T>, children);

  const Label = <T extends keyof SeidrElementTagNameMap = "span">(
    props: Omit<SelectLabelProps<T>, "instance"> = {} as Omit<SelectLabelProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SelectLabel({ instance, ...props } as SelectLabelProps<T>, children);

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<SelectTriggerProps<T>, "instance"> = {} as Omit<SelectTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SelectTrigger({ instance, ...props } as SelectTriggerProps<T>, children);

  const Value = <T extends keyof SeidrElementTagNameMap = "span">(
    props: Omit<SelectValueProps<T>, "instance"> = {} as Omit<SelectValueProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SelectValue({ instance, ...props } as SelectValueProps<T>, children);

  const Icon = <T extends keyof SeidrElementTagNameMap = "span">(
    props: Omit<SelectIconProps<T>, "instance"> = {} as Omit<SelectIconProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SelectIcon({ instance, ...props } as SelectIconProps<T>, children);

  const PortalHelper = (props: SelectPortalProps = {}, children?: SeidrChild | SeidrChild[]): SeidrChild => {
    const target = props.target ?? instance.portalTarget ?? getDocument().body;
    instance.portalTarget = undefined;
    const renderPortal = () => Portal(target, () => children ?? null, "SelectPortal");
    if (instance.forceMount) {
      return renderPortal();
    }
    return Show(instance.isOpen, renderPortal);
  };

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<SelectContentProps<T>, "instance"> = {} as Omit<SelectContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SelectContent({ instance, ...props } as SelectContentProps<T>, children);

  const Listbox = <T extends keyof SeidrElementTagNameMap = "ul">(
    props: Omit<SelectListboxProps<T>, "instance"> = {} as Omit<SelectListboxProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => SelectListbox({ instance, ...props } as SelectListboxProps<T>, children);

  const Item = <T extends keyof SeidrElementTagNameMap = "li">(
    props: Omit<SelectItemProps<T>, "instance"> & { value: string },
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInstance = useListboxItem(instance.listbox, {
      value: props.value,
      disabled: props.disabled,
      textValue: props.textValue,
      id: typeof props.id === "string" ? props.id : undefined,
    });
    const previous = currentItemInstance;
    currentItemInstance = itemInstance;
    try {
      return ListboxItem({ instance: itemInstance, dataComponent: "select", ...props } as ListboxItemProps<T>, children);
    } finally {
      currentItemInstance = previous;
    }
  };

  const ItemLabel = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<SelectItemLabelProps<T>, "instance"> & { instance?: UseListboxItemResult } = {} as Omit<
      SelectItemLabelProps<T>,
      "instance"
    > & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance ?? currentItemInstance;
    if (!itemInst) {
      throw new SeidrError("SelectItemLabel requires an item instance or must be rendered inside SelectItem");
    }
    return ListboxItemLabel({ instance: itemInst, dataComponent: "select", ...props } as ListboxItemLabelProps<T>, children);
  };

  const ItemDescription = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<SelectItemDescriptionProps<T>, "instance"> & { instance?: UseListboxItemResult } = {} as Omit<
      SelectItemDescriptionProps<T>,
      "instance"
    > & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance ?? currentItemInstance;
    if (!itemInst) {
      throw new SeidrError("SelectItemDescription requires an item instance or must be rendered inside SelectItem");
    }
    return ListboxItemDescription(
      { instance: itemInst, dataComponent: "select", ...props } as ListboxItemDescriptionProps<T>,
      children,
    );
  };

  const ItemIndicator = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<SelectItemIndicatorProps<T>, "instance"> & { instance?: UseListboxItemResult } = {} as Omit<
      SelectItemIndicatorProps<T>,
      "instance"
    > & { instance?: UseListboxItemResult },
    children?: SeidrChild | SeidrChild[],
  ) => {
    const itemInst = props.instance ?? currentItemInstance;
    if (!itemInst) {
      throw new SeidrError("SelectItemIndicator requires an item instance or must be rendered inside SelectItem");
    }
    return ListboxItemIndicator(
      { instance: itemInst, dataComponent: "select", ...props } as ListboxItemIndicatorProps<T>,
      children,
    );
  };

  const Section = <T extends keyof SeidrElementTagNameMap = "li">(
    props: SelectSectionProps<T> = {} as SelectSectionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    ListboxSection<T>({ dataComponent: "select", ...props } as ListboxSectionProps<T>, children);

  const SectionLabel = <T extends keyof SeidrElementTagNameMap = "span">(
    props: SelectSectionLabelProps<T> = {} as SelectSectionLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    ListboxSectionLabel<T>({ dataComponent: "select", ...props } as ListboxSectionLabelProps<T>, children);

  const HiddenSelect = (props: SelectHiddenSelectProps = {}) =>
    SelectHiddenSelect({ instance, dataComponent: "select", ...props });

  const Arrow = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SelectArrowProps<T> = {} as SelectArrowProps<T>,
  ): SeidrElementTagNameMap[T] =>
    PopperArrow<T>({ instance: instance.popper, dataComponent: "select", ...props } as PopperArrowProps<T>);

  const Description = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SelectDescriptionProps<T> = {} as SelectDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FormControlDescription<T>(
      {
        id: instance.descriptionId,
        dataComponent: "select",
        ...props,
      } as FormControlDescriptionProps<T>,
      children,
    );

  const ErrorMessage = <T extends keyof SeidrElementTagNameMap = "div">(
    props: SelectErrorMessageProps<T> = {} as SelectErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    FormControlErrorMessage<T>(
      {
        id: instance.errorMessageId,
        dataComponent: "select",
        ...props,
      } as FormControlErrorMessageProps<T>,
      children,
    );

  const ListHelper = (
    itemsProp: ReactiveValue<SelectNode<Option>[]>,
    listOptions: ListboxListRenderOptions = {},
  ): SeidrChild => {
    const { renderItem, renderSection, indicator, itemProps } = listOptions;
    const itemsObservable = wrapValue(itemsProp) as Value<SelectNode<Option>[]>;

    const defaultRenderItem = (itemVal: Value<SelectItemData<Option>>): SeidrChild => {
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

    const defaultRenderSection = (sectionVal: Value<SelectSectionData<Option>>): SeidrChild => {
      const secKey = sectionVal().key;
      const sectionItems = sectionVal.as((s) => s.items ?? []) as Value<SelectItemData<Option>[]>;
      return Section({ id: secKey }, [
        SectionLabel({}, sectionVal.as((s) => s.label)),
        $("ul", { role: "group" }, [
          List<SelectItemData<Option>, string>(
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

    return List<SelectNode<Option>, string>(
      itemsObservable,
      (node) =>
        isObj(node) && "type" in node && (node as any).type === "section"
          ? (node as SelectSectionData<Option>).key
          : (node as SelectItemData<Option>).value,
      (nodeVal) => {
        const node = nodeVal();
        const isSection =
          isObj(node) &&
          (("type" in node && (node as any).type === "section") ||
            ("items" in node && Array.isArray((node as any).items)));

        if (isSection) {
          const secVal = nodeVal as Value<SelectSectionData<Option>>;
          const secKey = secVal().key;
          if (renderSection) {
            return renderSection(secVal, secKey);
          }
          return defaultRenderSection(secVal);
        }

        const itemVal = nodeVal as Value<SelectItemData<Option>>;
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
    Trigger,
    Value,
    Icon,
    Portal: PortalHelper,
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
