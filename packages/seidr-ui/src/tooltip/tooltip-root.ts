import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { TooltipRootProps } from "./types.js";

/**
 * Root container element for a Tooltip component.
 */
export function TooltipRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: TooltipRootProps<T> = {} as TooltipRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: tooltip,
    dataComponent = "tooltip",
    ...rest
  } = props;

  if (!tooltip) {
    throw new SeidrError("TooltipRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: "root",
      dataExpanded: tooltip.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: tooltip.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

