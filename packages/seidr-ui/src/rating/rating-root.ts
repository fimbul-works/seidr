import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { RatingRootProps } from "./types.js";

/**
 * Top-level container element for the Rating system (role="radiogroup").
 */
export function RatingRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: RatingRootProps<T> = {} as RatingRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    dataComponent = "rating",
    ref: userRef,
    onkeydown: userOnKeyDown,
    onpointerleave: userOnPointerLeave,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("RatingRoot requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    if (el) {
      instance.rootRef(el as HTMLElement);
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      instance.handleRootKeyDown(e);
    }
  };

  const handlePointerLeave = (e: PointerEvent) => {
    if (isFn(userOnPointerLeave)) {
      Reflect.apply(userOnPointerLeave, e.currentTarget, [e]);
    }
    if (!e.defaultPrevented) {
      instance.setHoveredValue(null);
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
      id: instance.id,
      ref: internalRef,
      role: "radiogroup",
      "aria-orientation": instance.orientation,
      "aria-labelledby": instance.formControl.labelId,
      "aria-describedby": instance.formControl.descriptionId,
      "aria-required": instance.formControl.isRequired.as((r) => (r ? "true" : undefined)),
      "aria-invalid": instance.formControl.isInvalid.as((i) => (i ? "true" : undefined)),
      dataOrientation: instance.orientation,
      dataComponent,
      dataPart: "root",
      dataDisabled: instance.isDisabled.as((d) => (d ? "" : undefined)),
      dataReadonly: instance.isReadOnly.as((r) => (r ? "" : undefined)),
      dataInvalid: instance.formControl.isInvalid.as((i) => (i ? "" : undefined)),
      dataRequired: instance.formControl.isRequired.as((r) => (r ? "" : undefined)),
      onkeydown: handleKeyDown,
      onpointerleave: handlePointerLeave,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

