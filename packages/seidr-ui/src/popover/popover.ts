import { createComponent, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createPopover } from "./create-popover.js";
import type { PopoverProps, PopoverRootProps } from "./types.js";

/**
 * All-in-One accessible Popover component factory (Tier 1).
 */
export function PopoverFactory<T extends keyof SeidrElementTagNameMap = "div">(
  props: PopoverProps<T> = {} as PopoverProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    trigger,
    title,
    description,
    closeButton = false,
    content,
    showArrow = false,
    rootProps = {},
    triggerProps = {},
    anchorProps = {},
    contentProps = {},
    titleProps = {},
    descriptionProps = {},
    closeButtonProps = {},
    arrowProps = {},
    children: propsChildren,
    ...popoverOptions
  } = props;

  const popover = createPopover(popoverOptions);
  const resolvedContent = content ?? children ?? propsChildren;

  return popover.Root<T>(
    { as, ...rootProps } as Omit<PopoverRootProps<T>, "instance">,
    [
      trigger !== undefined ? popover.Trigger(triggerProps, trigger) : null,
      popover.Content(contentProps, [
        title !== undefined ? popover.Title(titleProps, title) : null,
        description !== undefined ? popover.Description(descriptionProps, description) : null,
        resolvedContent,
        closeButton
          ? popover.CloseButton(
              closeButtonProps,
              closeButton === true ? "✕" : closeButton,
            )
          : null,
        showArrow ? popover.Arrow(arrowProps) : null,
      ]),
    ],
  );
}

/**
 * Accessible Popover component (`role="dialog"`, Tier 1).
 */
export const Popover = createComponent(PopoverFactory, "Popover");

