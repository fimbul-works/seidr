import { isFn, isStr } from "@fimbul-works/hvat";
import {
  type EffectDependency,
  getDocument,
  isValue,
  type Ref,
  unwrapValue,
  useEffect,
  type Value,
} from "@fimbul-works/seidr";
export const DATA_TOP_LAYER_ATTR = "data-kb-top-layer";

type EventDetails<T> = {
  originalEvent: T;
  isContextMenu: boolean;
};

export type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>;
export type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>;
export type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent;

export interface UseInteractOutsideProps {
  /** Whether the interact outside events should be listened or not. */
  isDisabled?: Value<boolean>;

  /**
   * When user interacts with the argument element outside the ref,
   * return `true` if the interaction should not trigger the "interact outside" handlers.
   */
  shouldExcludeElement?: (element: Element) => boolean;

  /** Event handler called when a `pointerdown` event happens outside the ref. */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;

  /** Event handler called when the focus moves outside the ref. */
  onFocusOutside?: (event: FocusOutsideEvent) => void;

  /** Event handler called when an interaction (pointerdown or focus) happens outside the ref. */
  onInteractOutside?: (event: InteractOutsideEvent) => void;
}

const POINTER_DOWN_OUTSIDE_EVENT = "interactOutside.pointerDownOutside";
const FOCUS_OUTSIDE_EVENT = "interactOutside.focusOutside";

export function getEventTarget(event: Event): Element | null {
  const path = isFn(event.composedPath) ? event.composedPath() : undefined;
  const target = path?.[0] ?? event.target;
  return target instanceof Element ? target : null;
}

export function containsComposed(parent: Node | undefined | null, child: Node | null): boolean {
  if (!parent || !child) return false;
  let node: Node | null = child;
  while (node) {
    if (parent === node || parent.contains(node)) {
      return true;
    }
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return false;
}

export function closestComposed(element: Element | null, selector: string): Element | null {
  let node: Element | null = element;
  while (node) {
    const match = node.closest(selector);
    if (match) return match;
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return null;
}

const isCtrlKey = (e: MouseEvent): boolean => {
  const isMac = typeof navigator !== "undefined" && isStr(navigator.platform) && navigator.platform.includes("Mac");
  return e.ctrlKey || (isMac ? e.metaKey : false);
};

/**
 * Detects pointerdown or focus events outside the target container.
 * Cleans up document listeners automatically on unmount.
 *
 * Ported from Kobalte's createInteractOutside primitive.
 */
export function useInteractOutside<T extends Element = HTMLElement>(
  ref: Ref<T>,
  props: UseInteractOutsideProps = {},
): void {
  const isDisabled = props.isDisabled;
  const getDoc = (): Document => ref()?.ownerDocument ?? getDocument();

  const isEventOutside = (e: Event): boolean => {
    const target = getEventTarget(e);
    if (!target) return false;

    if (closestComposed(target, `[${DATA_TOP_LAYER_ATTR}]`)) {
      return false;
    }

    const doc = getDoc();
    if (!containsComposed(doc, target)) {
      return false;
    }

    const container = ref();
    if (containsComposed(container, target)) {
      return false;
    }

    return !props.shouldExcludeElement?.(target);
  };

  let pointerDownTimeoutId: number | undefined;
  let clickHandler: ((e: MouseEvent) => void) | null = null;

  const onPointerDown = (e: PointerEvent) => {
    const handler = () => {
      const container = ref();
      const target = getEventTarget(e);

      if (!container || !target || !isEventOutside(e)) {
        return;
      }

      const pointerDownOutsideEvent = new CustomEvent(POINTER_DOWN_OUTSIDE_EVENT, {
        bubbles: false,
        cancelable: true,
        detail: {
          originalEvent: e,
          isContextMenu: e.button === 2 || (isCtrlKey(e) && e.button === 0),
        } as EventDetails<PointerEvent>,
      }) as PointerDownOutsideEvent;

      const eventHandler = (ev: Event) => {
        props.onPointerDownOutside?.(ev as PointerDownOutsideEvent);
        props.onInteractOutside?.(ev as PointerDownOutsideEvent);
      };

      target.addEventListener(POINTER_DOWN_OUTSIDE_EVENT, eventHandler, { once: true });
      target.dispatchEvent(pointerDownOutsideEvent);
    };

    if (e.pointerType === "touch") {
      const doc = getDoc();
      if (clickHandler) {
        doc.removeEventListener("click", clickHandler);
      }
      clickHandler = () => {
        handler();
      };
      doc.addEventListener("click", clickHandler, { once: true });
    } else {
      handler();
    }
  };

  const onFocusIn = (e: FocusEvent) => {
    const container = ref();
    const target = getEventTarget(e);

    if (!container || !target || !isEventOutside(e)) {
      return;
    }

    const focusOutsideEvent = new CustomEvent(FOCUS_OUTSIDE_EVENT, {
      bubbles: false,
      cancelable: true,
      detail: {
        originalEvent: e,
        isContextMenu: false,
      } as EventDetails<FocusEvent>,
    }) as FocusOutsideEvent;

    const eventHandler = (ev: Event) => {
      props.onFocusOutside?.(ev as FocusOutsideEvent);
      props.onInteractOutside?.(ev as FocusOutsideEvent);
    };

    target.addEventListener(FOCUS_OUTSIDE_EVENT, eventHandler, { once: true });
    target.dispatchEvent(focusOutsideEvent);
  };

  const deps: EffectDependency[] = [ref];
  if (isValue(isDisabled)) deps.push(isDisabled);

  useEffect(() => {
    if (unwrapValue(isDisabled)) {
      return;
    }

    const doc = getDoc();

    pointerDownTimeoutId = window.setTimeout(() => doc.addEventListener("pointerdown", onPointerDown, true), 0);

    doc.addEventListener("focusin", onFocusIn, true);

    return () => {
      if (pointerDownTimeoutId !== undefined) {
        window.clearTimeout(pointerDownTimeoutId);
        pointerDownTimeoutId = undefined;
      }

      if (clickHandler) {
        doc.removeEventListener("click", clickHandler);
        clickHandler = null;
      }
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("focusin", onFocusIn, true);
    };
  }, deps);
}
