import {
  $,
  mergeStyleProps,
  type ReactiveStyleDeclaration,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_PART_ROOT } from "../constants.js";
import type { ToastRootProps, ToastSwipeDirection, ToastSwipeEvent, ToastSwipeEventDetail } from "./types.js";

const TOAST_SWIPE_START_EVENT = "toast.swipeStart";
const TOAST_SWIPE_MOVE_EVENT = "toast.swipeMove";
const TOAST_SWIPE_CANCEL_EVENT = "toast.swipeCancel";
const TOAST_SWIPE_END_EVENT = "toast.swipeEnd";

function isDeltaInDirection(delta: { x: number; y: number }, direction: ToastSwipeDirection, threshold = 0): boolean {
  const deltaX = Math.abs(delta.x);
  const deltaY = Math.abs(delta.y);
  const isDeltaX = deltaX > deltaY;

  if (direction === "left" || direction === "right") {
    return isDeltaX && deltaX > threshold;
  }
  return !isDeltaX && deltaY > threshold;
}

function dispatchSwipeEvent(
  targetEl: HTMLElement,
  name: string,
  handler: ((event: ToastSwipeEvent) => void) | undefined,
  detail: ToastSwipeEventDetail,
): void {
  const event = new CustomEvent<ToastSwipeEventDetail>(name, {
    bubbles: true,
    cancelable: true,
    detail,
  }) as ToastSwipeEvent;

  if (handler) {
    targetEl.addEventListener(name, handler as EventListener, { once: true });
  }

  targetEl.dispatchEvent(event);
}

/**
 * Root toast item (`<li role="status" tabIndex={0}>`).
 */
