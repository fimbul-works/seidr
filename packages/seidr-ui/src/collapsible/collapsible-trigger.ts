import { isFn, isUndef } from "@fimbul-works/hvat";
import {
  isValue,
  mergeValues,
  resolvePropsAndChildren,
  type SeidrChild,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { type ButtonOptions, type ButtonProps, ButtonRoot } from "../button.js";
import type { UseCollapsibleResult } from "./types.js";

export interface CollapsibleTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> extends ButtonOptions<T> {
  /** Explicit instance providing reactive state. */
  instance?: UseCollapsibleResult;
}

export type CollapsibleTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> = CollapsibleTriggerOptions<T> &
  Omit<ButtonProps<T>, "aria-expanded" | "aria-controls">;

/**
 * The button that expands/collapses the collapsible content.
 * Based on WAI-ARIA Disclosure Pattern.
 */
export function CollapsibleTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CollapsibleTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  props?: CollapsibleTriggerProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CollapsibleTrigger<T extends keyof SeidrElementTagNameMap = "button">(
  propsOrChildren?: CollapsibleTriggerProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const [props, content] = resolvePropsAndChildren<CollapsibleTriggerProps<T>>(propsOrChildren, children);

  const { instance, disabled, onclick: userOnClick, ...rest } = props as any;

  const col = instance;
  if (!col) {
    throw new SeidrError(
      "[seidr-ui]: CollapsibleTrigger requires an instance prop or must be created via Collapsible.create() / Collapsible.",
    );
  }

  const effectiveDisabled = isUndef(disabled)
    ? col.isDisabled
    : isValue(disabled)
      ? mergeValues(() => col.isDisabled() || disabled(), { parents: [col.isDisabled, disabled] })
      : col.isDisabled.as((d: boolean) => d || Boolean(disabled));

  const handleClick = (e: MouseEvent) => {
    if (isFn(userOnClick)) {
      userOnClick(e);
    }
    col.toggle();
  };

  const ariaControls = mergeValues(() => (col.isOpen() ? col.contentId() : undefined), {
    parents: [col.isOpen, col.contentId],
  });

  return ButtonRoot(
    {
      disabled: effectiveDisabled,
      onclick: handleClick,
      "aria-expanded": col.isOpen.as((v: boolean) => (v ? "true" : "false")),
      "aria-controls": ariaControls,
      ...col.dataset,
      ...rest,
    } as any,
    content,
  ) as SeidrElementTagNameMap[T];
}
