import { isFn, isObj, isUndef } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  mergeStyleProps,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_POPPEER, DATA_PART_ARROW } from "../constants.js";
import type { BasePlacement, PopperArrowProps } from "./types.js";
import { ARROW_PATH, ROTATION_DEG } from "./utils.js";

/**
 * Arrow indicator element for Popper overlays.
 */
export function PopperArrow<T extends keyof SeidrElementTagNameMap = "div">(
  props: PopperArrowProps<T> = {} as PopperArrowProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: popper,
    size = 30,
    ref: userRef,
    style: userStyle,
    dataComponent = DATA_COMPONENT_POPPEER,
    ...rest
  } = props;

  if (!popper) {
    throw new SeidrError("PopperArrow requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    popper.arrowRef(el);
  });

  const baseDir = popper.currentPlacement.as((p) => p.split("-")[0] as BasePlacement);
  const rotation = baseDir.as((d) => `rotate(${ROTATION_DEG[d] ?? 0}deg)`);

  const baseStyle: Record<string, string | number> = {
    position: "absolute",
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: "none",
  };

  const combinedStyle = mergeStyleProps(baseStyle, userStyle)

  if (!isUndef(children)) {
    return $(
      as,
      {
        ref: internalRef,
        ariaHidden: "true",
        dataComponent,
        dataPart: DATA_PART_ARROW,
        dataPlacement: popper.currentPlacement,
        style: combinedStyle,
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );
  }

  return $(as, {
    ref: internalRef,
    ariaHidden: "true",
    dataComponent,
    dataPart: DATA_PART_ARROW,
    dataPlacement: popper.currentPlacement,
    style: combinedStyle,
    innerHTML: rotation.as(
      (rot) =>
        `<svg viewBox="0 0 30 30" width="${size}" height="${size}" style="transform:${rot};display:block;"><path d="${ARROW_PATH}" fill="currentColor" /></svg>`,
//        `<svg viewBox="0 0 30 30" width="${size}" height="${size}" style="transform:${rot};transform-origin:top center;display:block;"><path d="${ARROW_PATH}" fill="currentColor" /></svg>`,
    ),
    ...rest,
  } as SeidrElementProps<T>);
}
