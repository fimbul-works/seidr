import { isArr, isObj } from "@fimbul-works/hvat";
import {
  $,
  type DerivedValue,
  List,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  unwrapValue,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { MenuArrow } from "./menu-arrow.js";
import { MenuCheckboxItem } from "./menu-checkbox-item.js";
import { MenuContent } from "./menu-content.js";
import { MenuGroup } from "./menu-group.js";
import { MenuGroupLabel } from "./menu-group-label.js";
import { MenuIcon } from "./menu-icon.js";
import { MenuItem } from "./menu-item.js";
import { MenuItemDescription } from "./menu-item-description.js";
import { MenuItemIndicator } from "./menu-item-indicator.js";
import { MenuItemLabel } from "./menu-item-label.js";
import { MenuRadioGroup } from "./menu-radio-group.js";
import { MenuRadioItem } from "./menu-radio-item.js";
import { MenuRoot } from "./menu-root.js";
import { MenuSeparator } from "./menu-separator.js";
import { MenuSub } from "./menu-sub.js";
import { MenuSubContent } from "./menu-sub-content.js";
import { MenuSubTrigger } from "./menu-sub-trigger.js";
import { MenuTrigger } from "./menu-trigger.js";
import type {
  MenuArrowProps,
  MenuCheckboxItemProps,
  MenuContentProps,
  MenuGroupLabelProps,
  MenuGroupProps,
  MenuIconProps,
  MenuInstance,
  MenuItemDescriptionProps,
  MenuItemDescriptor,
  MenuItemIndicatorProps,
  MenuItemLabelProps,
  MenuItemProps,
  MenuListRenderOptions,
  MenuRadioGroupInstance,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuRootProps,
  MenuSeparatorProps,
  MenuSubContentProps,
  MenuSubProps,
  MenuSubTriggerProps,
  MenuTriggerProps,
  UseMenuOptions,
  UseMenuRadioGroupOptions,
  UseMenuRadioGroupResult,
} from "./types.js";
import { useMenu, useMenuRadioGroup } from "./use-menu.js";

let keySeq = 0;

/**
 * Creates a headless coordinator for a Menu (Tier 2).
 * Returns pre-bound element helpers and reactive observables.
 */
export function createMenu(options: UseMenuOptions = {}): MenuInstance {
  const { dataComponent = "menu", ...menuOptions } = options;
  const instance = useMenu(menuOptions);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuRoot<T>({ dataComponent, ...props, instance } as MenuRootProps<T>, children);

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props?: MenuTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuTrigger<T>({ dataComponent, ...props, instance } as MenuTriggerProps<T>, children);

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    MenuContent<T>(
      { renderList: ListHelper, dataComponent, ...props, instance } as MenuContentProps<T>,
      children,
    );

  const Item = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuItem<T>({ dataComponent, ...props, instance } as MenuItemProps<T>, children);

  const CheckboxItem = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuCheckboxItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuCheckboxItem<T>({ dataComponent, ...props, instance } as MenuCheckboxItemProps<T>, children);

  let activeRadioGroup: UseMenuRadioGroupResult | undefined;

  const createRadioGroup = (radioOptions: UseMenuRadioGroupOptions = {}): MenuRadioGroupInstance => {
    const radioGroupInstance = useMenuRadioGroup(radioOptions);
    activeRadioGroup = radioGroupInstance;

    const Root = <T extends keyof SeidrElementTagNameMap = "div">(
      props?: MenuRadioGroupProps<T>,
      children?: SeidrChild | SeidrChild[],
    ): SeidrElementTagNameMap[T] =>
      MenuRadioGroup<T>(
        { dataComponent, ...props, instance, radioGroupInstance } as MenuRadioGroupProps<T>,
        children,
      );

    const Item = <T extends keyof SeidrElementTagNameMap = "div">(
      props: MenuRadioItemProps<T>,
      children?: SeidrChild | SeidrChild[],
    ): SeidrElementTagNameMap[T] =>
      MenuRadioItem<T>(
        { dataComponent, ...props, instance, radioGroupInstance } as MenuRadioItemProps<T>,
        children,
      );

    return {
      ...radioGroupInstance,
      Root,
      Item,
    };
  };

  const RadioGroup = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuRadioGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] => {
    const radioGroup =
      props?.radioGroupInstance ??
      activeRadioGroup ??
      useMenuRadioGroup({
        value: props?.value,
        defaultValue: props?.defaultValue,
        onChange: props?.onChange,
        disabled: props?.disabled,
      });
    activeRadioGroup = radioGroup;
    return MenuRadioGroup<T>(
      { dataComponent, ...props, instance, radioGroupInstance: radioGroup } as MenuRadioGroupProps<T>,
      children,
    );
  };

  const RadioItem = <T extends keyof SeidrElementTagNameMap = "div">(
    props: MenuRadioItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuRadioItem<T>(
      {
        dataComponent,
        ...props,
        instance,
        radioGroupInstance: props.radioGroupInstance ?? activeRadioGroup,
      } as MenuRadioItemProps<T>,
      children,
    );

  const createSub = (subOptions: Omit<UseMenuOptions, "parentMenu"> = {}): MenuInstance => {
    return createMenu({
      dataComponent,
      ...subOptions,
      parentMenu: instance,
      placement: subOptions.placement ?? "right-start",
    });
  };

  const Sub = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuSub<T>({ dataComponent, ...props, instance } as MenuSubProps<T>, children);

  const SubTrigger = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuSubTrigger<T>({ dataComponent, ...props, instance } as MenuSubTriggerProps<T>, children);

  const SubContent = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuSubContentProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    MenuSubContent<T>({ dataComponent, ...props, instance } as MenuSubContentProps<T>, children);

  const Separator = <T extends keyof SeidrElementTagNameMap = "hr">(
    props?: MenuSeparatorProps<T>,
  ): SeidrElementTagNameMap[T] =>
    MenuSeparator<T>({ dataComponent, ...props, instance } as MenuSeparatorProps<T>);

  const Group = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuGroupProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuGroup<T>({ dataComponent, ...props, instance } as MenuGroupProps<T>, children);

  const GroupLabel = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuGroupLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuGroupLabel<T>({ dataComponent, ...props, instance } as MenuGroupLabelProps<T>, children);

  const ItemLabel = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuItemLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuItemLabel<T>({ dataComponent, ...props, instance } as MenuItemLabelProps<T>, children);

  const ItemDescription = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuItemDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuItemDescription<T>(
      { dataComponent, ...props, instance } as MenuItemDescriptionProps<T>,
      children,
    );

  const ItemIndicator = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuItemIndicatorProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    MenuItemIndicator<T>(
      { dataComponent, ...props, instance } as MenuItemIndicatorProps<T>,
      children,
    );

  const Icon = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: MenuIconProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    MenuIcon<T>({ dataComponent, ...props, instance } as MenuIconProps<T>, children);

  const Arrow = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: MenuArrowProps<T>,
  ): SeidrElementTagNameMap[T] =>
    MenuArrow<T>({ dataComponent, ...props, instance } as MenuArrowProps<T>);

  const ListHelper = (
    itemsProp: ReactiveValue<MenuItemDescriptor[]>,
    listOptions: MenuListRenderOptions = {},
  ): SeidrChild => {
    const { renderItem, itemProps } = listOptions;
    const itemsObservable = wrapValue(itemsProp);

    return List<MenuItemDescriptor, string>(
      itemsObservable,
      (item) => {
        if ("value" in item && item.value !== undefined) {
          const val = unwrapValue(item.value);
          if (val) return String(val);
        }
        return `menu-item-key-${++keySeq}`;
      },
      (itemVal) => {
        const descriptor = itemVal();
        const rawKey =
          "value" in descriptor && descriptor.value !== undefined
            ? unwrapValue(descriptor.value)
            : undefined;
        const itemKey = rawKey ? String(rawKey) : `key-${keySeq}`;

        if (renderItem) {
          return renderItem(itemVal, itemKey, menuInstance);
        }

        if (descriptor.type === "separator") {
          return Separator();
        }

        if (descriptor.type === "group") {
          return Group({}, [
            descriptor.label ? GroupLabel({}, descriptor.label) : null,
            ListHelper(descriptor.items),
          ]);
        }

        if (descriptor.type === "checkbox") {
          const { children: descChildren, ...descProps } = (descriptor.props ?? {}) as Record<string, any>;
          return CheckboxItem(
            {
              value: itemKey,
              checked: descriptor.checked,
              defaultChecked: descriptor.defaultChecked,
              onChange: descriptor.onChange,
              disabled: descriptor.disabled,
              closeOnSelect: descriptor.closeOnSelect,
              onSelect: descriptor.onSelect,
              ...(itemProps ?? {}),
              ...descProps,
            },
            [
              descriptor.indicator ? ItemIndicator({}, descriptor.indicator) : null,
              descriptor.label ?? itemKey,
              descriptor.description ? ItemDescription({}, descriptor.description) : null,
              descriptor.children,
              descChildren,
            ],
          );
        }

        if (descriptor.type === "radio-group") {
          const radioGroupCoord = useMenuRadioGroup({
            value: descriptor.value,
            defaultValue: descriptor.defaultValue,
            onChange: descriptor.onChange,
            disabled: descriptor.disabled,
          });

          const renderedRadioItems = descriptor.items.map((radio) => {
            const { children: radioDescChildren, ...radioDescProps } = (radio.props ?? {}) as Record<string, any>;
            return MenuRadioItem(
              {
                instance,
                radioGroupInstance: radioGroupCoord,
                value: radio.value,
                disabled: radio.disabled,
                ...radioDescProps,
              },
              [
                radio.indicator ? ItemIndicator({}, radio.indicator) : null,
                radio.label ?? radio.value,
                radio.description ? ItemDescription({}, radio.description) : null,
                radio.children,
                radioDescChildren,
              ],
            );
          });

          return MenuRadioGroup(
            {
              instance,
              radioGroupInstance: radioGroupCoord,
            },
            [
              descriptor.label ? GroupLabel({}, descriptor.label) : null,
              ...renderedRadioItems,
            ],
          );
        }

        if (descriptor.type === "sub") {
          const subCoord = createSub();
          return Sub({ subInstance: subCoord }, [
            SubTrigger({ subInstance: subCoord, value: itemKey, disabled: descriptor.disabled }, [
              descriptor.label ?? itemKey,
            ]),
            SubContent({ subInstance: subCoord }, [subCoord.List(descriptor.items)]),
          ]);
        }

        // Standard "item"
        const { children: descChildren, ...descProps } = (descriptor.props ?? {}) as Record<string, any>;
        return Item(
          {
            value: itemKey,
            disabled: descriptor.disabled,
            closeOnSelect: descriptor.closeOnSelect,
            onSelect: descriptor.onSelect,
            textValue: descriptor.textValue,
            ...(itemProps ?? {}),
            ...descProps,
          },
          [
            descriptor.icon ? Icon({}, descriptor.icon) : null,
            descriptor.label ?? itemKey,
            descriptor.description ? ItemDescription({}, descriptor.description) : null,
            descriptor.children,
            descChildren,
          ],
        );
      },
    );
  };

  const menuInstance: MenuInstance = {
    ...instance,
    Root,
    Trigger,
    Content,
    Item,
    CheckboxItem,
    createRadioGroup,
    RadioGroup,
    RadioItem,
    createSub,
    Sub,
    SubTrigger,
    SubContent,
    Separator,
    Group,
    GroupLabel,
    ItemLabel,
    ItemDescription,
    ItemIndicator,
    Icon,
    Arrow,
    List: ListHelper,
  };

  return menuInstance;
}

