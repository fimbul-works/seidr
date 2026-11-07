import { isFn, isObj, isStr } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  inClient,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ContextMenuTriggerProps } from "./types.js";

/**
 * Trigger container element for activating a ContextMenu via right-click or long-press.
 */
export function ContextMenuTrigger<T extends keyof SeidrElementTagNameMap = "div">(
  props: ContextMenuTriggerProps<T> = {} as ContextMenuTriggerProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    disabled = false,
    dataComponent = "context-menu",
    id: userId,
    ref: userRef,
    style: userStyle,
    oncontextmenu: userOnContextMenu,
    onpointerdown: userOnPointerDown,
    onpointermove: userOnPointerMove,
    onpointercancel: userOnPointerCancel,
    onpointerup: userOnPointerUp,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("ContextMenuTrigger requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    instance.triggerRef(el as unknown as HTMLElement);
  });

  let longPressTimeoutId: any = 0;

  const clearLongPressTimeout = () => {
    inClient(() => {
      if (longPressTimeoutId) {
        clearTimeout(longPressTimeoutId);
        longPressTimeoutId = 0;
      }
    });
  };

  onUnmounted(() => {
    clearLongPressTimeout();
  });

  const isTouchOrPen = (e: PointerEvent): boolean =>
    e.pointerType === "touch" || e.pointerType === "pen";

  const handleContextMenu = (e: MouseEvent) => {
    if (isFn(userOnContextMenu)) {
      Reflect.apply(userOnContextMenu, e.currentTarget, [e]);
    }

    if (disabled || e.defaultPrevented) {
      return;
    }

    clearLongPressTimeout();
    e.preventDefault();
    e.stopPropagation();

    instance.setAnchorRect({
      x: e.clientX,
      y: e.clientY,
      width: 0,
      height: 0,
    });

    if (instance.isOpen()) {
      instance.contentRef()?.focus();
    } else {
      instance.open();
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (isFn(userOnPointerDown)) {
      Reflect.apply(userOnPointerDown, e.currentTarget, [e]);
    }

    if (!disabled && isTouchOrPen(e)) {
      clearLongPressTimeout();
      instance.setAnchorRect({
        x: e.clientX,
        y: e.clientY,
        width: 0,
        height: 0,
      });

      inClient(() => {
        longPressTimeoutId = window.setTimeout(() => {
          instance.open();
        }, 700);
      });
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isFn(userOnPointerMove)) {
      Reflect.apply(userOnPointerMove, e.currentTarget, [e]);
    }

    if (!disabled && isTouchOrPen(e)) {
      clearLongPressTimeout();
    }
  };

  const handlePointerCancel = (e: PointerEvent) => {
    if (isFn(userOnPointerCancel)) {
      Reflect.apply(userOnPointerCancel, e.currentTarget, [e]);
    }

    if (!disabled && isTouchOrPen(e)) {
      clearLongPressTimeout();
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (isFn(userOnPointerUp)) {
      Reflect.apply(userOnPointerUp, e.currentTarget, [e]);
    }

    if (!disabled && isTouchOrPen(e)) {
      clearLongPressTimeout();
    }
  };

  const baseStyle: Record<string, string> = {
    WebkitTouchCallout: "none",
  };

  let combinedStyle: any = baseStyle;
  if (isObj(userStyle)) {
    combinedStyle = { ...baseStyle, ...userStyle };
  } else if (isStr(userStyle)) {
    combinedStyle = `-webkit-touch-callout: none; ${userStyle}`;
  }

  return $(
    as,
    {
      id: userId ?? instance.triggerId,
      ref: internalRef,
      dataComponent,
      dataPart: "trigger",
      dataState: instance.isOpen.as((o) => (o ? "open" : "closed")),
      dataExpanded: instance.isOpen.as((o) => (o ? "" : undefined)),
      dataClosed: instance.isOpen.as((o) => (!o ? "" : undefined)),
      dataDisabled: disabled ? "" : undefined,
      style: combinedStyle,
      oncontextmenu: handleContextMenu,
      onpointerdown: handlePointerDown,
      onpointermove: handlePointerMove,
      onpointercancel: handlePointerCancel,
      onpointerup: handlePointerUp,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}

