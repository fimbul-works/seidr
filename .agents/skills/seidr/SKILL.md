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
| `useEffect(fn, [deps])` | `val.watch(fn)` or `val.bind(fn)` | `.watch()` runs on change; `.bind()` runs immediately + on change. Both return an **unsubscribe handle** to pass to `onUnmounted(unwatch)`. Handlers can also return a **per-update teardown function** run before the next invocation. |
| `useCallback(fn, [deps])` | Plain function `const fn = () => ...` | Component body runs once; callbacks never need caching to retain identity. |
| `useRef(init)` | `useRef<T>()` | Decorated `Value<T \| null>` with `hydrate: false`. Assigned via `{ ref: myRef }`, inspected in `onMounted`. |
| `useContext(Ctx)` | Coordinator factory closure, or `getAppState()` (app-wide only) | **Per-instance compound components (Dialog, Tabs, Accordion) MUST use coordinator factory closures or instance props.** Global singletons/`getAppState()` are ONLY for app-wide state (theme, auth); never put per-instance state in singletons! |
| Component Lifecycles | `onMounted(cb)` / `onUnmounted(cb)` | Node or component-level attachment hooks with automatic cleanup. |
| `{cond ? <A /> : <B />}` | `Show(condVal, () => A(), () => B())` | Reactive conditional branch returning a reactive `Value<SeidrChild>`. |
| `{items.map(item => ...)}` | `List(itemsVal, keyFn, itemFactory)` | Keyed reconciliation; `itemFactory` receives `itemVal: Value<T>` for in-place item updates. |
| `JSX` / Elements | `$tag(props, children)` or `$()` | Direct DOM element builders from `@fimbul-works/seidr/html`. |

---

## Known Framework Gaps (Do Not Invent)

Seidr is lightweight and focused. When porting libraries, be aware of features that do not yet exist in the framework:

- **Portal (`createPortal` / `<Portal>`) is NOT yet supported in Seidr.**
  Radix Dialog, Popover, Tooltip, Select, and DropdownMenu all lean on Portal in React to render content into `document.body`.
  > [!IMPORTANT]
  > **Hard Rule**: If a port requires a Portal, **STOP and report the missing capability to the user instead of improvising or hallucinating an API.** Do not invent `createPortal`, do not fake a Portal component, and do not improvise ad-hoc document body detachment hacks unless explicitly requested.
  > 
  > Focus first on overlay-independent primitives that do not require portals: **Switch, Checkbox, RadioGroup, Slider, Accordion, Tabs, Toggle, Label, Progress, Separator, Avatar, and Collapsible**.

---

## 12-Step Library Porting Workflow

When porting a React library or addon (such as Radix UI, Formik, or React Beautiful DnD) to Seidr:

1. **Extract the Behavioral Contract**:
   Document the public API, keyboard shortcuts, focus management, ARIA roles, and controlled vs. uncontrolled behaviors.
2. **Check for Known Framework Gaps**:
   Verify the component does not require unsupported primitives (e.g. Portal). If it does, stop and report.
3. **Strip React Machinery**:
   Identify and strip out React Context trees, custom hook chains, `forwardRef`, `cloneElement`, and dependency arrays.
4. **Model Reactive State**:
   Define internal state as `Value<T>` observables inside a coordinator factory. Support controlled props using `wrapValue(props.value ?? defaultValue)`.
5. **Design the Component Signature**:
   Determine what needs to be reactive. Accept plain props for static configuration and `Value<T>` (or getter functions) for values that change over time.
6. **Construct Accessible DOM Structure**:
   Use predefined creators (`$button`, `$div`, etc.) from `@fimbul-works/seidr/html`. Bind reactive state directly to ARIA and `data-*` attributes (`aria-expanded: isOpen`, `data-state: isOpen.as(o => o ? 'open' : 'closed')`).
7. **Implement Keyboard & Event Handlers**:
   Attach standard DOM event handlers (`onclick`, `onkeydown`). Handle Escape, Arrow navigation, and Enter/Space triggers natively.
8. **Manage Imperative DOM & Focus in `onMounted`**:
   Use `useRef()` and manage autofocus, focus roving, or measurement inside `onMounted((container) => ...)`.
9. **Register Resource Cleanups**:
   Ensure all watchers/bindings pass their returned unsubscribe handle to `onUnmounted(unwatch)`. Clean up global event listeners.
