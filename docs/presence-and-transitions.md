![@fimbul-works/seidr](../public/seidr-logo.svg)

# Presence & Animated Transitions

> **Architectural Analysis & Design Document**  
> Comparing React's unmounting model (and Radix UI's `usePresence`) with Seidr's fine-grained reactive architecture, evaluating technical strategies for reveal and hiding animations.

---

## 1. Executive Summary

In declarative UI frameworks, enter and exit animations present an inherent architectural conflict:

* **The Declarative Contract**: When a reactive condition transitions from `true` to `false` (e.g. `isOpen = false`), the framework wants to immediately destroy the component, unmount its DOM subtree, and tear down subscriptions.
* **The Visual Reality**: For an exit animation (fade-out, slide-down, zoom-out) to play, **the DOM elements must remain physically present in the DOM** while the animation runs, and only be unmounted after the browser fires `animationend` or `transitionend`.

In React, Radix UI solved this with a complex 280-line state machine (`@radix-ui/react-presence`) that forces multiple `useLayoutEffect` passes and abuses React re-renders to delay unmounting.

In Seidr, where **components execute only once** and DOM updates are fine-grained, copying React's hook-based presence mechanism is both architecturally impossible and an anti-pattern. However, because Seidr operates directly on the real DOM without virtual DOM abstractions, implementing reveal and hiding animations can be designed much more cleanly.

This document explores:
1. How React and Radix UI's `usePresence` work under the hood.
2. The role of modern React transitions and web platform standards.
3. Seidr's current synchronous unmounting engine.
4. Three distinct implementation strategies for Seidr, ranging from zero-runtime CSS `@starting-style` to dedicated reactive `AnimatedShow` coordinators.

---

## 2. Deep Dive: How Radix UI `usePresence` Operates in React

The Radix implementation (`packages/react/presence/src/presence.tsx`) acts as a **lifecycle mediator** between the parent's logical intent and React's physical DOM unmount.

### A. The 3-State Machine

Radix uses a state machine with three states and four transitions:

```
                  ┌───────────────────────────────┐
                  │            mounted            │
                  └──────────────┬────────────────┘
                                 │
                 ANIMATION_OUT   │   UNMOUNT (no animation or display: none)
                        ┌────────┴────────┐
                        │                 │
                        ▼                 ▼
          ┌───────────────────────────┐   │
          │     unmountSuspended      │   │
          └─────────────┬─────────────┘   │
                        │                 │
          ANIMATION_END │                 │
                        ▼                 │
                  ┌───────────────────┐   │
                  │     unmounted     │◄──┘
                  └───────────────────┘
```

* **`'mounted'`**: Component is logically open and physically in the DOM.
* **`'unmountSuspended'`**: External prop `present` is `false`, but the physical DOM node is **held alive** because an exit animation was detected.
* **`'unmounted'`**: Both logically closed and physically unmounted (renders `null`).

The key return flag is:
```tsx
isPresent: ['mounted', 'unmountSuspended'].includes(state)
```
While in `'unmountSuspended'`, `isPresent` remains `true`, preventing React from unmounting the child.

---

### B. The React Effect Pipeline & Multi-Phase Timing

Radix splits its logic across multiple React execution phases:

```
[Render Phase] ──► [Commit: Callback Ref] ──► [Commit: useLayoutEffect] ──► [Browser Paint] ──► [Passive: useEffect]
```

#### 1. Commit Phase: Ref Callback (`presence.ref`)
* **When**: Immediately when the DOM element is created or updated in the commit phase.
* **What**: Reads `getComputedStyle(node)` and caches `mountAnimationNameRef`.
* **Why**: Sibling components (such as `react-remove-scroll` or `DismissableLayer`) run layout effects that mutate styles on `document.body` or parents. Reading computed style in the ref callback guarantees capturing clean styles *before* other effects cause forced synchronous style recalculations (layout thrashing).

#### 2. Layout Phase: Synchronous Animation Detection (`useLayoutEffect #1`)
* **When**: Synchronously after DOM mutations, before paint.
* **What**: Compares `wasPresent` vs `present`.
* **Why computed style sniffing instead of `animationstart`?**:
  * In CSS, animations trigger when attributes change (e.g., `data-state="open"` ➔ `data-state="closed"` matches a CSS rule with `animation: fadeOut 200ms`).
  * The browser's native `animationstart` event **does not fire until any `animation-delay` has expired**. If an animation has a 50ms delay, waiting for `animationstart` creates lag or race conditions.
  * More critically: if the user **did not configure an exit animation**, waiting for `animationstart` would cause the component to hang in the DOM forever.
  * By reading `getComputedStyle(node).animationName` synchronously on frame 0, Radix determines instantly whether an exit animation exists. If `animationName === 'none'` or `display: 'none'`, it immediately sends `UNMOUNT`.

