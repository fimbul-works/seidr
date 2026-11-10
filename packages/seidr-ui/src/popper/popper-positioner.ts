import { isFn, isObj } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  mergeStyleProps,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_POPPEER, DATA_PART_POSITIONER } from "../constants.js";
import type { PopperPositionerProps } from "./types.js";

/**
 * Floating container element positioned relative to the popper anchor.
 */
export function PopperPositioner<T extends keyof SeidrElementTagNameMap = "div">(
  props: PopperPositionerProps<T> = {} as PopperPositionerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: popper,
    ref: userRef,
    style: userStyle,
    dataComponent = DATA_COMPONENT_POPPEER,
    ...rest
  } = props;

  if (!popper) {
    throw new SeidrError("PopperPositioner requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    popper.positionerRef(el);
  });

  const baseStyle: Record<string, string | number> = {
    position: "absolute",
    top: 0,
    left: 0,
    minWidth: "max-content",
  };

  return $(
    as,
    {
      ref: internalRef,
      dataComponent,
      dataPart: DATA_PART_POSITIONER,
      dataPopperPositioner: "",
      dataPlacement: popper.currentPlacement,
      style: mergeStyleProps(baseStyle, userStyle),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
