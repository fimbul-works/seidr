import {
  type DerivedValue,
  getDocument,
  Portal,
  type SeidrChild,
  type SeidrElementTagNameMap,
  Show,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_HOVER_CARD } from "../constants.js";
import { PopperArrow } from "../popper/popper-arrow.js";
import type { PopperArrowProps } from "../popper/types.js";
import { HoverCardContent } from "./hover-card-content.js";
import { HoverCardRoot } from "./hover-card-root.js";
import { HoverCardTrigger } from "./hover-card-trigger.js";
import type {
  HoverCardArrowProps,
  HoverCardContentProps,
  HoverCardInstance,
  HoverCardPortalProps,
  HoverCardRootProps,
  HoverCardTriggerProps,
  UseHoverCardOptions,
} from "./types.js";
import { useHoverCard } from "./use-hover-card.js";

/**
 * Creates a HoverCard state coordinator instance with pre-bound compound element helpers (Tier 2).
 */
export function createHoverCard(options: UseHoverCardOptions = {}): HoverCardInstance {
  const instance = useHoverCard(options);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<HoverCardRootProps<T>, "instance"> = {} as Omit<HoverCardRootProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    HoverCardRoot<T>(
      { instance, dataComponent: DATA_COMPONENT_HOVER_CARD, ...props } as HoverCardRootProps<T>,
      children,
    );

  const Trigger = <T extends keyof SeidrElementTagNameMap = "a">(
    props: Omit<HoverCardTriggerProps<T>, "instance"> = {} as Omit<HoverCardTriggerProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    HoverCardTrigger<T>(
      { instance, dataComponent: DATA_COMPONENT_HOVER_CARD, ...props } as HoverCardTriggerProps<T>,
      children,
    );

  const PortalHelper = (props: HoverCardPortalProps = {}, children?: SeidrChild | SeidrChild[]): SeidrChild => {
    const target = props.target ?? instance.portalTarget ?? getDocument().body;
    instance.portalTarget = undefined;
    const renderPortal = () => Portal(target, () => children ?? null, "HoverCardPortal");
    if (instance.forceMount) {
      return renderPortal();
    }
    return Show(instance.isOpen, renderPortal);
  };

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<HoverCardContentProps<T>, "instance"> = {} as Omit<HoverCardContentProps<T>, "instance">,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    HoverCardContent<T>(
      { instance, dataComponent: DATA_COMPONENT_HOVER_CARD, ...props } as HoverCardContentProps<T>,
      children,
    );

  const Arrow = <T extends keyof SeidrElementTagNameMap = "div">(
    props: Omit<HoverCardArrowProps<T>, "instance"> = {} as Omit<HoverCardArrowProps<T>, "instance">,
  ): SeidrElementTagNameMap[T] =>
    PopperArrow<T>({
      instance: instance.popper,
      dataComponent: DATA_COMPONENT_HOVER_CARD,
      ...props,
    } as PopperArrowProps<T>);

  return {
    ...instance,
    Root,
    Trigger,
    Portal: PortalHelper,
    Content,
    Arrow,
  };
}
