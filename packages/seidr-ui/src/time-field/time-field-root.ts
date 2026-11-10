import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_TIME_FIELD, DATA_PART_ROOT } from "../constants.js";
import type { TimeFieldRootProps } from "./types.js";

/**
 * Top-level container element for the TimeField component (role="group").
 */
export function TimeFieldRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: TimeFieldRootProps<T> = {} as TimeFieldRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    dataComponent = DATA_COMPONENT_TIME_FIELD,
    id: customId,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("TimeFieldRoot requires an instance coordinator");
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
      role: "group",
      id: customId ?? instance.formControl.id,
      ariaInvalid: instance.formControl.isInvalid.as((inv) => (inv ? "true" : undefined)),
      ariaRequired: instance.isRequired.as((req) => (req ? "true" : undefined)),
      ariaDisabled: instance.isDisabled.as((dis) => (dis ? "true" : undefined)),
      ariaReadonly: instance.isReadOnly.as((ro) => (ro ? "true" : undefined)),
      ariaLabelledby: instance.formControl.ariaLabelledBy,
      ariaDescribedby: instance.formControl.ariaDescribedBy,
      ...instance.formControl.dataset,
      dataComponent,
      dataPart: DATA_PART_ROOT,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
