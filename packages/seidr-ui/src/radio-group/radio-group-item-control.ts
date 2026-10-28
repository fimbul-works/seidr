import {
  $,
  inClient,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseRadioGroupItemResult } from "./types.js";

export interface RadioGroupItemControlOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit radio group item instance providing reactive state.
   */
  instance?: UseRadioGroupItemResult;
}

export type RadioGroupItemControlProps<T extends keyof SeidrElementTagNameMap = "div"> =
  RadioGroupItemControlOptions<T> & SeidrElementProps<T>;

/**
 * The visual container representing a radio button (clickable indicator box/circle).
 */
export function RadioGroupItemControl<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupItemControl<T extends keyof SeidrElementTagNameMap = "div">(
  props?: RadioGroupItemControlProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function RadioGroupItemControl<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: RadioGroupItemControlProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<RadioGroupItemControlProps<T>>(propsOrChildren, children);
  const { as = "div" as T, instance: item, id, onclick, onkeydown, ...rest } = props;

  if (!item) {
    throw new SeidrError("RadioGroupItemControl requires an instance prop");
  }

  const handleClick = (e: MouseEvent) => {
    (onclick as any)?.(e);
    if (e.defaultPrevented) return;

    item.select();
    inClient(() => {
      item.inputRef()?.focus({ preventScroll: true });
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    (onkeydown as any)?.(e);
    if (e.defaultPrevented) return;

    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      item.select();
      inClient(() => {
        item.inputRef()?.focus({ preventScroll: true });
      });
    }
  };

  return $(
    as as T,
    {
      id: id ?? item.id.as((base) => `${base}-control`),
      ...item.dataset,
      ref: item.controlRef,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
