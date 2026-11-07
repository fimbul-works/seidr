import { createComponent, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createTooltip } from "./create-tooltip.js";
import type { TooltipProps, TooltipRootProps } from "./types.js";

/**
 * All-in-One accessible Tooltip component factory (Tier 1).
 */
export function TooltipFactory<T extends keyof SeidrElementTagNameMap = "div">(
  props: TooltipProps<T> = {} as TooltipProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    trigger,
    content,
    showArrow = false,
    rootProps = {},
    triggerProps = {},
    contentProps = {},
    arrowProps = {},
    children: propsChildren,
    ...tooltipOptions
  } = props;

  const tooltip = createTooltip(tooltipOptions);
  const resolvedContent = content ?? children ?? propsChildren;

  return tooltip.Root<T>(
    { as, ...rootProps } as Omit<TooltipRootProps<T>, "instance">,
    [
      trigger !== undefined ? tooltip.Trigger(triggerProps, trigger) : null,
      tooltip.Content(contentProps, [
        resolvedContent,
        showArrow ? tooltip.Arrow(arrowProps) : null,
      ]),
    ],
  );
}

/**
 * Accessible Tooltip component (`role="tooltip"`, Tier 1).
 */
export const Tooltip = createComponent(TooltipFactory, "Tooltip");

