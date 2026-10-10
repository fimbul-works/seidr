# Seidr Anti-Patterns & Contamination Pitfalls

When AI models port React libraries to Seidr, they frequently fall into subtle traps caused by ingrained React mental models or by confusing Seidr with SolidJS/Vue.

Review this document to identify and avoid these anti-patterns.

---

## 1. Recreating React Hooks ("Fake Moustache React")

### ❌ Anti-Pattern: Recreating Hook Helpers
```typescript
// BAD: Recreating React hook abstractions inside Seidr
function useToggle(initial: boolean) {
  const val = createValue(initial);
  return [val, () => val((v) => !v)] as const;
}

function useEffectOnce(fn: () => void) {
  onMounted(fn);
}
```

### ✅ Idiomatic Seidr: Direct Primitives
```typescript
// GOOD: Use Seidr's native primitives directly.
// Components run once, so a simple helper function or direct method call suffices:
const isOpen = createValue(false);
const toggle = () => isOpen((v) => !v);
```

---

## 2. Assuming Component Bodies Re-Run on Prop Changes

### ❌ Anti-Pattern: Reading Props Statically
```typescript
// BAD: Destructuring props and computing a derived string in component setup.
// If the parent updates `props.label`, `displayText` will NEVER update!
export const Card = createComponent<{ label: string | Value<string> }>((props) => {
  const rawLabel = typeof props.label === 'function' ? props.label() : props.label;
  const displayText = `Label: ${rawLabel}`;

  return $div({ textContent: displayText });
});
```

### ✅ Idiomatic Seidr: Normalize with `wrapValue()`
```typescript
// GOOD: Normalize dynamic props using wrapValue and derive reactively with .as():
export const Card = createComponent<{ label: string | Value<string> }>((props) => {
  const label = wrapValue(props.label);

  return $div({
    textContent: label.as((l) => `Label: ${l}`)
  });
});
```

---

## 3. Hallucinating Non-Existent APIs

Models often confuse Seidr with SolidJS, Preact Signals, or Svelte.

| Hallucinated API | Correct Seidr API |
| :--- | :--- |
| `createSignal(0)` | `createValue(0, { isEqual: () => false })` |
| `createMemo(() => ...)` | `val.as(...)` or `mergeValues(() => ...)` |
| `createEffect(() => ...)` | `val.watch(...)` or `val.bind(...)` |
| `useStore(...)` | `createValue({ ... })` or `getAppState()` |
| `batch(() => ...)` | Updates trigger immediately; batching is handled internally |
| `createRef()` | `useRef<T>()` |
| `onCleanup(fn)` | `onUnmounted(fn)` or return a teardown from `.watch()` / `.bind()` |
| `inBrowser(fn)` | `inClient(fn)` — `inBrowser` DOES NOT EXIST in Seidr |
| `isBrowser()` | `isClient()` — `isBrowser` DOES NOT EXIST in Seidr |
| `createPortal(el, container)` / `<Portal>` | **Known framework gap.** DO NOT INVENT. Stop and report to user |

---

## 4. Manual DOM Manipulation When Reactive Bindings Exist

### ❌ Anti-Pattern: Imperative DOM Toggling
```typescript
// BAD: Manually mutating DOM properties inside a watcher
const isOpen = createValue(false);
const btn = $button({ textContent: 'Toggle' });

isOpen.watch((open) => {
  if (open) {
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  } else {
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }
});
```

### ✅ Idiomatic Seidr: Declarative Attribute Bindings
```typescript
// GOOD: Pass observables directly as attributes or derived values:
const isOpen = createValue(false);

const btn = $button({
  textContent: 'Toggle',
  ariaExpanded: isOpen, // Seidr binds boolean/string values reactively
  className: isOpen.as((open) => (open ? 'btn is-open' : 'btn'))
});
```
Seidr automatically handles updates and tears down listeners when the element or component is unmounted.

---

## 5. Leaking Browser Globals into SSR Contexts

### ❌ Anti-Pattern: Unguarded Window / Document Access
```typescript
// BAD: Accessing window or document in top-level module code or component setup
export const Dialog = createComponent(() => {
  const screenWidth = window.innerWidth; // THROWS in SSR!
  document.body.classList.add('modal-open'); // THROWS in SSR!
  ...
});
```

### ✅ Idiomatic Seidr: Defer or Guard
```typescript
// GOOD:
// 1. For document queries, use getDocument() (safe in SSR via JSDOM)
import { getDocument, inClient, onMounted, onUnmounted } from '@fimbul-works/seidr';

export const Dialog = createComponent(() => {
  const screenWidth = createValue(1024);

  // 2. Browser-only measurements belong in onMounted AND must be guarded by inClient:
  onMounted(() => {
    inClient(() => {
      screenWidth(window.innerWidth);
    });
  });

  // 3. Or guard listeners directly with inClient:
  inClient(() => {
    window.addEventListener('resize', handleResize);
  });
});
```

---

## 6. Over-Engineering Context When Plain Objects Suffice

### ❌ Anti-Pattern: Deep Context Trees
In React, sharing state between a dialog trigger and content often involves creating a `DialogContext`, a `DialogProvider`, and a `useDialogContext` hook.

