import {
  type DerivedValue,
  getDocument,
  Portal,
  type SeidrChild,
  type SeidrElementTagNameMap,
  Show,
} from "@fimbul-works/seidr";
import { PopperArrow } from "../popper/popper-arrow.js";
import type { PopperArrowProps } from "../popper/types.js";
import { TooltipContent } from "./tooltip-content.js";
import { TooltipRoot } from "./tooltip-root.js";
import { TooltipTrigger } from "./tooltip-trigger.js";
import type {
  TooltipArrowProps,
  TooltipContentProps,
  TooltipInstance,
  TooltipPortalProps,
  TooltipRootProps,
  TooltipTriggerProps,
  UseTooltipOptions,
} from "./types.js";
import { useTooltip } from "./use-tooltip.js";

/**
 * Creates a Tooltip state coordinator instance with pre-bound compound element helpers (Tier 2).
 */
export function createTooltip(options: UseTooltipOptions = {}): TooltipInstance {
  const instance = useTooltip(options);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<TooltipRootProps<T>, "instance"> = {} as Omit<TooltipRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TooltipRoot<T>({ instance, dataComponent: "tooltip", ...props } as TooltipRootProps<T>, children);

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: Omit<TooltipTriggerProps<T>, "instance"> = {} as Omit<TooltipTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    TooltipTrigger<T>({ instance, dataComponent: "tooltip", ...props } as TooltipTriggerProps<T>, children);

  const PortalHelper = (props: TooltipPortalProps = {}, children?: SeidrChild | SeidrChild[]): SeidrChild => {
    const target = props.target ?? instance.portalTarget ?? getDocument().body;
    instance.portalTarget = undefined;
    const renderPortal = () => Portal(target, () => children ?? null, "TooltipPortal");
    if (instance.forceMount) {
      return renderPortal();
    }
    return Show(instance.isOpen, renderPortal);
  };

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<TooltipContentProps<T>, "instance"> = {} as Omit<TooltipContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    TooltipContent<T>({ instance, dataComponent: "tooltip", ...props } as TooltipContentProps<T>, children);

  const Arrow = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<TooltipArrowProps<T>, "instance"> = {} as Omit<TooltipArrowProps<T>, "instance">,
  ): SeidrElementTagNameMap[T] =>
    PopperArrow<T>({ instance: instance.popper, dataComponent: "tooltip", ...props } as PopperArrowProps<T>);

  return {
    ...instance,
    Root,
    Trigger,
    Portal: PortalHelper,
    Content,
    Arrow,
  };
}

