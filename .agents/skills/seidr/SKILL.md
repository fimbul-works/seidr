---
name: seidr
description: >-
  Use when developing, porting, debugging, or reviewing applications and components built with Seidr, especially when translating React patterns or porting React libraries (Radix UI, Headless UI, React Hook Form, drag-and-drop) to idiomatic Seidr.
---

# Seidr Development & React Porting Guide

Seidr is a fine-grained, reactive TypeScript UI framework featuring single-pass component execution, direct DOM bindings via callable `Value` observables, and first-class SSR hydration.

---

## The Constitution of Seidr

### 1. The Single-Pass Invariant (SolidJS-like)
A Seidr component factory function **runs exactly once** to instantiate reactive state and construct the DOM tree.
- **There is no re-render loop.** Component bodies do *not* re-execute when state or props change.
- **DOM updates are fine-grained.** Callable `Value<T>` observables wire directly to DOM attributes, text nodes, and child branches.
- **Closures do not become stale.** Functions defined inside the component factory capture persistent references, eliminating the need for `useCallback` or dependency arrays.

### 2. Map Intent, Never Translate Mechanically
React models are conditioned to replicate React's component tree and hook architecture. **Do not produce "React wearing a fake moustache."**
- Preserve the library's **observable behavioral contract** (accessibility, keyboard navigation, ARIA attributes, focus management, controlled/uncontrolled state).
- **Discard React's internal implementation details** (hooks, Context providers, VDOM workarounds, synthetic event wrappers).

### 3. Server/Client Hygiene
Seidr runs isomorphically with deterministic SSR hydration.
- Never access browser globals (`window`, `document`, `navigator`, `localStorage`) in top-level module code or component factory setup without guards.
- Use `inServer()`, `inClient()`, or defer DOM inspection to the `onMounted()` hook.

---

## Quick Mental Model Mapping

| React Pattern | Seidr Equivalent | Architectural Difference |
| :--- | :--- | :--- |
| `useState(init)` | `createValue(init)` | Callable getter/setter: `val()` to read, `val(x)` to update. Does not re-run component. |
| `useMemo(() => x, [deps])` | `val.as(fn)` or `mergeValues(fn)` | Fine-grained derived computation updating subscribers only on value changes. |
| `useEffect(fn, [deps])` | `val.watch(fn)` or `val.bind(fn)` | `.watch()` runs on change; `.bind()` runs immediately + on change. Both support teardown functions. Always pass the returned cleanup function to `onUnmounted()` hook. |
| `useCallback(fn, [deps])` | Plain function `const fn = () => ...` | Component body runs once; callbacks never need caching to retain identity. |
| `useRef(init)` | `useRef<T>()` | Decorated `Value<T \| null>` with `hydrate: false`. Assigned via `{ ref: myRef }`, inspected in `onMounted`. |
| `useContext(Ctx)` | `getAppState()` or shared `createValue({ id })` | Singletons or explicit store objects passed down or fetched by unique ID. |
| Component Lifecycles | `onMounted(cb)` / `onUnmounted(cb)` | Node or component-level attachment hooks with automatic cleanup. |
| `{cond ? <A /> : <B />}` | `Show(condVal, () => A(), () => B())` | Reactive conditional branch returning a reactive `Value<SeidrChild>`. |
| `{items.map(item => ...)}` | `List(itemsVal, keyFn, itemFactory)` | Keyed reconciliation; `itemFactory` receives `itemVal: Value<T>` for in-place item updates. |
| `JSX` / Elements | `$tag(props, children)` or `$()` | Direct DOM element builders from `@fimbul-works/seidr/html`. |

---

## 12-Step Library Porting Workflow

When porting a React library or addon (such as Radix UI, Formik, or React Beautiful DnD) to Seidr:

1. **Extract the Behavioral Contract**:
   Document the public API, keyboard shortcuts, focus management, ARIA roles, and controlled vs. uncontrolled behaviors.
