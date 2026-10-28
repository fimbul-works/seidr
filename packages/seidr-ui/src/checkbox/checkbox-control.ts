import {
  $,
  inClient,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseCheckboxResult } from "./types.js";

export interface CheckboxControlOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit checkbox instance providing reactive state.
   */
  instance?: UseCheckboxResult;
}

export type CheckboxControlProps<T extends keyof SeidrElementTagNameMap = "div"> = CheckboxControlOptions<T> &
  SeidrElementProps<T>;

/**
 * The element that visually represents a checkbox.
 * Interacting via click or Space key toggles state and focuses the hidden input.
 */
export function CheckboxControl<T extends keyof SeidrElementTagNameMap = "div">(
  props: CheckboxControlProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: cb, id, onclick, onkeydown, ...rest } = props;

  if (!cb) {
    throw new SeidrError("CheckboxControl requires an instance prop");
  }

  const handleClick = (e: MouseEvent) => {
    (onclick as any)?.(e);
    if (e.defaultPrevented) return;

    cb.toggle();
    inClient(() => {
      cb.inputRef()?.focus({ preventScroll: true });
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    (onkeydown as any)?.(e);
    if (e.defaultPrevented) return;

    if (e.key === " ") {
      e.preventDefault();
      cb.toggle();
      inClient(() => {
        cb.inputRef()?.focus({ preventScroll: true });
      });
    }
  };

  return $(
    as as T,
    {
      id: id ?? cb.id.as((base) => `${base}-control`),
      ref: cb.controlRef,
      ...cb.dataset,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      dataComponent: "checkbox",
      dataPart: "control",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
