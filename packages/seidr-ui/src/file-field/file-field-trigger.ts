import { isFn } from "@fimbul-works/hvat";
import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { FileFieldTriggerProps } from "./types.js";

/**
 * Button that explicitly triggers the native file selection dialog.
 */
export function FileFieldTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: FileFieldTriggerProps<T> = {} as FileFieldTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "button" as T,
    instance,
    dataComponent = "file-field",
    onclick: userOnClick,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldTrigger requires an instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    const dropzone = instance.dropzoneRef();
    if (dropzone && dropzone.contains(e.currentTarget as Node)) {
      e.stopPropagation();
    }

    instance.openFilePicker();
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
      ...instance.formControl.dataset,
      dataComponent,
      dataPart: "trigger",
      onclick: handleClick,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

