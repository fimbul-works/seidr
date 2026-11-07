import { isFn } from "@fimbul-works/hvat";
import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  unwrapValue,
} from "@fimbul-works/seidr";
import type { FileFieldItemDeleteTriggerProps } from "./types.js";

/**
 * Button that removes an accepted file from the FileField list.
 */
export function FileFieldItemDeleteTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: FileFieldItemDeleteTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    file,
    instance,
    dataComponent = "file-field",
    onclick: userOnClick,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldItemDeleteTrigger requires an instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    const targetFile = unwrapValue(file);
    if (targetFile) {
      instance.removeFile(targetFile);
    }
  };

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
      type: "button",
      disabled: instance.isDisabled,
      dataComponent,
      dataPart: "item-delete-trigger",
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

