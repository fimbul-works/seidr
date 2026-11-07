import {
  List,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementTagNameMap,
  unwrapValue,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";
import { ToggleGroupItem } from "./toggle-group-item.js";
import { ToggleGroupRoot } from "./toggle-group-root.js";
import type {
  ToggleGroupInstance,
  ToggleGroupItemData,
  ToggleGroupItemProps,
  ToggleGroupListRenderOptions,
  ToggleGroupRootProps,
  UseToggleGroupOptions,
} from "./types.js";
import { useToggleGroup } from "./use-toggle-group.js";

/**
 * Creates a headless coordinator for a ToggleGroup (Tier 2).
 * Returns pre-bound subcomponents (Root, Item, List) and reactive observables.
 */
export function createToggleGroup(options: UseToggleGroupOptions = {}): ToggleGroupInstance {
  const instance = useToggleGroup(options);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: Omit<ToggleGroupRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ) => ToggleGroupRoot({ instance, ...props } as ToggleGroupRootProps<T>, children);

  const Item = <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<ToggleGroupItemProps<T>, "instance"> & { value: string },
    children?: SeidrChild | SeidrChild[],
  ) => ToggleGroupItem({ instance, ...props } as ToggleGroupItemProps<T>, children);

  const ListHelper = (
    itemsProp: ReactiveValue<ToggleGroupItemData[]>,
    listOptions: ToggleGroupListRenderOptions = {},
  ): SeidrChild => {
    const { renderItem, itemProps } = listOptions;
    const itemsObservable = wrapValue(itemsProp);

    return List<ToggleGroupItemData, string>(
      itemsObservable,
      (item) => item.value,
      (itemVal) => {
        const descriptor = itemVal();
        const itemKey = descriptor.value;
        if (renderItem) {
          return renderItem(itemVal, itemKey, groupInstance);
        }
        return Item(
          {
            value: itemKey,
            disabled: itemVal.as((i) => unwrapValue(i.disabled ?? false)),
            ...(itemProps ?? {}),
            ...(descriptor.props ?? {}),
          },
          itemVal.as((i) => i.label ?? i.value),
        );
      },
    );
  };

  const groupInstance: ToggleGroupInstance = {
    ...instance,
    Root,
    Item,
    List: ListHelper,
  };

  return groupInstance;
}
