import { $, getAppState, getDocument, useEffect } from "@fimbul-works/seidr";

const FOCUS_GUARDS_KEY = "seidr-ui.focus-guards";

interface FocusGuardsState {
  count: number;
  guards: { start: HTMLSpanElement; end: HTMLSpanElement } | null;
}

const getFocusGuardsState = (): FocusGuardsState =>
  getAppState().getData<FocusGuardsState>(FOCUS_GUARDS_KEY, { count: 0, guards: null });

/**
 * Creates an invisible, focusable span element to act as an edge guard.
 *
 * @returns {HTMLSpanElement} Focus guard element.
 */
export function createFocusGuard(): HTMLSpanElement {
  return $("span", {
    tabIndex: 0,
    style: {
      outline: "none",
      opacity: "0",
      position: "fixed",
      pointerEvents: "none",
    },
    dataSeidrFocusGuard: "",
  });
}

/**
 * Injects a pair of focus guards at the edges of the whole DOM tree (document.body)
 * to ensure focusin & focusout events can be trapped consistently within modals and overlays.
 *
 * Automatically manages reference counting across multiple active consumers and cleans up
 * edge guards when the last consumer unmounts.
 *
 * Ported from https://github.com/radix-ui/primitives/blob/main/packages/react/focus-guards/src/focus-guards.tsx
 * MIT License, Copyright (c) WorkOS.
 */
export function useFocusGuards(): void {
  useEffect(() => {
    const state = getFocusGuardsState();
    if (!state.guards) {
      state.guards = { start: createFocusGuard(), end: createFocusGuard() };
    }
    const { start, end } = state.guards;
    const body = getDocument().body;

    // Only mutate the DOM when the edge invariant is actually broken.
    if (body.firstElementChild !== start) {
      body.insertAdjacentElement("afterbegin", start);
    }
    if (body.lastElementChild !== end) {
      body.insertAdjacentElement("beforeend", end);
    }
    state.count++;

    return () => {
      if (state.count === 1) {
        state.guards?.start.remove();
        state.guards?.end.remove();
        state.guards = null;
      }
      state.count = Math.max(0, state.count - 1);
    };
  }, []);
}

/**
 * Resets the focus guards and removes any active guard elements from the DOM.
 *
 * @internal Used in testing.
 */
export function resetFocusGuards(): void {
  const state = getFocusGuardsState();
  if (state.guards) {
    state.guards.start.remove();
    state.guards.end.remove();
    state.guards = null;
  }
  state.count = 0;
}
