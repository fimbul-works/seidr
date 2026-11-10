import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_POPPEER, DATA_PART_ROOT } from "../constants.js";
import type { PopperRootProps } from "./types.js";

/**
 * Root container for a Popper positioning context.
 */
export function PopperRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: PopperRootProps<T> = {} as PopperRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: popper, dataComponent = DATA_COMPONENT_POPPEER, ...rest } = props;

  if (!popper) {
    throw new SeidrError("PopperRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      id: popper.id,
      dataComponent,
      dataPart: DATA_PART_ROOT,
      dataPlacement: popper.currentPlacement,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
