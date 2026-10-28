import {
  type DerivedValue,
  mergeStyleProps,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { CollapsibleContent } from "../collapsible/collapsible-content.js";
import type { CollapsibleAnimationOptions } from "../collapsible/types.js";
import type { AccordionItemInstance } from "./types.js";

export interface AccordionContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /** The HTML tag name to render. @default "div" */
  as?: T;

  /** Explicit item coordinator instance. */
  instance?: AccordionItemInstance;

  /** Animation configuration using Flaedi, or false to disable JS tweening. */
  animation?: boolean | CollapsibleAnimationOptions;
}

export type AccordionContentProps<T extends keyof SeidrElementTagNameMap = "div"> = AccordionContentOptions<T> &
  SeidrElementProps<T>;

/**
 * Expandable region containing the content of an accordion item.
 * Supports smooth CSS height transitions and keyframe animations via CSS variables.
 */
export function AccordionContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: AccordionContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { instance, style, animation, ...rest } = props;

  if (!instance) {
    throw new SeidrError("AccordionContent requires an instance prop");
  }

  const dynamicStyles = {
    "--seidr-accordion-content-height": "var(--seidr-collapsible-content-height)",
    "--seidr-accordion-content-width": "var(--seidr-collapsible-content-width)",
  } as any;

  return CollapsibleContent(
    {
      instance: instance.collapsibleInstance,
      role: "region",
      ariaLabelledby: instance.triggerId,
      dataComponent: "accordion",
      dataPart: "content",
      animation,
      style: mergeStyleProps(dynamicStyles, style as any),
      ...rest,
    } as any,
    children,
  );
}