#### 3. Layout Phase: Event Listeners & The React 18 Concurrency Flash (`useLayoutEffect #2`)
* Attaches `animationstart`, `animationend`, and `animationcancel` listeners directly to the DOM node.
* **The React 18 Concurrency Flash**: In React 18, dispatching a state update (`send('ANIMATION_END')`) is scheduled asynchronously. Once a CSS animation reaches 100%, the browser resets the element to its pre-animation CSS state for ~1 frame before React gets around to unmounting it, causing a visible visual flash.
* Radix works around this by imperatively setting `node.style.animationFillMode = 'forwards'` and resetting it inside a `setTimeout`.

#### 4. React 19 Ref Stability Workaround (`useStableComposedRefs`)
* In React 19, ref callbacks with unstable function identities detach (`ref(null)`) and re-attach on every commit. Because `usePresence` invokes `setNode` inside its ref callback, an unstable consumer ref causes React to re-render in an infinite loop (`Maximum update depth exceeded`). Radix had to write a custom composite ref helper to prevent this.

---

## 3. Dissecting "Transition" in Modern React

There is common confusion around the term "Transition" in the React ecosystem:

| Concept | What It Actually Does | Exit Animation Support? |
| :--- | :--- | :---: |
| **React Core `startTransition` / `useTransition`** | CPU scheduling priority for concurrent rendering (keeps inputs responsive while heavy lists render). | ❌ **No**. Has zero knowledge of CSS or delayed DOM unmounting. |
| **`react-transition-group` (`<CSSTransition>`)** | Legacy library that delays unmounting by requiring an explicit JavaScript duration prop (e.g. `timeout={300}`). | ⚠️ **Yes**, but requires manual JS timeouts. |
| **Radix UI `<Presence>`** | Intercepts unmounting and automatically sniffs CSS `animation-name` to determine duration without JS timeout props. | ✅ **Yes**. |
| **Web Platform `@starting-style` & `allow-discrete`** | Native CSS feature allowing `display: none` and `content-visibility` to transition without JavaScript unmount delay. | ✅ **Yes** (when elements remain in DOM). |

---

## 4. Current State of Seidr Core

Seidr currently operates on a strictly synchronous mounting model.

In `packages/seidr/src/dom/append-child.ts`:

```typescript
// Inside createReactiveValueNodes(value):
const unbind = value.watch((newVal) => {
  // ...
  // Remove old nodes between startMarker and endMarker
  const appState = getAppState();
  let current = startMarker.nextSibling;

  while (isDOMNode(current) && current !== endMarker) {
    const next = current.nextSibling;
    const component = appState.nodeIndex.get(current);
    if (component && !component.nodes.includes(startMarker) && !component.nodes.includes(endMarker)) {
      component.unmount();
    } else {
      current.remove();
    }
    current = next;
  }

  // Insert new nodes before endMarker
  normalizeChildNodes(newVal).forEach((node) => {
    parentNode.insertBefore(node, endMarker);
    if (parentNode.isConnected) {
      mountConnectedComponents(node);
    }
  });
});
```

### The Inherent Architectural Differences

| Dimension | React (Radix UI) | Seidr Core |
| :--- | :--- | :--- |
| **Execution Model** | Multi-pass re-render loop | **Single-Pass Invariant** (factory runs once) |
| **State Mutation** | `useReducer` / `useState` triggers component re-render | Fine-grained `Value<T>` directly updates DOM targets |
| **Unmount Triggers** | Component returns `null` on re-render | `value.watch()` synchronously calls `node.remove()` and `component.unmount()` |
| **Ref Mechanism** | VDOM synthetic refs, cloned via `cloneElement` | Native DOM references captured via `createRef()` or closures |
| **Lifecycle Hooks** | `useLayoutEffect`, `useEffect` per render pass | `onMounted`, `onUnmounted` per component lifecycle |

> [!IMPORTANT]
> Because Seidr components do **not** re-render, a React-style hook `const presence = usePresence(isOpen)` that attempts to drive rendering via an internal state machine cannot work in Seidr. A Seidr component returning an element executes its body only once.

---

## 5. Architectural Approaches for Seidr

While porting Radix's *React-specific implementation* makes no sense, providing smooth reveal/hiding animations in Seidr is entirely achievable. Three distinct approaches fit different use cases:

