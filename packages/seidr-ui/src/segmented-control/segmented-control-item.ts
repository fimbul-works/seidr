import {
  $,
  createRef,
  inClient,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseSegmentedControlItemOptions, UseSegmentedControlItemResult } from "./types.js";

export interface SegmentedControlItemOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends Partial<UseSegmentedControlItemOptions> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit segmented control item instance providing reactive state.
   */
  instance?: UseSegmentedControlItemResult;
}

export type SegmentedControlItemProps<T extends keyof SeidrElementTagNameMap = "div"> = SegmentedControlItemOptions<T> &
  SeidrElementProps<T>;

/**
 * SegmentedControlItem is the container for a single segment option (role="group").
 */
export function SegmentedControlItem<T extends keyof SeidrElementTagNameMap = "div">(
  props: SegmentedControlItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: item, ref: userRef, onclick, onpointerdown, onkeydown, ...rest } = props;

  if (!item) {
    throw new SeidrError("SegmentedControlItem requires an instance coordinator");
  }

  const itemRef = createRef<SeidrElementTagNameMap[T]>();

  inClient(() => {
    itemRef.bind((el) => {
      if (userRef) {
        userRef(el as SeidrElementTagNameMap[T]);
      }
      if (el) {
        return item.segmentedControl.registerItem(item.value, el);
      }
    });
  });

  const handlePointerDown = (e: PointerEvent) => {
    (onpointerdown as (ev: PointerEvent) => void)?.(e);
    if (e.defaultPrevented) return;

    if (item.isFocused()) {
      e.preventDefault();
    }
  };

  const handleClick = (e: MouseEvent) => {
    (onclick as (ev: MouseEvent) => void)?.(e);
    if (e.defaultPrevented) return;

    const target = e.target as HTMLElement;
    if (target.tagName !== "INPUT") {
      item.select();
      item.inputRef()?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    (onkeydown as (ev: KeyboardEvent) => void)?.(e);
    if (e.defaultPrevented) return;

    // Forward navigation keys if the container element caught the event
    if (e.target !== item.inputRef()) {
      const isNav =
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "Home" ||
        e.key === "End";
      if (isNav) {
        item.inputRef()?.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: e.key,
            code: e.code,
            bubbles: true,
            cancelable: true,
          }),
        );
      }
    }
  };

  return $(
    as,
    {
      role: "group",
      id: item.id,
      ...item.dataset,
      ref: itemRef,
      onpointerdown: handlePointerDown,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      dataComponent: "segmented-control",
      dataPart: "item",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
