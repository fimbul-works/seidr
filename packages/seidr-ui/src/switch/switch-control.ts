import {
  $,
  inClient,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseSwitchResult } from "./types.js";

export interface SwitchControlOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit switch instance providing reactive state.
   */
  instance?: UseSwitchResult;
}

export type SwitchControlProps<T extends keyof SeidrElementTagNameMap = "div"> = SwitchControlOptions<T> &
  SeidrElementProps<T>;

/**
 * The element that visually represents the switch track/control.
 * Interacting via click or Space key toggles state and focuses the hidden input.
 */
export function SwitchControl<T extends keyof SeidrElementTagNameMap = "div">(
  props: SwitchControlProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance: sw, id, onclick, onkeydown, ...rest } = props;

  if (!sw) {
    throw new SeidrError("SwitchControl requires an instance coordinator");
  }

  const handleClick = (e: MouseEvent) => {
    (onclick as any)?.(e);
    if (e.defaultPrevented) return;

    sw.toggle();
    inClient(() => {
      sw.inputRef()?.focus({ preventScroll: true });
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    (onkeydown as any)?.(e);
    if (e.defaultPrevented) return;

    if (e.key === " ") {
      e.preventDefault();
      sw.toggle();
      inClient(() => {
        sw.inputRef()?.focus({ preventScroll: true });
      });
    }
  };

  return $(
    as as T,
    {
      id: id ?? sw.id.as((base: string) => `${base}-control`),
      ref: sw.controlRef,
      ...sw.dataset,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      dataComponent: "switch",
      dataPart: "control",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
