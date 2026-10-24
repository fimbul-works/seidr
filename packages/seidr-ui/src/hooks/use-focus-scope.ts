import {
  $,
  createValue,
  getAppState,
  isRef,
  isServer,
  isValue,
  onUnmounted,
  type Ref,
  SeidrError,
  unwrapValue,
  type Value,
} from "@fimbul-works/seidr";
import { VISUALLY_HIDDEN_STYLES } from "../constants.js";
import { getOwnerDocument } from "../utils/dom.js";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling.js";
import { getAllTabbableIn } from "../utils/tabbable.js";

export const AUTOFOCUS_ON_MOUNT_EVENT = "focusScope.autoFocusOnMount";
export const AUTOFOCUS_ON_UNMOUNT_EVENT = "focusScope.autoFocusOnUnmount";

const EVENT_OPTIONS = { bubbles: false, cancelable: true };

const FOCUS_SCOPE_STACK_KEY = "seidr-ui.focus-scope:stack";
const DATA_TOP_LAYER_ATTR = "data-kb-top-layer";

export interface FocusScopeAPI {
  pause(): void;
  resume(): void;
}

export interface UseFocusScopeProps {
  /**
   * Whether focus cannot escape the focus scope via keyboard,
   * pointer, or a programmatic focus.
   */
  trapFocus?: boolean | Value<boolean>;

  /**
   * Event handler called when autofocusing on mount.
   * Can be prevented with event.preventDefault().
   */
  onMountAutoFocus?: (event: Event) => void;

  /**
   * Event handler called when autofocusing on unmount.
   * Can be prevented with event.preventDefault().
   */
  onUnmountAutoFocus?: (event: Event) => void;
}

interface FocusScopeStackState {
  stack: FocusScopeAPI[];
  active(): FocusScopeAPI | undefined;
  add(scope: FocusScopeAPI): void;
  remove(scope: FocusScopeAPI): void;
}

const getFocusScopeStack = (): FocusScopeStackState =>
  getAppState().getData<FocusScopeStackState>(FOCUS_SCOPE_STACK_KEY, {
    stack: [],
    active() {
      return this.stack[0];
    },
    add(scope: FocusScopeAPI) {
      if (scope !== this.active()) {
        this.active()?.pause();
      }
      this.stack = this.stack.filter((s) => s !== scope);
      this.stack.unshift(scope);
    },
    remove(scope: FocusScopeAPI) {
      this.stack = this.stack.filter((s) => s !== scope);
      this.active()?.resume();
    },
  });

/**
 * Traps tab focus within an active container and manages autofocus on mount/unmount.
 *
 * Ported from Kobalte's createFocusScope primitive.
 */
