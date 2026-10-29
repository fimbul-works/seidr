import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { UseAccordionResult } from "./types.js";

export interface AccordionRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /** The HTML tag name to render. @default "div" */
  as?: T;

  /** Explicit instance coordinator providing reactive state. */
  instance?: UseAccordionResult;
}

export type AccordionRootProps<T extends keyof SeidrElementTagNameMap = "div"> = AccordionRootOptions<T> &
  SeidrElementProps<T>;

/**
 * Top-level container element for an Accordion widget.
 */
export function AccordionRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: AccordionRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance, id, ...rest } = props;

  if (!instance) {
    throw new SeidrError("AccordionRoot requires an instance coordinator");
  }

  return $(
    as,
    {
      id: id ?? instance.id,
      dataComponent: "accordion",
      dataPart: "root",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