2. **Strip React Machinery**:
   Identify and strip out React Context trees, custom hook chains, `forwardRef`, `cloneElement`, and dependency arrays.
3. **Model Reactive State**:
   Define internal state as `Value<T>` observables. Support controlled props using `wrapValue(props.value ?? defaultValue)`.
4. **Design the Component Signature**:
   Determine what needs to be reactive. Accept plain props for static configuration and `Value<T>` (or getter functions) for values that change over time.
5. **Construct Accessible DOM Structure**:
   Use predefined creators (`$button`, `$div`, etc.) from `@fimbul-works/seidr/html`. Bind reactive state directly to ARIA and `data-*` attributes (`aria-expanded: isOpen`, `data-state: isOpen.as(o => o ? 'open' : 'closed')`).
6. **Implement Keyboard & Event Handlers**:
   Attach standard DOM event handlers (`onclick`, `onkeydown`). Handle Escape, Arrow navigation, and Enter/Space triggers natively.
7. **Manage Imperative DOM & Focus in `onMounted`**:
   Use `useRef()` and manage autofocus, focus roving, or measurement inside `onMounted((container) => ...)`.
8. **Register Resource Cleanups**:
   Ensure all global event listeners (e.g. `window.addEventListener('keydown', ...)` or outside click detectors) return teardown functions or register with `onUnmounted()`.
9. **Eliminate Non-Existent API Inventions**:
   Never invent methods or hooks. Always verify against `references/api-cheatsheet.md`.
10. **Validate SSR Safety**:
    Check that the component can be imported and executed in a Node.js SSR context without throwing `window is not defined`.
11. **Perform React Contamination Review**:
    Execute the contamination checklist below.
12. **Add Tests & Verify**:
    Write unit tests verifying both initial rendering and reactive updates.

---

## React Contamination Review Checklist

Before finalizing any ported component or feature, verify each check:

- [ ] **No Hook Recreations**: Did you avoid writing helper functions that mimic React hooks (`useToggle`, `usePrevious`, `useEffectOnce`)?
- [ ] **No Stale Re-Render Assumptions**: Are props read inside reactive closures (`.as()`, `mergeValues()`, event listeners) rather than assuming the component factory re-runs with new props?
- [ ] **No Context Soup**: Did you avoid nesting 3 layers of Provider components just to share a boolean flag?
- [ ] **No Unused Imports**: Did you remove React-specific types (`ReactNode`, `FC`, `SyntheticEvent`)?
- [ ] **Clean DOM Binding**: Are reactive values passed directly into element props (`$button({ disabled: isDisabled })`) rather than manually toggling DOM attributes with imperative queries?
- [ ] **Accessible & Headless**: Are keyboard controls, `aria-*` attributes, and `role` attributes preserved?

---

## Reference Guides (Progressive Disclosure)

For comprehensive technical details, consult the reference guides:

* [Mental Model & SolidJS Invariants](./references/mental-model.md) — Single-pass execution, fine-grained DOM bindings, prop reactivity.
* [React to Seidr Mapping Guide](./references/react-to-seidr-mapping.md) — Exhaustive hook and pattern conversion table.
* [API Cheatsheet](./references/api-cheatsheet.md) — Verified signatures for all Seidr primitives, DOM helpers, and router tools.
* [Anti-Patterns & Traps](./references/anti-patterns.md) — Common pitfalls and prohibited architectural habits.
* [Server/Client Boundaries](./references/server-client-boundaries.md) — SSR safety, deterministic hydration IDs, and environment guards.
* [Porting Radix & Headless UI](./references/porting-radix-headless.md) — Building accessible headless primitives in Seidr.
* [Toggle Switch Port Example](./examples/toggle-switch-port.md) — Step-by-step Radix Switch port.
* [Dialog Modal Port Example](./examples/dialog-modal-port.md) — Compound Coordinator Factory with focus & escape key handling.
* [Skill Evaluation Prompts](./examples/eval-prompts.md) — Benchmark prompts to test future agents.
