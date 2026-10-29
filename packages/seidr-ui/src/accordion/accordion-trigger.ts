import { isFn } from "@fimbul-works/hvat";
import {
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { Button } from "../button.js";
import type { AccordionItemInstance } from "./types.js";

export interface AccordionTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  /** Explicit item coordinator instance. */
  instance?: AccordionItemInstance;
}

export type AccordionTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = AccordionTriggerOptions<T> &
  SeidrElementProps<T>;

/**
 * Interactive trigger button that toggles the accordion item's open/collapsed state.
 * Implements arrow key roving focus navigation across accordion triggers.
 */
export function AccordionTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: AccordionTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance, ref: userRef, onclick: userOnClick, onkeydown: userOnKeyDown, id: customId, ...rest } = props;

  if (!instance) {
    throw new SeidrError("AccordionTrigger requires an instance prop");
  }

  const triggerRef = createRef<HTMLElement>();

  triggerRef.bind((el: HTMLElement | null) => {
    if (userRef) {
      (userRef as any)(el);
    }
    if (el) {
      return instance.accordion.registerTrigger(instance.value, el, instance.isDisabled);
    }
  });

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      (userOnClick as any)(e);
    }
    instance.toggle();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      (userOnKeyDown as any)(e);
    }
    instance.accordion.handleKeyDown(e, instance.value);
  };

  return Button(
    {
      id: customId ?? instance.triggerId,
      ref: triggerRef,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      ariaExpanded: instance.isOpen.as((v: boolean) => (v ? "true" : "false")),
      ariaControls: instance.contentId,
      ariaDisabled: instance.isDisabled.as((v: boolean) => (v ? "true" : undefined)),
      disabled: instance.isDisabled,
      dataComponent: "accordion",
      dataPart: "trigger",
      dataKey: instance.value,
      ...instance.dataset,
      ...rest,
    } as any,
    children,
  );
}
