import { isArr } from "@fimbul-works/hvat";
import {
  createComponent,
  isValue,
  List,
  type ReactiveValue,
  type SeidrChild,
  type SeidrElementProps,
} from "@fimbul-works/seidr";
import type { CollapsibleAnimationOptions } from "../collapsible/types.js";
import { createAccordion } from "./create-accordion.js";
import type { AccordionItemDescriptor, UseAccordionOptions } from "./types.js";

export interface AccordionProps extends UseAccordionOptions {
  /** Optional class name for the root container. */
  className?: ReactiveValue<string>;

  /** Declarative list of items to render, supports static arrays or reactive observable arrays. */
  items?: ReactiveValue<AccordionItemDescriptor[]>;

  /** Props passed directly to Accordion.Root. */
  rootProps?: SeidrElementProps<"div">;

  /** Animation configuration using Flaedi, or false to disable JS tweening. */
  animation?: boolean | CollapsibleAnimationOptions;
}

/**
 * Unified all-in-one Accordion component.
 * Creates an accessible accordion with WAI-ARIA roving keyboard navigation,
 * single or multiple selection modes, and collapsible disclosure panels.
 */
export const Accordion = createComponent((props: AccordionProps = {}) => {
  const {
    className,
    items,
    rootProps = {},
    value,
    defaultValue,
    onChange,
    multiple,
    collapsible,
    shouldFocusWrap,
    id,
    animation,
    ...rest
  } = props;

  const accordion = createAccordion({
    value,
    defaultValue,
    onChange,
    multiple,
    collapsible,
    shouldFocusWrap,
    id,
  });

  const itemElements: SeidrChild = isValue<AccordionItemDescriptor[]>(items)
    ? List(
        items,
        (item) => item.value,
        (itemVal) => accordion.Item({ animation, ...itemVal() }),
      )
    : isArr(items)
      ? items.map((item) => accordion.Item({ animation, ...item }))
      : [];

  return accordion.Root(
    {
      className,
      ...rootProps,
      ...rest,
    },
    itemElements,
  );
}, "Accordion");
