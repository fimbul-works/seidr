import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { FileFieldRootProps } from "./types.js";

/**
 * Top-level container element for the FileField component (role="group").
 */
export function FileFieldRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: FileFieldRootProps<T> = {} as FileFieldRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    dataComponent = "file-field",
    id: customId,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldRoot requires an instance coordinator");
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
      ...instance.formControl.dataset,
      dataComponent,
      dataPart: "root",
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