---

### Approach 1: Modern CSS-Native Transitions (`@starting-style`)
* **Complexity**: Zero framework changes (works today in Seidr).
* **Ideal For**: Collapsible, Accordion, TabsContent, persistent menus, non-modal drawers.

Modern web browsers support transitioning to and from `display: none` natively using CSS `@starting-style` and `transition-behavior: allow-discrete`.

#### How It Works:
Instead of removing elements from the DOM, the element remains mounted and toggles its `data-state` and `hidden` attributes reactively:

```typescript
// Seidr Component:
export const CollapsibleContent = createComponent((props) => {
  const { isOpen, children } = props;

  return $div({
    className: 'collapsible-content',
    dataState: isOpen.as((o) => (o ? 'open' : 'closed')),
    hidden: isOpen.as((o) => !o),
  }, children);
});
```

```css
/* Modern CSS */
.collapsible-content {
  transition: opacity 0.2s ease, transform 0.2s ease, display 0.2s ease allow-discrete;
  opacity: 1;
  transform: translateY(0);
}

.collapsible-content[hidden] {
  opacity: 0;
  transform: translateY(-8px);
  display: none;
}

@starting-style {
  .collapsible-content {
    opacity: 0;
    transform: translateY(-8px);
  }
}
```

#### Evaluation:
* **Advantages**: Zero JavaScript runtime overhead, zero timing bugs, no state machine needed, perfectly smooth 120 FPS browser-handled transitions.
* **Limitations**: The element remains in the DOM tree while hidden. For massive lists or heavy modal dialogs that require true DOM detachment for accessibility or memory reasons, physical unmounting is still preferred.

---

### Approach 2: The `AnimatedShow` / `Presence` Coordinator Component
* **Complexity**: Moderate (~100 LOC, lives in `@fimbul-works/seidr` or `@fimbul-works/seidr-ui`).
* **Ideal For**: Dialog, Popover, Tooltip, Toast, and overlay primitives requiring complete DOM detachment on close.

Instead of a hook, Seidr can provide a reactive coordinator component that controls the lifetime of its child nodes between marker comments.

#### Conceptual API:
```typescript
import { AnimatedShow } from '@fimbul-works/seidr';

// Used just like Show():
AnimatedShow(
  isOpen,
  () => DialogContent(),
  {
    exitAnimationClass: 'dialog-exit', // optional explicit class
    // or automatically inspect CSS computed animationName
  }
);
```

#### Architectural Design:

```
[isOpen: true] ──► renders DialogContent into DOM (data-state="open")
       │
[isOpen: false] ──► sets data-state="closed"
       │
       ├─► Sniffs getComputedStyle(node).animationName
       │   ├─► If "none" ──► Immediately unmounts & removes DOM
       │   └─► If active ──► Listens for "animationend"
       │                          │
       │                   [animationend]
       │                          │
       │                          ▼
       └──────────────────► Unmounts & removes DOM
```

#### Prototype Implementation:
```typescript
import { createValue, type Value } from '@fimbul-works/seidr';
import type { SeidrChild } from '@fimbul-works/seidr/html';

export interface PresenceOptions {
  name?: string;
}

export const AnimatedShow = (
  condition: Value<boolean>,
  whenTrue: () => SeidrChild,
  options?: PresenceOptions
): Value<SeidrChild> => {
  // Internal coordinator value controlling what is actually rendered to the DOM
  const activeBranch = createValue<SeidrChild>(condition() ? whenTrue() : null);

  let isExiting = false;
  let exitCleanups: (() => void)[] = [];

  condition.watch((isPresent) => {
    // 1. Clean up any pending exit listeners
    exitCleanups.forEach((cleanup) => cleanup());
    exitCleanups = [];

    if (isPresent) {
      isExiting = false;
      // If we are opening, mount the branch immediately
      activeBranch(whenTrue());
    } else {
      // 2. We want to exit. Check if the element is currently rendered in the DOM
      const currentNodes = activeBranch();
      const rootNode = Array.isArray(currentNodes) ? currentNodes[0] : currentNodes;

      if (!rootNode || !(rootNode instanceof HTMLElement)) {
        activeBranch(null);
        return;
      }

      // 3. Mark the element with closed state so CSS can trigger exit keyframes
      rootNode.setAttribute('data-state', 'closed');

      const styles = window.getComputedStyle(rootNode);
      const animationName = styles.animationName;
      const transitionDuration = parseFloat(styles.transitionDuration) || 0;

      const hasAnimation = animationName && animationName !== 'none';
      const hasTransition = transitionDuration > 0;

      // 4. If no animation or transition is configured, unmount immediately
      if (!hasAnimation && !hasTransition) {
        activeBranch(null);
        return;
      }

      // 5. Suspend unmounting until the animation finishes
      isExiting = true;

      const handleEnd = (e: Event) => {
        if (e.target !== rootNode) return; // Ignore child animation events
        if (isExiting) {
          isExiting = false;
          activeBranch(null); // Triggers Seidr's synchronous unmount
        }
      };

      rootNode.addEventListener('animationend', handleEnd, { once: true });
      rootNode.addEventListener('transitionend', handleEnd, { once: true });

      exitCleanups.push(() => {
        rootNode.removeEventListener('animationend', handleEnd);
        rootNode.removeEventListener('transitionend', handleEnd);
      });
    }
  });

  return activeBranch;
};
```