10. **Eliminate Non-Existent API Inventions**:
    Never invent methods, hooks, or utilities. Always verify against `references/api-cheatsheet.md`.
11. **Validate SSR Safety**:
    Check that the component can be imported and executed in a Node.js SSR context without throwing `window is not defined`. Guard browser-only logic with `inClient()` (never `inBrowser`).
12. **Add Tests & Verify in Monorepo**:
    Write unit tests verifying both initial rendering and reactive updates. Run tests with the exact workspace filter command.

---

## React Contamination Review Checklist

Before finalizing any ported component or feature, verify each check:

- [ ] **No Hook Recreations**: Did you avoid writing helper functions that mimic React hooks (`useToggle`, `usePrevious`, `useEffectOnce`)?
- [ ] **No Stale Re-Render Assumptions**: Are props read inside reactive closures (`.as()`, `mergeValues()`, event listeners) rather than assuming the component factory re-runs with new props?
- [ ] **No Context Soup or Singleton Leaks**: Did you avoid putting per-instance compound state into app-level singletons or `getAppState()`?
- [ ] **No Unused Imports**: Did you remove React-specific types (`ReactNode`, `FC`, `SyntheticEvent`)?
- [ ] **Clean DOM Binding**: Are reactive values passed directly into element props (`$button({ disabled: isDisabled })`) rather than manually toggling DOM attributes with imperative queries?
- [ ] **Accessible & Headless**: Are keyboard controls, `aria-*` attributes, and `role` attributes preserved?

---

## Monorepo Architecture & Addon Packages

Seidr is organized as a Turborepo monorepo with pnpm workspaces:
- **Core Library**: `@fimbul-works/seidr` (lives in root / `packages/core`).
- **Official Addons & Ports**: Live in `packages/<addon-name>` (e.g. `packages/primitives`, `packages/router`).

### Scaffolding a Ported Addon Package:
1. Create directory `packages/<name>/` with a standard `package.json`:
   ```json
   {
     "name": "@fimbul-works/seidr-<name>",
     "version": "1.0.0",
     "type": "module",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "dependencies": {
       "@fimbul-works/seidr": "workspace:*"
     }
   }
   ```
2. Include a `tsconfig.json` that extends the root tsconfig.
3. Write primitives in `src/` and export them from `src/index.ts`.

### Exact Build & Test Commands (Turborepo):
- **Run tests for a single package**: `pnpm turbo run test --filter=@fimbul-works/seidr-<name>`
- **Run build for a single package**: `pnpm turbo run build --filter=@fimbul-works/seidr-<name>`
- **Typecheck a single package**: `pnpm turbo run build:lib --filter=@fimbul-works/seidr-<name>`
- **Run all tests monorepo-wide**: `pnpm turbo run test`

---

## Mandatory Reference Reading (Trigger-Based)

Agents must **actively read** the relevant reference guide before executing tasks. Do not guess or assume.

- **Trigger: Before writing any code or proposing an implementation**
  👉 **MUST READ**: [API Cheatsheet](./references/api-cheatsheet.md) — Verify exact exports and signatures. Confirm `inClient` exists and `inBrowser` does not.
- **Trigger: Before any SSR-adjacent work or isomorphic handling**
  👉 **MUST READ**: [Server/Client Boundaries](./references/server-client-boundaries.md) — Environment guards, deterministic hydration IDs, and SSR safety.
- **Trigger: When porting any Radix or headless UI primitive**
  👉 **MUST READ**: [Porting Radix & Headless UI](./references/porting-radix-headless.md) and inspect the closest example:
  - [Toggle Switch Port Example](./examples/toggle-switch-port.md) (single elements, controlled/uncontrolled)
  - [Dialog Modal Port Example](./examples/dialog-modal-port.md) (compound coordinator pattern)
- **Trigger: When mapping React hooks, context, or lifecycles**
  👉 **MUST READ**: [React to Seidr Mapping Guide](./references/react-to-seidr-mapping.md) and [Mental Model & SolidJS Invariants](./references/mental-model.md).
- **Trigger: When reviewing code or debugging unexpected behavior**
  👉 **MUST READ**: [Anti-Patterns & Traps](./references/anti-patterns.md) — Check for singleton leaks, missing unwatch cleanups, and fake hooks.
- **Benchmarking & Testing the Agent**:
  👉 See [Skill Evaluation Prompts](./examples/eval-prompts.md) — Benchmark prompts to evaluate agent compliance.
