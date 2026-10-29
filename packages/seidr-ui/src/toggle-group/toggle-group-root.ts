import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ToggleGroupRootProps } from "./types.js";

/**
 * Root container for a group of toggle buttons (role="group").
 */
export function ToggleGroupRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: ToggleGroupRootProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: toggleGroup, dataComponent = "toggle-group", ...rest } = props;

  if (!toggleGroup) {
    throw new SeidrError("ToggleGroupRoot requires an instance coordinator");
  }

  return $(
    as as T,
    {
      id: toggleGroup.id,
      role: "group",
      dataComponent,
      dataPart: "root",
      dataOrientation: toggleGroup.orientation,
      dataDisabled: toggleGroup.isDisabled.as((d) => (d ? "" : undefined)),
      ariaDisabled: toggleGroup.isDisabled.as((d) => (d ? "true" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
