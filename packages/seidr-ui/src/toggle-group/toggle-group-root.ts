import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_TOGGLE_GROUP, DATA_PART_ROOT } from "../constants.js";
import type { ToggleGroupRootProps } from "./types.js";

/**
 * Root container for a group of toggle buttons (role="group").
 */
export function ToggleGroupRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: ToggleGroupRootProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: toggleGroup, ...rest } = props;

  if (!toggleGroup) {
    throw new SeidrError("ToggleGroupRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      id: toggleGroup.id,
      role: "group",
      dataComponent: DATA_COMPONENT_TOGGLE_GROUP,
      dataPart: DATA_PART_ROOT,
      dataOrientation: toggleGroup.orientation,
      dataDisabled: toggleGroup.isDisabled.as((d) => (d ? "" : undefined)),
      ariaDisabled: toggleGroup.isDisabled.as((d) => (d ? "true" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
