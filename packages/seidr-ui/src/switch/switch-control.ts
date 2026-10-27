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
  props?: SwitchControlProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function SwitchControl<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: SwitchControlProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<SwitchControlProps<T>>(propsOrChildren, children);

  const { as = "div" as T, instance, id, onclick, onkeydown, ...rest } = props as any;

  if (!instance) {
    throw new SeidrError(
      "[seidr-ui]: SwitchControl requires an instance prop or must be created via Switch.create() / Switch.",
    );
  }

  const handleClick = (e: MouseEvent) => {
    (onclick as any)?.(e);
    if (e.defaultPrevented) return;

    instance.toggle();
    inClient(() => {
      instance.inputRef()?.focus({ preventScroll: true });
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    (onkeydown as any)?.(e);
    if (e.defaultPrevented) return;

    if (e.key === " ") {
      e.preventDefault();
      instance.toggle();
      inClient(() => {
        instance.inputRef()?.focus({ preventScroll: true });
      });
    }
  };

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      id: id ?? `${instance.id}-control`,
      ref: instance.controlRef,
      ...instance.dataset,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}
