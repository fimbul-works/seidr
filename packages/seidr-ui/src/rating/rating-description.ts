import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_RATING, DATA_PART_DESCRIPTION } from "../constants.js";
import type { RatingDescriptionProps } from "./types.js";

/**
 * Helper description text element for the Rating system.
 */
export function RatingDescription<T extends keyof SeidrElementTagNameMap = "span">(
  props: RatingDescriptionProps<T> = {} as RatingDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance,
    dataComponent = DATA_COMPONENT_RATING,
    id: customId,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("RatingDescription requires an instance coordinator");
  }

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

  return $(
    as,
    {
      id: customId ?? instance.formControl.descriptionId,
      dataOrientation: instance.orientation,
      dataDisabled: instance.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent,
      dataPart: DATA_PART_DESCRIPTION,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
