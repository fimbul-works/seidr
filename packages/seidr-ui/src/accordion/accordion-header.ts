import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { AccordionItemInstance } from "./types.js";

export interface AccordionHeaderOptions<T extends keyof SeidrElementTagNameMap = "h3"> {
  /** The HTML heading tag name to render. @default "h3" */
  as?: T;

  /** Explicit item coordinator instance. */
  instance?: AccordionItemInstance;
}

export type AccordionHeaderProps<T extends keyof SeidrElementTagNameMap = "h3"> = AccordionHeaderOptions<T> &
  SeidrElementProps<T>;

/**
 * Heading wrapper element around an AccordionTrigger.
 * Defaults to `<h3>` but supports customization via the `as` prop.
 */
export function AccordionHeader<T extends keyof SeidrElementTagNameMap = "h3">(
  props: AccordionHeaderProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "h3" as T, instance, ...rest } = props;

  if (!instance) {
    throw new SeidrError("AccordionHeader requires an instance coordinator");
  }

  return $(
    as,
    {
      dataComponent: "accordion",
      dataPart: "header",
      ...instance.dataset,
      ...rest,
    } as any,
    children,
  );
}
