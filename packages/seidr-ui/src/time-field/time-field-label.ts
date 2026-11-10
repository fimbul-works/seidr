import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_TIME_FIELD, DATA_PART_LABEL, DATA_PART_LINK } from "../constants.js";
import type { TimeFieldLabelProps } from "./types.js";

/**
 * Accessible label element for the TimeField component.
 */
export function TimeFieldLabel<T extends keyof SeidrElementTagNameMap = "label">(
  props: TimeFieldLabelProps<T> = {} as TimeFieldLabelProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "label" as T,
    instance,
    dataComponent = DATA_COMPONENT_TIME_FIELD,
    for: userFor,
    htmlFor: userHtmlFor,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("TimeFieldLabel requires an instance coordinator");
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
      for: userFor ?? userHtmlFor ?? instance.formControl.fieldId,
      ...instance.formControl.dataset,
      dataComponent,
      dataPart: DATA_PART_LABEL,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
