import {
  type DerivedValue,
  isServer,
  Portal as createSeidrPortal,
  type SeidrChild,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { PopperArrow } from "../popper/popper-arrow.js";
import type { PopperArrowProps } from "../popper/types.js";
import { PopoverAnchor } from "./popover-anchor.js";
import { PopoverCloseButton } from "./popover-close-button.js";
import { PopoverContent } from "./popover-content.js";
import { PopoverDescription } from "./popover-description.js";
import { PopoverRoot } from "./popover-root.js";
import { PopoverTitle } from "./popover-title.js";
import { PopoverTrigger } from "./popover-trigger.js";
import type {
  PopoverAnchorProps,
  PopoverCloseButtonProps,
  PopoverContentProps,
  PopoverDescriptionProps,
  PopoverInstance,
  PopoverPortalProps,
  PopoverRootProps,
  PopoverTitleProps,
  PopoverTriggerProps,
  UsePopoverOptions,
} from "./types.js";
import { usePopover } from "./use-popover.js";

/**
 * Creates a fine-grained Popover coordinator with pre-bound compound element helpers (Tier 2).
 */
export function createPopover(options: UsePopoverOptions = {}): PopoverInstance {
  const instance = usePopover(options);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<PopoverRootProps<T>, "instance"> = {} as Omit<PopoverRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    PopoverRoot<T>({ instance, ...props } as PopoverRootProps<T>, children);

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<PopoverTriggerProps<T>, "instance"> = {} as Omit<PopoverTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    PopoverTrigger<T>({ instance, ...props } as PopoverTriggerProps<T>, children);

  const Anchor = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<PopoverAnchorProps<T>, "instance"> = {} as Omit<PopoverAnchorProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    PopoverAnchor<T>({ instance, ...props } as PopoverAnchorProps<T>, children);

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<PopoverContentProps<T>, "instance"> = {} as Omit<PopoverContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    PopoverContent<T>({ instance, ...props } as PopoverContentProps<T>, children);

  const CloseButton = <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<PopoverCloseButtonProps<T>, "instance"> = {} as Omit<PopoverCloseButtonProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    PopoverCloseButton<T>({ instance, ...props } as PopoverCloseButtonProps<T>, children);

  const Title = <T extends keyof SeidrElementTagNameMap = "h2">(
    props: Omit<PopoverTitleProps<T>, "instance"> = {} as Omit<PopoverTitleProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    PopoverTitle<T>({ instance, ...props } as PopoverTitleProps<T>, children);

  const Description = <T extends keyof SeidrElementTagNameMap = "p">(
    props: Omit<PopoverDescriptionProps<T>, "instance"> = {} as Omit<PopoverDescriptionProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    PopoverDescription<T>({ instance, ...props } as PopoverDescriptionProps<T>, children);

  const Arrow = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<PopperArrowProps<T>, "instance"> = {} as Omit<PopperArrowProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    PopperArrow<T>(
      { instance: instance.popper, dataComponent: "popover", ...props } as PopperArrowProps<T>,
      children,
    );

  const Portal = (
    props: PopoverPortalProps = {},
    children?: SeidrChild | SeidrChild[],
  ): SeidrChild | SeidrChild[] => {
    if (isServer()) {
      return children as SeidrChild;
    }
    const doc = typeof document !== "undefined" ? document : undefined;
    const target = props.portalTarget ?? instance.portalTarget ?? doc?.body;
    if (target) {
      return createSeidrPortal(target, () => children, "PopoverPortal");
    }
    return children as SeidrChild;
  };

  return {
    ...instance,
    Root,
    Trigger,
    Anchor,
    Content,
    CloseButton,
    Title,
    Description,
    Arrow,
    Portal,
  };
}