### ✅ Idiomatic Seidr: Coordinator Factory
```typescript
// GOOD: In Seidr, a simple coordinator factory returns the shared state and subcomponents:
export const createDialog = (options = {}) => {
  const isOpen = createValue(options.defaultOpen ?? false);

  const Trigger = (props, children) =>
    $button({
      ...props,
      ariaExpanded: isOpen,
      onclick: () => isOpen((o) => !o)
    }, children);

  const Content = (props, children) =>
    Show(isOpen, () => $div({ ...props, role: 'dialog' }, children));

  return { isOpen, Trigger, Content };
};
```
This is pure, simple, and has zero Context overhead!

---

## 7. `withStorage()` Overriding Hydrated State in SSR

When a `Value` is assigned an explicit `id` (e.g. `createValue('dark', { id: 'theme' })`), it acts as an `AppState` singleton and participates in SSR state hydration.

### ⚠️ Gotcha: Synchronous Storage Restores
`withStorage(key, value)` immediately reads from `localStorage` upon initialization on the client. Because this occurs at construction time, any existing value stored in the client's `localStorage` can silently overwrite the server-hydrated state before hydration completes.

- **Rule**: If a `Value` is hydrated via SSR and persists across client sessions with `withStorage`, be aware that local browser state will supersede the initial SSR snapshot immediately upon client execution.

---

## 8. Storing Per-Instance Component State in App-Level Singletons or `getAppState()`

### ❌ Anti-Pattern: Shared Singletons for Compound Components
```typescript
// BAD: Assigning fixed singleton IDs or using getAppState() for compound components
export const createDialog = () => {
  // ⚠️ COLLISION BUG: If two dialogs exist on the same page, they share 'dialog-open'!
  const isOpen = createValue(false, { id: 'dialog-open' });

  return { isOpen, ... };
};
```
When two dialogs, accordions, or dropdowns are mounted on the same page, giving their state a fixed `id` or saving them in `getAppState()` causes them to collide. Opening Dialog A will unexpectedly open Dialog B!

### ✅ Idiomatic Seidr: Instance-Scoped Closures
```typescript
// GOOD: Each dialog instance owns a distinct, un-namespaced reactive Value
export const createDialog = (options = {}) => {
  const isOpen = createValue(options.defaultOpen ?? false); // Scoped to this instance!

  return { isOpen, ... };
};
```
- **Rule**: Per-instance state **never** goes in app-level singletons or `createValue(..., { id: 'fixed-key' })`.
- Reserve `getAppState()` and `{ id: '...' }` strictly for true application-wide globals (theme, active user profile, toast notifications).

---

## 9. Watch/Bind Cleanup Confusion: Teardown vs. Unsubscribe

Both `.watch()` and `.bind()` involve two distinct cleanup concepts:
1. The **unsubscribe handle** returned by the `.watch()` / `.bind()` call itself.
2. The **per-update teardown callback** optionally returned by your handler function.

### ❌ Anti-Pattern: Wiring Up the Wrong Cleanup
```typescript
// BAD: Failing to capture the unsubscribe handle, or passing an inner teardown to onUnmounted
val.watch((v) => {
  const handler = () => doWork(v);
  window.addEventListener('resize', handler);
  // Who unsubscribes val.watch when the component unmounts? Nobody! Memory leak!
});
```

### ✅ Idiomatic Seidr: Disconnect via Returned Unsubscribe Handle
```typescript
// GOOD:
// 1. Capture the unsubscribe handle returned by .watch() / .bind()
// 2. Pass THAT handle to onUnmounted()
const unwatch = val.watch((v) => {
  const handler = () => doWork(v);
  window.addEventListener('resize', handler);

  // Return a per-update teardown: runs before NEXT update or upon unwatch
  return () => window.removeEventListener('resize', handler);
});

// Pass the unsubscribe handle so listening stops when component is unmounted
onUnmounted(unwatch);
```

---

## 10. Testing Component Re-Renders / Render Counts

In React, developers frequently track render counts (`let renderCount = 0; ... expect(renderCount).toBe(1)`) to verify that `React.memo`, `useMemo`, or hook dependencies prevent re-rendering.

### ❌ Anti-Pattern: Porting Re-Render Assertions to Seidr Tests
```typescript
// BAD: Testing whether a Seidr component re-renders when state changes
it("updates fine-grained DOM bindings reactively without component re-render", () => {
  let renderCount = 0;
  const Comp = createComponent(() => {
    renderCount++;
    const text = size.as((s) => (s ? `${s.width}x${s.height}` : "none"));
    return $div({}, [$div({ ref, id: "box" }), $div({ id: "output" }, text)]);
  });
  mount(Comp, container);
  expect(renderCount).toBe(1);

  // Asserting renderCount again after an update is completely redundant!
  state(newValue);
  expect(renderCount).toBe(1); // ❌ UNNECESSARY & CONTAMINATED
});
```

### ✅ Idiomatic Seidr: Test Only the Behavioral Contract
In Seidr, component factories **always execute exactly once** by definition. There is no re-render loop in the framework.
- Asserting `renderCount === 1` does not test your component or hook—it only restates how Seidr fundamentally works.
- When porting tests from React, **discard all re-render assertions**. Focus solely on testing:
  1. Reactive `Value` updates and derived computations.
  2. Direct DOM bindings (attributes, classes, text).
  3. Keyboard and click event handlers.
  4. Proper cleanup on element or component unmount.

