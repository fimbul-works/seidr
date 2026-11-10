import { isFn, isObj } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type DerivedValue,
  Portal,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  wrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_HOVER_CARD, DATA_PART_CONTENT } from "../constants.js";
import { useEscapeKeyDown } from "../hooks/use-escape-keydown.js";
import { useInteractOutside } from "../hooks/use-interact-outside.js";
import { PopperPositioner } from "../popper/popper-positioner.js";
import type { HoverCardContentProps } from "./types.js";

/**
 * Floating content container element for a HoverCard.
 */
export function HoverCardContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: HoverCardContentProps<T> = {} as HoverCardContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: hoverCard,
    dataComponent = DATA_COMPONENT_HOVER_CARD,
    portalTarget,
    onEscapeKeyDown,
    onPointerDownOutside,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    ref: userRef,
    style: userStyle,
    ...rest
  } = props;

  if (!hoverCard) {
    throw new SeidrError("HoverCardContent requires an instance coordinator");
  }

  const isClosed = hoverCard.isOpen.as((open) => !open);

  useEscapeKeyDown({
    isDisabled: isClosed,
    onEscapeKeyDown: (event) => {
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented) {
        hoverCard.close();
      }
    },
  });

  useInteractOutside(hoverCard.contentRef, {
    isDisabled: isClosed,
    shouldExcludeElement: (element) => hoverCard.isTargetOnHoverCard(element),
    onPointerDownOutside: (event) => {
      onPointerDownOutside?.(event);
      if (!event.defaultPrevented) {
        hoverCard.close();
      }
    },
  });

  const renderContent = (): SeidrElementTagNameMap[T] => {
    const internalRef = createRef<SeidrElementTagNameMap[T]>();

    internalRef.bind((el) => {
      if (userRef && el && isFn(userRef)) {
        Reflect.apply(userRef, null, [el]);
      }
      hoverCard.contentRef(el as unknown as HTMLElement);
    });

    const baseStyle: Record<string, string | number> = {
      position: "relative",
      "--seidr-hovercard-content-transform-origin": "var(--seidr-popper-content-transform-origin)",
    };
    const combinedStyle = isObj(userStyle) ? { ...baseStyle, ...userStyle } : baseStyle;

    const contentEl = $(
      as,
      {
        ref: internalRef,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        dataComponent,
        dataPart: DATA_PART_CONTENT,
        dataExpanded: hoverCard.isOpen.as((o) => (o ? "" : undefined)),
        dataClosed: hoverCard.isOpen.as((o) => (!o ? "" : undefined)),
        style: combinedStyle,
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );

    return PopperPositioner<"div">(
      {
        instance: hoverCard.popper,
        dataComponent,
      },
      contentEl,
    ) as unknown as SeidrElementTagNameMap[T];
  };

  const renderMaybePortaled = (): SeidrElementTagNameMap[T] => {
    const target = portalTarget ?? hoverCard.portalTarget;
    if (target) {
      return Portal(target, renderContent, "HoverCardPortal") as unknown as SeidrElementTagNameMap[T];
    }
    return renderContent();
  };

  if (hoverCard.forceMount) {
    return wrapValue(renderMaybePortaled()) as unknown as DerivedValue<SeidrElementTagNameMap[T] | null>;
  }

  return Show(hoverCard.isOpen, renderMaybePortaled) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
