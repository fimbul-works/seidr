import type { SeidrChild, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { ToggleGroupItem } from "./toggle-group-item.js";
import { ToggleGroupRoot } from "./toggle-group-root.js";
import type {
  ToggleGroupInstance,
  ToggleGroupItemProps,
  ToggleGroupRootProps,
  UseToggleGroupOptions,
} from "./types.js";
import { useToggleGroup } from "./use-toggle-group.js";

/**
 * Creates a headless coordinator for a ToggleGroup (Tier 2).
 * Returns pre-bound subcomponents (Root, Item) and reactive observables.
 */
export function createToggleGroup(options: UseToggleGroupOptions = {}): ToggleGroupInstance {
  const instance = useToggleGroup(options);

  return {
    ...instance,
    Root: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: Omit<ToggleGroupRootProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ToggleGroupRoot({ instance, ...props } as ToggleGroupRootProps<T>, children),
    Item: <T extends keyof SeidrElementTagNameMap = "button">(
      props: Omit<ToggleGroupItemProps<T>, "instance"> & { value: string },
      children?: SeidrChild | SeidrChild[],
    ) => ToggleGroupItem({ instance, ...props } as ToggleGroupItemProps<T>, children),
  };
}
