import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_RATING, DATA_PART_LABEL } from "../constants.js";
import type { RatingLabelProps } from "./types.js";

/**
 * Accessible label component for the Rating group.
 */
export function RatingLabel<T extends keyof SeidrElementTagNameMap = "span">(
  props: RatingLabelProps<T> = {} as RatingLabelProps<T>,
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
    throw new SeidrError("RatingLabel requires an instance coordinator");
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
      id: customId ?? instance.formControl.labelId,
      dataOrientation: instance.orientation,
      dataDisabled: instance.isDisabled.as((d) => (d ? "" : undefined)),
      dataReadonly: instance.isReadOnly.as((r) => (r ? "" : undefined)),
      dataComponent,
      dataPart: DATA_PART_LABEL,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
