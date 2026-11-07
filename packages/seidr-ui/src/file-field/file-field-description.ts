import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { FileFieldDescriptionProps } from "./types.js";

/**
 * Description hint element for the FileField component.
 */
export function FileFieldDescription<T extends keyof SeidrElementTagNameMap = "span">(
  props: FileFieldDescriptionProps<T> = {} as FileFieldDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    instance,
    dataComponent = "file-field",
    id: customId,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldDescription requires an instance coordinator");
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
      dataPart: "description",
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

