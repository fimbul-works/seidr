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
import { useEscapeKeyDown } from "../hooks/use-escape-keydown.js";
import { useFocusScope } from "../hooks/use-focus-scope.js";
import { useHideOutside } from "../hooks/use-hide-outside.js";
import { useInteractOutside } from "../hooks/use-interact-outside.js";
import { PopperPositioner } from "../popper/popper-positioner.js";
import { contains } from "../utils/dom.js";
import type { PopoverContentProps } from "./types.js";

/**
 * Floating content container element for a Popover (`role="dialog"`).
 */
export function PopoverContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: PopoverContentProps<T> = {} as PopoverContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: popover,
    dataComponent = "popover",
    portalTarget,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    id: userId,
    ref: userRef,
    style: userStyle,
    ...rest
  } = props;

  if (!popover) {
    throw new SeidrError("PopoverContent requires an instance coordinator");
  }

  if (typeof userId === "string") {
    popover.contentId(userId);
  }

  const isClosed = popover.isOpen.as((open) => !open);

  useEscapeKeyDown({
    isDisabled: isClosed,
    onEscapeKeyDown: (event) => {
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented) {
        popover.close();
      }
    },
  });

  useInteractOutside(popover.contentRef, {
    isDisabled: isClosed,
    shouldExcludeElement: (element) =>
      contains(popover.triggerRef() ?? undefined, element) ||
      contains(popover.anchorRef() ?? undefined, element),
    onPointerDownOutside: (event) => {
      onPointerDownOutside?.(event);
      if (!event.defaultPrevented) {
        popover.close();
      }
    },
    onFocusOutside,
    onInteractOutside,
  });

  useFocusScope(
    popover.contentRef,
    {
      trapFocus: popover.isModal,
      onMountAutoFocus: onOpenAutoFocus,
      onUnmountAutoFocus: (event) => {
        onCloseAutoFocus?.(event);
        if (!event.defaultPrevented) {
          const trigger = popover.triggerRef();
          if (trigger) {
            trigger.focus();
          }
        }
      },
    },
  );

  useHideOutside({
    isDisabled: popover.isOpen.as((o) => !o || !popover.isModal()),
    targets: popover.contentRef,
  });

  const renderContent = (): SeidrElementTagNameMap[T] => {
    const internalRef = createRef<SeidrElementTagNameMap[T]>();

    internalRef.bind((el) => {
      if (userRef && el && isFn(userRef)) {
        Reflect.apply(userRef, null, [el]);
      }
      popover.contentRef(el as unknown as HTMLElement);
    });

    const baseStyle: Record<string, string | number> = {
      position: "relative",
      "--seidr-popover-content-transform-origin": "var(--seidr-popper-content-transform-origin)",
    };
    const combinedStyle = isObj(userStyle) ? { ...baseStyle, ...userStyle } : baseStyle;

    const contentEl = $(
      as,
      {
        id: userId ?? popover.contentId,
        ref: internalRef,
        role: "dialog",
        tabIndex: -1,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy ?? popover.titleId,
        "aria-describedby": ariaDescribedBy ?? popover.descriptionId,
        dataComponent,
        dataPart: "content",
        dataExpanded: popover.isOpen.as((o) => (o ? "" : undefined)),
        dataClosed: popover.isOpen.as((o) => (!o ? "" : undefined)),
        style: combinedStyle,
        ...rest,
      } as SeidrElementProps<T>,
      children,
    );

    return PopperPositioner<"div">(
      {
        instance: popover.popper,
        dataComponent,
      },
      contentEl,
    ) as unknown as SeidrElementTagNameMap[T];
  };

  const renderMaybePortaled = (): SeidrElementTagNameMap[T] => {
    const target = portalTarget ?? popover.portalTarget;
    if (target) {
      return Portal(target, renderContent, "PopoverPortal") as unknown as SeidrElementTagNameMap[T];
    }
    return renderContent();
  };

  if (popover.forceMount) {
    return wrapValue(renderMaybePortaled()) as unknown as DerivedValue<SeidrElementTagNameMap[T] | null>;
  }

  return Show(popover.isOpen, renderMaybePortaled) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