#### Why This is Far Simpler in Seidr than Radix:
1. **No React 18 Concurrency Flash**: Because Seidr executes synchronously without React concurrent scheduler batching delays, `activeBranch(null)` immediately removes the node from the DOM the moment `animationend` fires. No `animationFillMode: 'forwards'` hack is needed.
2. **No Ref Churn**: Seidr doesn't re-render or clone elements with synthetic ref objects.
3. **Interruptible**: If `isOpen` toggles back to `true` while an exit animation is playing, the `condition.watch()` handler simply cleans up the listener and restores the open state without tearing down or remounting the component subtree.

---

### Approach 3: Core Lifecycle Enhancement (`beforeUnmount`)
* **Complexity**: High (modifies `@fimbul-works/seidr` core reconciler).
* **Ideal For**: Universal support across all conditional rendering patterns (`Show()`, dynamic lists, router views).

In this pattern, Seidr's core lifecycle supports an asynchronous `onBeforeUnmount` hook:

```typescript
export const DialogContent = createComponent(() => {
  onBeforeUnmount(async (node) => {
    node.setAttribute('data-state', 'closed');
    await waitForAnimation(node);
  });

  return $div({ className: 'dialog' });
});
```

#### Framework Engine Modification:
In `packages/seidr/src/dom/append-child.ts`, `createReactiveValueNodes` would check if an unmounting component has registered an `onBeforeUnmount` handler:
1. If registered, the node is not removed from the parent DOM immediately.
2. It remains in a "retiring" bucket while the promise resolves.
3. Once resolved, `node.remove()` and `component.unmount()` are executed.

#### Architectural Caveats:
* **Reconciliation Races**: If the parent value changes again before the promise resolves, the reconciler must cancel the pending retirement, handle node recycling, and prevent duplicate nodes between markers.
* **Bundle Impact**: Adds lifecycle complexity to the core runtime for all components, even those without animations.

---

## 6. Comparison Matrix

| Feature | React (Radix UI `Presence`) | Approach 1: Modern CSS (`@starting-style`) | Approach 2: Seidr `AnimatedShow` | Approach 3: Core `onBeforeUnmount` |
| :--- | :--- | :--- | :--- | :--- |
| **Physical Unmounting** | Yes (delayed) | No (remains mounted, hidden) | Yes (delayed) | Yes (delayed) |
| **Framework Code Size** | ~306 LOC + reducer | **0 LOC** (native CSS) | ~80 LOC | ~150 LOC (core reconciler) |
| **Requires Framework Changes**| N/A | None | Addon / helper component | Modifies `append-child.ts` |
| **Handles Rapid Toggling** | State machine transitions | Native CSS engine | Aborts listener, resets state | Requires queue cancellation |
| **Accessibility Inertness** | Node removed | Via `hidden` / `display: none` | Node removed | Node removed |
| **Porting Readiness** | React-only | Ready now | Ready to build | Future framework evolution |

---

## 7. Recommended Roadmap for Seidr

1. **Near Term (Current Porting Phases)**:
   * Rely on **Approach 1 (CSS `@starting-style` & `allow-discrete`)** for primitives like `Collapsible`, `Accordion`, and `TabsContent`. This requires zero new runtime code in Seidr and leverages modern browser layout engines.
2. **Phase 3 (Overlay Primitives & Portal)**:
   * When porting overlay primitives that demand complete physical DOM removal (Dialog, Popover, Tooltip, Menu), introduce **Approach 2 (`AnimatedShow` / `Presence`)** as a lightweight utility in `@fimbul-works/seidr-ui`.
   * This preserves 100% of Radix UI's behavioral contract without bringing over React's VDOM overhead.
