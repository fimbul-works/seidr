import {
  $,
  inClient,
  resolvePropsAndChildren,
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
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchControl<T extends keyof SeidrElementTagNameMap = "div">(
  props: SwitchControlProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchControl<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: SwitchControlProps<T> | SeidrChild | SeidrChild[],
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<SwitchControlProps<T>>(propsOrChildren, children);
  const { as = "div" as T, instance: sw, id, onclick, onkeydown, ...rest } = props;

  if (!sw) {
    throw new SeidrError(
      "[seidr-ui]: SwitchControl requires an instance prop or must be created via Switch.create() / Switch.",
    );
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
      id: id ?? sw.id.as((base) => `${base}-control`),
      ref: sw.controlRef,
      ...sw.dataset,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<T>,
    content,
  );
}
