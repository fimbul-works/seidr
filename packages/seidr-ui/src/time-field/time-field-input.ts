import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { SegmentType, TimeFieldInputProps } from "./types.js";

/**
 * Presentation container wrapping all interactive time segments.
 */
export function TimeFieldInput<T extends keyof SeidrElementTagNameMap = "div">(
  props: TimeFieldInputProps<T> = {} as TimeFieldInputProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    dataComponent = "time-field",
    ref: userRef,
    onkeydown: userOnKeyDown,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("TimeFieldInput requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      instance.inputRef(el as HTMLElement);
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const activeEl = document.activeElement as HTMLElement | null;
      const seg = activeEl?.getAttribute("data-type") as SegmentType | null;
      if (seg) instance.focusPrevious(seg);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const activeEl = document.activeElement as HTMLElement | null;
      const seg = activeEl?.getAttribute("data-type") as SegmentType | null;
      if (seg) instance.focusNext(seg);
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
      ref: internalRef,
      role: "presentation",
      id: instance.formControl.fieldId,
      ...instance.formControl.dataset,
      dataComponent,
      dataPart: "input",
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

