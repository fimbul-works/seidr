import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { PopperRootProps } from "./types.js";

/**
 * Root container for a Popper positioning context.
 */
export function PopperRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: PopperRootProps<T> = {} as PopperRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: popper, dataComponent = "popper", ...rest } = props;

  if (!popper) {
    throw new SeidrError("PopperRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      id: popper.id,
      dataComponent,
      dataPart: "root",
      dataPlacement: popper.currentPlacement,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

