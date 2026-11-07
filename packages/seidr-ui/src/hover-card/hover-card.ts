import { createComponent, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createHoverCard } from "./create-hover-card.js";
import type { HoverCardProps, HoverCardRootProps } from "./types.js";

/**
 * All-in-One accessible HoverCard component factory (Tier 1).
 */
export function HoverCardFactory<T extends keyof SeidrElementTagNameMap = "div">(
  props: HoverCardProps<T> = {} as HoverCardProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    trigger,
    href,
    target,
    rel,
    disabled,
    content,
    showArrow = false,
    rootProps = {},
    triggerProps = {},
    contentProps = {},
    arrowProps = {},
    children: propsChildren,
    ...hoverCardOptions
  } = props;

  const hoverCard = createHoverCard(hoverCardOptions);
  const resolvedContent = content ?? children ?? propsChildren;

  return hoverCard.Root<T>(
    { as, ...rootProps } as Omit<HoverCardRootProps<T>, "instance">,
    [
      trigger !== undefined
        ? hoverCard.Trigger(
            {
              href,
              target,
              rel,
              disabled,
              ...triggerProps,
            },
            trigger,
          )
        : null,
      hoverCard.Content(contentProps, [
        resolvedContent,
        showArrow ? hoverCard.Arrow(arrowProps) : null,
      ]),
    ],
  );
}

/**
 * Accessible HoverCard preview component (Tier 1).
 */
export const HoverCard = createComponent(HoverCardFactory, "HoverCard");

