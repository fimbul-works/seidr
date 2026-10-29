import { isFn, isUndef } from "@fimbul-works/hvat";
import { isValue, mergeValues, type SeidrChild, type SeidrElementTagNameMap, SeidrError } from "@fimbul-works/seidr";
import { type ButtonOptions, type ButtonProps, Button } from "../button.js";
import type { UseCollapsibleResult } from "./types.js";
import { wrapValue } from "@fimbul-works/seidr";
import { SeidrElementProps } from "@fimbul-works/seidr";

export interface CollapsibleTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> extends ButtonOptions<T> {
  /** Explicit instance providing reactive state. */
  instance?: UseCollapsibleResult;
}

export type CollapsibleTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = CollapsibleTriggerOptions<T> &
  Omit<ButtonProps<T>, "ariaExpanded" | "ariaControls" | "aria-expanded" | "aria-controls">;

/**
 * The button that expands/collapses the collapsible content.
 * Based on WAI-ARIA Disclosure Pattern.
 */
export function CollapsibleTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props: CollapsibleTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { instance: col, disabled, onclick: userOnClick, ...rest } = props;

  if (!col) {
    throw new SeidrError("CollapsibleTrigger requires an instance prop");
  }

  const wrappedDisabled = wrapValue(disabled ?? false);

  const effectiveDisabled = mergeValues(() => wrappedDisabled() || col.isDisabled(), {
    parents: [wrappedDisabled, col.isDisabled],
  });

  const ariaControls = mergeValues(() => (col.isOpen() ? col.contentId() : undefined), {
    parents: [col.isOpen, col.contentId],
  });

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      (userOnClick as any)(e);
    }
    col.toggle();
  };

  return Button(
    {
      disabled: effectiveDisabled,
      onclick: handleClick,
      ariaExpanded: col.isOpen.as((v: boolean) => (v ? "true" : "false")),
      ariaControls,
      dataComponent: "collapsible",
      dataPart: "trigger",
      ...col.dataset,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
