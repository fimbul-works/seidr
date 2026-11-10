import { isFn, isObj } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  type DerivedValue,
  mergeStyleProps,
  Portal,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  wrapValue,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_TOOLTIP, DATA_PART_CONTENT } from "../constants.js";
import { useEscapeKeyDown } from "../hooks/use-escape-keydown.js";
import { useInteractOutside } from "../hooks/use-interact-outside.js";
import { PopperPositioner } from "../popper/popper-positioner.js";
import type { TooltipContentProps } from "./types.js";

/**
 * Floating content container element for a Tooltip (`role="tooltip"`).
 */
export function TooltipContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: TooltipContentProps<T> = {} as TooltipContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: tooltip,
    dataComponent = DATA_COMPONENT_TOOLTIP,
    portalTarget,
    onEscapeKeyDown,
    onPointerDownOutside,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    id: userId,
    ref: userRef,
    style: userStyle,
    ...rest
  } = props;

  if (!tooltip) {
    throw new SeidrError("TooltipContent requires an instance coordinator");
  }

  if (typeof userId === "string") {
    tooltip.contentId(userId);
  }

  const isClosed = tooltip.isOpen.as((open) => !open);

  useEscapeKeyDown({
    isDisabled: isClosed,
    onEscapeKeyDown: (event) => {
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented) {
        tooltip.hideTooltip(true);
      }
    },
  });

  useInteractOutside(tooltip.contentRef, {
    isDisabled: isClosed,
    shouldExcludeElement: (element) => tooltip.isTargetOnTooltip(element),
    onPointerDownOutside: (event) => {
      onPointerDownOutside?.(event);
      if (!event.defaultPrevented) {
        tooltip.hideTooltip(true);
      }
    },
  });

  const renderContent = (): SeidrElementTagNameMap[T] => {
    const internalRef = createRef<SeidrElementTagNameMap[T]>();

    internalRef.bind((el) => {
      if (userRef && el && isFn(userRef)) {
        Reflect.apply(userRef, null, [el]);
      }
      tooltip.contentRef(el as unknown as HTMLElement);
    });

    const baseStyle: Record<string, string | number> = {
      position: "relative",
      "--seidr-tooltip-content-transform-origin": "var(--seidr-popper-content-transform-origin)",
    };
    
    const contentEl = $(
      as,
      {
        id: userId ?? tooltip.contentId,
        ref: internalRef,
        role: "tooltip",
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        dataComponent,
        dataPart: DATA_PART_CONTENT,
        dataExpanded: tooltip.isOpen.as((o) => (o ? "" : undefined)),
        dataClosed: tooltip.isOpen.as((o) => (!o ? "" : undefined)),
        style: mergeStyleProps(baseStyle, userStyle),
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );

    return PopperPositioner<"div">(
      {
        instance: tooltip.popper,
        dataComponent,
      },
      contentEl,
    ) as unknown as SeidrElementTagNameMap[T];
  };

  const renderMaybePortaled = (): SeidrElementTagNameMap[T] => {
    const target = portalTarget ?? tooltip.portalTarget;
    if (target) {
      return Portal(target, renderContent, "TooltipPortal") as unknown as SeidrElementTagNameMap[T];
    }
    return renderContent();
  };

  if (tooltip.forceMount) {
    return wrapValue(renderMaybePortaled()) as unknown as DerivedValue<SeidrElementTagNameMap[T] | null>;
  }

  return Show(tooltip.isOpen, renderMaybePortaled) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
