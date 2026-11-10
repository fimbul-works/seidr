import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_TIME_FIELD, DATA_PART_DESCRIPTION } from "../constants.js";
import type { TimeFieldDescriptionProps } from "./types.js";

/**
 * Description hint element for the TimeField component.
 */
export function TimeFieldDescription<T extends keyof SeidrElementTagNameMap = "span">(
  props: TimeFieldDescriptionProps<T> = {} as TimeFieldDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance,
    dataComponent = DATA_COMPONENT_TIME_FIELD,
    id: customId,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("TimeFieldDescription requires an instance coordinator");
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
      dataDisabled: instance.isDisabled.as((d) => (d ? "" : undefined)),
      dataComponent,
      dataPart: DATA_PART_DESCRIPTION,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
