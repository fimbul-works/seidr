import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { FileFieldDropzoneProps } from "./types.js";
import { isDragEventWithFiles } from "./util.js";

/**
 * Interactive dropzone container that accepts dragged files and opens the file dialog on click or Enter/Space.
 */
export function FileFieldDropzone<T extends keyof SeidrElementTagNameMap = "div">(
  props: FileFieldDropzoneProps<T> = {} as FileFieldDropzoneProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    dataComponent = "file-field",
    ariaLabel = "dropzone",
    role = "button",
    tabIndex: userTabIndex,
    tabindex: userLowerTabIndex,
    ref: userRef,
    onclick: userOnClick,
    onkeydown: userOnKeyDown,
    ondragover: userOnDragOver,
    ondragleave: userOnDragLeave,
    ondrop: userOnDrop,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("FileFieldDropzone requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      instance.dropzoneRef(el as HTMLElement);
    }
  });

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "LABEL" || target.closest("label"))) {
      return;
    }
    instance.openFilePicker();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      instance.openFilePicker();
    }
  };

  const handleDragOver = (e: DragEvent) => {
    if (isFn(userOnDragOver)) {
      Reflect.apply(userOnDragOver, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (
      !instance.allowDragAndDrop() ||
      instance.isDisabled() ||
      instance.isReadOnly()
    ) {
      return;
    }

    e.preventDefault();

    try {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    } catch {}

    if (isDragEventWithFiles(e)) {
      instance.setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    if (isFn(userOnDragLeave)) {
      Reflect.apply(userOnDragLeave, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (!instance.allowDragAndDrop() || instance.isDisabled()) {
      return;
    }

    instance.setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    if (isFn(userOnDrop)) {
      Reflect.apply(userOnDrop, e.currentTarget, [e]);
    }

    if (instance.allowDragAndDrop()) {
      e.preventDefault();
      e.stopPropagation();
    }

    instance.setIsDragging(false);

    if (
      instance.isDisabled() ||
      instance.isReadOnly() ||
      !isDragEventWithFiles(e)
    ) {
      return;
    }

    const files = Array.from(e.dataTransfer?.files ?? []);
    instance.processFiles(files);
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

  const resolvedUserTabIndex = userTabIndex ?? userLowerTabIndex;
  const resolvedTabIndex =
    resolvedUserTabIndex !== undefined
      ? resolvedUserTabIndex
      : role === "button"
        ? instance.isDisabled.as((d) => (d ? -1 : 0))
        : undefined;

  return $(
    as,
    {
      ref: internalRef,
      role,
      tabIndex: resolvedTabIndex,
      ariaLabel,
      ariaDisabled: instance.isDisabled.as((d) => (d ? "true" : undefined)),
      dataDragging: instance.isDragging.as((d) => (d ? "true" : "false")),
      ...instance.formControl.dataset,
      dataComponent,
      dataPart: "dropzone",
      onclick: handleClick,
      onkeydown: handleKeyDown,
      ondragover: handleDragOver,
      ondragleave: handleDragLeave,
      ondrop: handleDrop,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