export function ToastRoot<T extends keyof SeidrElementTagNameMap = "li">(
  props: ToastRootProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "li" as T,
    instance: toast,
    id: customId,
    role = "status",
    tabIndex = 0,
    style: userStyle,
    dataComponent,
    ariaLabel,
    "aria-label": ariaLabelHyphen,
    ariaLabelledBy,
    "aria-labelledby": ariaLabelledByHyphen,
    ariaDescribedBy,
    "aria-describedby": ariaDescribedByHyphen,
    onkeydown: userOnKeyDown,
    onpointerdown: userOnPointerDown,
    onpointermove: userOnPointerMove,
    onpointerup: userOnPointerUp,
    ...rest
  } = props;

  if (!toast) {
    throw new SeidrError("ToastRoot requires a Toast instance coordinator");
  }

  let rootEl: HTMLElement | undefined;
  let pointerStart: { x: number; y: number } | null = null;
  let swipeDelta: { x: number; y: number } | null = null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (typeof userOnKeyDown === "function") {
      userOnKeyDown.call(rootEl as SeidrElementTagNameMap[T], e);
    }
    if (e.key !== "Escape") {
      return;
    }
    toast.onEscapeKeyDown?.(e);
    if (!e.defaultPrevented) {
      toast.close();
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (typeof userOnPointerDown === "function") {
      userOnPointerDown.call(rootEl as SeidrElementTagNameMap[T], e);
    }
    if (e.button !== 0) {
      return;
    }
    pointerStart = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (typeof userOnPointerMove === "function") {
      userOnPointerMove.call(rootEl as SeidrElementTagNameMap[T], e);
    }
    if (!pointerStart || !rootEl) {
      return;
    }

    const x = e.clientX - pointerStart.x;
    const y = e.clientY - pointerStart.y;
    const hasSwipeMoveStarted = Boolean(swipeDelta);
    const direction = toast.swipeDirection();
    const isHorizontalSwipe = direction === "left" || direction === "right";
    const clamp = direction === "left" || direction === "up" ? Math.min : Math.max;

    const clampedX = isHorizontalSwipe ? clamp(0, x) : 0;
    const clampedY = !isHorizontalSwipe ? clamp(0, y) : 0;

    const moveStartBuffer = e.pointerType === "touch" ? 10 : 2;
    const delta = { x: clampedX, y: clampedY };
    const eventDetail: ToastSwipeEventDetail = { originalEvent: e, delta };

    if (hasSwipeMoveStarted) {
      swipeDelta = delta;
      dispatchSwipeEvent(rootEl, TOAST_SWIPE_MOVE_EVENT, toast.onSwipeMove, eventDetail);
      rootEl.setAttribute("data-swipe", "move");
      rootEl.style.setProperty("--toast-swipe-move-x", `${delta.x}px`);
      rootEl.style.setProperty("--toast-swipe-move-y", `${delta.y}px`);
    } else if (isDeltaInDirection(delta, direction, moveStartBuffer)) {
      swipeDelta = delta;
      dispatchSwipeEvent(rootEl, TOAST_SWIPE_START_EVENT, toast.onSwipeStart, eventDetail);
      rootEl.setAttribute("data-swipe", "start");
      const target = e.target as HTMLElement | null;
      if (target && typeof target.setPointerCapture === "function") {
        target.setPointerCapture(e.pointerId);
      }
    } else if (Math.abs(x) > moveStartBuffer || Math.abs(y) > moveStartBuffer) {
      pointerStart = null;
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (typeof userOnPointerUp === "function") {
      userOnPointerUp.call(rootEl as SeidrElementTagNameMap[T], e);
    }
    const delta = swipeDelta;
    const target = e.target as HTMLElement | null;

    if (target && typeof target.hasPointerCapture === "function" && target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }

    swipeDelta = null;
    pointerStart = null;

    if (delta && rootEl) {
      const eventDetail: ToastSwipeEventDetail = { originalEvent: e, delta };
      const direction = toast.swipeDirection();
      const threshold = toast.swipeThreshold();

      if (isDeltaInDirection(delta, direction, threshold)) {
        dispatchSwipeEvent(rootEl, TOAST_SWIPE_END_EVENT, toast.onSwipeEnd, eventDetail);
        rootEl.setAttribute("data-swipe", "end");
        rootEl.style.removeProperty("--toast-swipe-move-x");
        rootEl.style.removeProperty("--toast-swipe-move-y");
        rootEl.style.setProperty("--toast-swipe-end-x", `${delta.x}px`);
        rootEl.style.setProperty("--toast-swipe-end-y", `${delta.y}px`);
        toast.close();
      } else {
        dispatchSwipeEvent(rootEl, TOAST_SWIPE_CANCEL_EVENT, toast.onSwipeCancel, eventDetail);
        rootEl.setAttribute("data-swipe", "cancel");
        rootEl.style.removeProperty("--toast-swipe-move-x");
        rootEl.style.removeProperty("--toast-swipe-move-y");
        rootEl.style.removeProperty("--toast-swipe-end-x");
        rootEl.style.removeProperty("--toast-swipe-end-y");
      }

      rootEl.addEventListener("click", (event) => event.preventDefault(), { once: true });
    }
  };

  const baseStyle: ReactiveStyleDeclaration = {
    animation: toast.isAnimationEnabled.as((enabled) => (enabled ? undefined : "none")),
    userSelect: "none",
    touchAction: "none",
  };

  const el = $<T>(
    as,
    {
      id: customId ?? toast.id,
      role,
      tabIndex,
      style: mergeStyleProps(baseStyle, userStyle),
      ariaLive: toast.priority.as((p) => (p === "high" ? "assertive" : "polite")),
      ariaAtomic: "true",
      ariaLabel: ariaLabel ?? ariaLabelHyphen,
      ariaLabelledby: ariaLabelledBy ?? ariaLabelledByHyphen ?? toast.titleId,
      ariaDescribedby: ariaDescribedBy ?? ariaDescribedByHyphen ?? toast.descriptionId,
      dataOpened: toast.isOpen.as((open) => (open ? "" : undefined)),
      dataClosed: toast.isOpen.as((open) => (!open ? "" : undefined)),
      dataSwipeDirection: toast.swipeDirection,
      dataComponent: dataComponent ?? toast.dataComponent,
      dataPart: DATA_PART_ROOT,
      onkeydown: handleKeyDown,
      onpointerdown: handlePointerDown,
      onpointermove: handlePointerMove,
      onpointerup: handlePointerUp,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );

  rootEl = el;
  return el;
}
