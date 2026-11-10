import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type DerivedValue,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_RATING, DATA_PART_ITEM } from "../constants.js";
import type { RatingItemProps, RatingItemState } from "./types.js";

/**
 * Individual score item within a Rating group (role="radio").
 */
export function RatingItem<T extends keyof SeidrElementTagNameMap = "span">(
  props: RatingItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "span" as T,
    value,
    instance,
    dataComponent = DATA_COMPONENT_RATING,
    ref: userRef,
    onclick: userOnClick,
    onpointermove: userOnPointerMove,
    onpointerenter: userOnPointerEnter,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("RatingItem requires an instance coordinator");
  }

  if (typeof value !== "number") {
    throw new SeidrError("RatingItem requires a numeric 'value' prop");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
  });

  const state: DerivedValue<RatingItemState> = instance.getItemState(value);

  const isCurrentActive: DerivedValue<boolean> = instance.value.as((v) => {
    if (v === value) return true;
    if (v === 0 && value === 1) return true;
    return false;
  });

  const isHighlighted: DerivedValue<boolean> = instance.hoveredValue.as((hv) => {
    if (hv === null) return false;
    const threshold = instance.allowHalf ? value - 0.5 : value;
    return hv >= threshold;
  });

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      Reflect.apply(userOnClick, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;
    instance.commitItemValue(value);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isFn(userOnPointerMove)) {
      Reflect.apply(userOnPointerMove, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    const el = internalRef();
    if (el) {
      instance.handleItemPointerMove(e, value, el as HTMLElement);
    }
  };

  const handlePointerEnter = (e: PointerEvent) => {
    if (isFn(userOnPointerEnter)) {
      Reflect.apply(userOnPointerEnter, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    const el = internalRef();
    if (el) {
      instance.handleItemPointerEnter(e, value, el as HTMLElement);
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
      role: "radio",
      "aria-label": `${value} ${value === 1 ? "star" : "stars"}`,
      "aria-checked": state.as((s) => (s === "checked" ? "true" : "false")),
      tabindex: isCurrentActive.as((a) => (a ? 0 : -1)),
      dataComponent,
      dataPart: DATA_PART_ITEM,
      dataValue: String(value),
      dataState: state,
      dataHighlighted: isHighlighted.as((h) => (h ? "" : undefined)),
      dataDisabled: instance.isDisabled.as((d) => (d ? "" : undefined)),
      dataReadonly: instance.isReadOnly.as((r) => (r ? "" : undefined)),
      onclick: handleClick,
      onpointermove: handlePointerMove,
      onpointerenter: handlePointerEnter,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
