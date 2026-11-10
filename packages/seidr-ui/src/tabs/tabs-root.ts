import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_TABS, DATA_PART_ROOT } from "../constants.js";
import type { TabsRootProps } from "./types.js";

/**
 * TabsRoot contains all the parts of a tabs component.
 */
export function TabsRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: TabsRootProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: tabs, ...rest } = props;

  if (!tabs) {
    throw new SeidrError("TabsRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      id: tabs.id,
      "data-orientation": tabs.orientation,
      "data-disabled": tabs.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent: DATA_COMPONENT_TABS,
      dataPart: DATA_PART_ROOT,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