export function useFocusScope<T extends HTMLElement = HTMLElement>(ref: Ref<T>, props: UseFocusScopeProps = {}): void {
  if (!isRef(ref)) {
    throw new SeidrError("Invalid Ref");
  }

  if (isServer()) {
    return;
  }

  const isPaused = createValue(false);

  const focusScope: FocusScopeAPI = {
    pause() {
      isPaused(true);
    },
    resume() {
      isPaused(false);
    },
  };

  let lastFocusedElement: HTMLElement | null = null;

  const getDoc = (): Document => getOwnerDocument(ref());

  const getTrapFocus = (): boolean => !!unwrapValue(props.trapFocus);

  const tabbables = () => {
    const container = ref();
    return container ? getAllTabbableIn(container, true).filter((el) => !el.hasAttribute("data-focus-trap")) : [];
  };

  const firstTabbable = () => {
    const items = tabbables();
    return items.length > 0 ? items[0] : null;
  };

  const lastTabbable = () => {
    const items = tabbables();
    return items.length > 0 ? items[items.length - 1] : null;
  };

  let startSentinel: HTMLElement | null = null;
  let endSentinel: HTMLElement | null = null;
  let previouslyFocusedElement: HTMLElement | null = null;

  const createSentinel = () => {
    return $("span", {
      "data-focus-trap": "",
      tabIndex: 0,
      style: VISUALLY_HIDDEN_STYLES,
    });
  };

  const removeSentinels = () => {
    if (startSentinel) {
      startSentinel.remove();
      startSentinel = null;
    }
    if (endSentinel) {
      endSentinel.remove();
      endSentinel = null;
    }
  };

  const onSentinelFocus = (event: FocusEvent) => {
    const first = firstTabbable();
    const last = lastTabbable();

    if (event.relatedTarget === first) {
      focusWithoutScrolling(last);
    } else {
      focusWithoutScrolling(first);
    }
  };

  const onDocFocusIn = (event: FocusEvent) => {
    if (!getTrapFocus() || isPaused()) return;

    const container = ref();
    const target = event.target as HTMLElement | null;

    if (!container || !target) return;
    if (target.closest(`[${DATA_TOP_LAYER_ATTR}]`)) return;

    if (container.contains(target)) {
      lastFocusedElement = target;
    } else {
      focusWithoutScrolling(lastFocusedElement ?? firstTabbable() ?? container);
    }
  };

  const onDocFocusOut = (event: FocusEvent) => {
    if (!getTrapFocus() || isPaused()) return;

    const container = ref();
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    const target = relatedTarget ?? (getDoc().activeElement as HTMLElement | null);

    if (!container || !target) return;
    if (target.closest(`[${DATA_TOP_LAYER_ATTR}]`)) return;

    if (!container.contains(target)) {
      focusWithoutScrolling(lastFocusedElement ?? firstTabbable() ?? container);
    }
  };

  const attachTrap = () => {
    removeSentinels();

    const container = ref();
    if (!container || !getTrapFocus() || isPaused()) return;

    startSentinel = createSentinel();
    endSentinel = createSentinel();

    startSentinel.addEventListener("focusin", onSentinelFocus);
    endSentinel.addEventListener("focusin", onSentinelFocus);

    container.insertAdjacentElement("afterbegin", startSentinel);
    container.insertAdjacentElement("beforeend", endSentinel);

    const doc = getDoc();
    doc.addEventListener("focusin", onDocFocusIn);
    doc.addEventListener("focusout", onDocFocusOut);
  };

  const detachTrap = () => {
    removeSentinels();
    const doc = getDoc();
    doc.removeEventListener("focusin", onDocFocusIn);
    doc.removeEventListener("focusout", onDocFocusOut);
  };

  const setupScope = (container: T) => {
    getFocusScopeStack().add(focusScope);

    previouslyFocusedElement = getDoc().activeElement as HTMLElement | null;
    const hasFocusedCandidate = previouslyFocusedElement && container.contains(previouslyFocusedElement);

    if (!hasFocusedCandidate) {
      const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT_EVENT, EVENT_OPTIONS);
      if (props.onMountAutoFocus) {
        container.addEventListener(AUTOFOCUS_ON_MOUNT_EVENT, props.onMountAutoFocus, { once: true });
      }
      container.dispatchEvent(mountEvent);

      if (!mountEvent.defaultPrevented) {
        setTimeout(() => {
          const first = firstTabbable();
          focusWithoutScrolling(first ?? container);
        }, 0);
      }
    }

    attachTrap();
  };

  onUnmounted(
    ref.bind((container) => {
      if (container) {
        setupScope(container);
      } else {
        detachTrap();
      }
    }),
  );

  if (isValue(props.trapFocus)) {
    onUnmounted(
      props.trapFocus.watch(() => {
        attachTrap();
      }),
    );
  }

  onUnmounted(() => {
    detachTrap();

    const container = ref();
    if (container) {
      const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT_EVENT, EVENT_OPTIONS);
      if (props.onUnmountAutoFocus) {
        container.addEventListener(AUTOFOCUS_ON_UNMOUNT_EVENT, props.onUnmountAutoFocus, { once: true });
      }
      container.dispatchEvent(unmountEvent);

      if (!unmountEvent.defaultPrevented && previouslyFocusedElement) {
        focusWithoutScrolling(previouslyFocusedElement);
      }
    }

    getFocusScopeStack().remove(focusScope);
  });
}
