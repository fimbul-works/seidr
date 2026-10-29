import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { AccordionItemInstance } from "./types.js";

export interface AccordionItemOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /** The HTML tag name to render. @default "div" */
  as?: T;

  /** Explicit item coordinator instance. */
  instance?: AccordionItemInstance;
}

export type AccordionItemProps<T extends keyof SeidrElementTagNameMap = "div"> = AccordionItemOptions<T> &
  SeidrElementProps<T>;

/**
 * Item container for an accordion panel section.
 */
export function AccordionItem<T extends keyof SeidrElementTagNameMap = "div">(
  props: AccordionItemProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance, ...rest } = props;

  if (!instance) {
    throw new SeidrError("AccordionItem requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent: "accordion",
      dataPart: "item",
      ...instance.dataset,
      ...rest,
    } as any,
    children,
  );
}
