import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  inClient,
  isValidSeidrChild,
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
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxControl<T extends keyof SeidrElementTagNameMap = "div">(
  props?: CheckboxControlProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CheckboxControl<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CheckboxControlProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: CheckboxControlProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as CheckboxControlProps<T>) ?? ({} as CheckboxControlProps<T>);
    content = children;
  } else {
    props = {} as CheckboxControlProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const { as = "div" as T, instance, id, onclick, onkeydown, ...rest } = props as any;

  if (!instance) {
    throw new SeidrError(
      "[seidr-ui]: CheckboxControl requires an instance prop or must be created via Checkbox.create() / Checkbox.",
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
