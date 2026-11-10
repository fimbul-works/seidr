import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_HOVER_CARD, DATA_PART_ROOT } from "../constants.js";
import type { HoverCardRootProps } from "./types.js";

/**
 * Root container element for a HoverCard component.
 */
export function HoverCardRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: HoverCardRootProps<T> = {} as HoverCardRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: hoverCard, dataComponent = DATA_COMPONENT_HOVER_CARD, ...rest } = props;

  if (!hoverCard) {
    throw new SeidrError("HoverCardRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent,
      dataPart: DATA_PART_ROOT,
      dataExpanded: hoverCard.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: hoverCard.isOpen.as((o) => (!o ? "" : undefined)),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
