import { isFn } from "@fimbul-works/hvat";
import {
  createRef,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  unwrapValue,
} from "@fimbul-works/seidr";
import { Button, type ButtonProps } from "../button.js";
import { DATA_COMPONENT_ACCORDION, DATA_PART_TRIGGER } from "../constants.js";
import type { AccordionItemInstance } from "./types.js";

export interface AccordionTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  /** The HTML tag name to render. @default "button" */
  as?: T;

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
  const {
    as = "button" as T,
    instance,
    ref: userRef,
    onclick: userOnClick,
    onkeydown: userOnKeyDown,
    id: customId,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("AccordionTrigger requires an instance coordinator");
  }

  const triggerRef = createRef<HTMLElement>();

  triggerRef.bind((el: HTMLElement | null) => {
    if (userRef) {
      userRef(el as SeidrElementTagNameMap[T]);
    }
    if (el) {
      return instance.accordion.registerTrigger(instance.value, el, instance.isDisabled);
    }
  });

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      unwrapValue(userOnClick)(e);
    }
    instance.toggle();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      unwrapValue(userOnKeyDown)(e);
    }
    instance.accordion.handleKeyDown(e, instance.value);
  };

  return Button(
    {
      as,
      id: customId ?? instance.triggerId,
      ref: triggerRef,
      onclick: handleClick,
      onkeydown: handleKeyDown,
      ariaExpanded: instance.isOpen.as((v) => (v ? "true" : "false")),
      ariaControls: instance.contentId,
      ariaDisabled: instance.isDisabled.as((v) => (v ? "true" : undefined)),
      disabled: instance.isDisabled,
      dataComponent: DATA_COMPONENT_ACCORDION,
      dataPart: DATA_PART_TRIGGER,
      dataKey: instance.value,
      ...instance.dataset,
      ...rest,
    } as ButtonProps<T>,
    children,
  );
}
