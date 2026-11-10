import { isObj } from "@fimbul-works/hvat";
import {
  $,
  mergeStyleProps,
  mergeValues,
  type ReactiveStyleDeclaration,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_PART_REGION } from "../constants.js";
import type { ToastRegionRootProps } from "./types.js";

/**
 * Root landmark container (`role="region"`) for displaying toast notifications.
 */
export function ToastRegionRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: ToastRegionRootProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: region,
    id: customId,
    role = "region",
    tabIndex = -1,
    style: userStyle,
    dataComponent,
    ariaLabel,
    "aria-label": ariaLabelHyphen,
    ariaLabelledBy,
    "aria-labelledby": ariaLabelledByHyphen,
    ariaDescribedBy,
    "aria-describedby": ariaDescribedByHyphen,
    ...rest
  } = props;

  if (!region) {
    throw new SeidrError("ToastRegionRoot requires a ToastRegion instance coordinator");
  }

  const pointerEvents = mergeValues(() => (region.hasToasts() ? (region.topLayer() ? "auto" : undefined) : "none"), {
    parents: [region.hasToasts, region.topLayer],
  });

  const topLayerAttr = region.topLayer.as((isTop) => (isTop ? "" : undefined));

  return $<T>(
    as,
    {
      id: customId ?? region.id,
      role,
      tabIndex,
      ariaLabel: ariaLabel ?? ariaLabelHyphen ?? region.ariaLabel,
      ariaLabelledby: ariaLabelledBy ?? ariaLabelledByHyphen,
      ariaDescribedby: ariaDescribedBy ?? ariaDescribedByHyphen,
      dataTopLayer: topLayerAttr,
      dataKbTopLayer: topLayerAttr,
      dataComponent: dataComponent ?? region.dataComponent,
      dataPart: DATA_PART_REGION,
      style: mergeStyleProps({ pointerEvents }, userStyle),
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
