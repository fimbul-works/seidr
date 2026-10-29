import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { TabsListProps } from "./types.js";

/**
 * TabsList contains the tab triggers (role="tablist").
 */
export function TabsList<T extends keyof SeidrElementTagNameMap = "div">(
  props: TabsListProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: tabs, ...rest } = props;

  if (!tabs) {
    throw new SeidrError("TabsList requires an instance coordinator");
  }

  return $(
    as as T,
    {
      role: "tablist",
      "aria-orientation": tabs.orientation,
      "data-orientation": tabs.orientation,
      dataComponent: "tabs",
      dataPart: "list",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
