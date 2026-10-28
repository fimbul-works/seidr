# Seidr Workspace Agent Guidelines

## ⚠️ HARD RULE: Seidr UI (`packages/seidr-ui`) Development Workflow

When implementing, refactoring, or porting any component, primitive, or hook for `seidr-ui`:

### 1. Slow Down & Behavior-First Alignment Protocol
- **DO NOT start implementing code immediately.**
- **Study Kobalte for Intended Behavior ONLY**:
  - Study the corresponding Kobalte component/hook source solely to understand the **intended behavioral contract** (user interactions, accessibility/WAI-ARIA roles, attributes, keyboard navigation, state transitions).
  - **IGNORE the SolidJS/React implementation details!** SolidJS/JSX patterns (signals, contexts, memos, synthetic wrappers, component hierarchies) do not matter because Seidr operates on a fundamentally different reactive paradigm (`createValue`, `Value<T>` closures, `$button` / `$div` DOM factories, `Show`, etc.).
- **Communicate Before Coding**:
  - Explain to the user **EXACTLY** what the intended behavior is.
  - Summarize how SolidJS handled it (as reference/context only).
  - Propose the cleanest, most idiomatic Seidr approach.
- **WAIT FOR USER APPROVAL**:
  - **NEVER** begin writing code until the user has confirmed the behavior and granted permission to proceed.

### 2. Strict Two-Tier Component Model & Semantic CSS Annotations (`dataComponent` & `dataPart`)
- **Strictly Two Public Tiers Only (No Tier 3)**:
  - Component packages export ONLY `<Component>`, `create<Component>`, and `types`.
  - Underlying `use<Component>` hooks and raw subcomponent files are strictly **internal implementation details**—never exported or supported for standalone consumer instantiations.
- **Tier 1: All-in-One Component (`export const <Component> = createComponent(...)`)**:
  - Compound components must be wrapped in `createComponent(fn, "<Component>")`.
  - Single-element atoms (`Button`, `Alert`, `Badge`, `Separator`, `Skeleton`, `VisuallyHidden`) remain raw element factories.
  - Exposes high-level convenience props (`label`, `description`, `errorMessage`, `indicator`, etc.) alongside sub-part prop bags (`rootProps`, `controlProps`, `inputProps`, etc.).
  - Internally instantiates `create<Component>(...)` and renders the default composition tree.
- **Tier 2: Fine-Grained Coordinator (`create<Component>`)**:
  - The single entry point for fine-grained DOM sculpting.
  - Returns `{ ...instance, Root, Control, Indicator, ... }` with pre-bound compound element helpers.
  - Pre-bound helpers use clean signatures: `(props, children) => ComponentPart({ instance, ...props }, children)`.
- **Internal Subcomponent Primitives (Non-Exported Implementation Details)**:
  - Take `(props: Props<T>, children?: SeidrChild | SeidrChild[]) => SeidrElementTagNameMap[T]`.
  - Expect an internal `instance` coordinator passed by `create<Component>` (throws `SeidrError` if missing).
- **Semantic CSS Style System Annotations**:
  - Every component element MUST provide `dataComponent: "<kebab-name>"` (`data-component="..."` in DOM).
  - Every compound sub-element MUST provide `dataPart: "<kebab-part>"` (`data-part="..."` in DOM).
  - For delegating sub-components (e.g. `CheckboxLabel` -> `FormControlLabel`):
    - Forward `dataComponent: "checkbox"` so it overrides the underlying default `dataComponent: "form-control"` via props spreading, while preserving `dataPart: "label"`.


---


## Top Foundational Rules & Architectural Invariants in Seidr

### Rule 1: Single-Pass Component Execution (No Re-Render Loops)
- **The Invariant**: Components in Seidr are initialization factories that execute **exactly once** (`createComponent()`). There is NO virtual DOM, NO component re-render cycle, and NO hook re-execution loop.
- **Why It Matters**: Variables, closures, and DOM elements created in a component body exist permanently for the life of that component instance. State changes do not re-run the component factory; they update DOM nodes directly via fine-grained reactive listeners.
- **Reference Docs**: [docs/components.md](file:///home/claus/code/TypeScript/seidr/docs/components.md#createcomponent), [docs/presence-and-transitions.md](file:///home/claus/code/TypeScript/seidr/docs/presence-and-transitions.md#4-current-state-of-seidr-core)

### Rule 2: Seidr Reactive Typing Hierarchy (`Value`, `DerivedValue`, `ObservableValue`, `ReactiveValue`)
- **The Invariant**: Reactive state in Seidr consists of distinct typing tiers:
  - `Value<T>`: Callable dual getter-setter function for mutable state (`val()` reads, `val(newVal)` and `val(prevVal => newVal)` mutates).
  - `DerivedValue<T>`: Read-only reactive value produced by derivations (`source.as(...)`, `mergeValues(...)`, `Show(...)`).
  - `ObservableValue<T>`: Union `Value<T> | DerivedValue<T>` for any reactive observable.
  - `ReactiveValue<T>`: `T | ObservableValue<T>` representing either a raw unwrapped scalar or an observable.
- **Conversion Utilities**:
  - `wrapValue(x)`: Normalizes `ReactiveValue<T>` into an `ObservableValue<T>` (creates a `Value<T>` if given a raw scalar, or preserves existing observables).
  - `unwrapValue(x)`: Extracts the underlying scalar `T` whether `x` is raw or observable.
- **Immediate vs Delayed Observers (`bind` vs `watch`)**:
  - `.watch(callback)`: Executes *only* on subsequent state mutations.
  - `.bind(callback)`: Executes *immediately* upon registration with the current value, and then on every subsequent mutation.
- **Avoid Casting with `as Value`**: Never cast derived values as mutable `Value<T>` or `as any`. Use `DerivedValue<T>` or `ObservableValue<T>`.
- **The Function-Children Trap**: Because `Value<T>` *is a function*, using `typeof x === "function"` or typing `children?: SeidrChild | ((state) => SeidrChild)` creates severe bugs by misclassifying reactive values and reactive child getters (`() => SeidrChild`) as render props.
- **Use Type Guards**: Use `isValue(x)` from `@fimbul-works/seidr` to verify reactive values.
- **FORBID Mixed Render Props**: Never accept a function as `children` or mix render-props with standard `SeidrChild | SeidrChild[]`. If a custom render function is strictly required, use a separate named prop with a distinct type (e.g. `RenderContent`).
- **Reference Docs**: [docs/Value.md](file:///home/claus/code/TypeScript/seidr/docs/Value.md#createvalue), [docs/type-guards.md](file:///home/claus/code/TypeScript/seidr/docs/type-guards.md#isvalue)

### Rule 3: Automatic Component Scope Cleanup vs. Manual Unwatch
- **The Invariant**: When `.watch()` or `.bind()` is called *inside* an active component factory, Seidr automatically registers its teardown with that component's `onUnmounted` lifecycle.
- **When `onUnmounted` is Required**: Only call explicit `onUnmounted(() => ...)` for non-reactive external resources (native `window.addEventListener`, `setInterval`, `ResizeObserver`, WebSocket connections).
- **Outside Components (Tests/Global)**: Subscriptions live indefinitely until manually stopped by calling the returned `unwatch()` / `unbind()` or calling `.destroy()` on the `Value`.
- **Reference Docs**: [docs/Value.md](file:///home/claus/code/TypeScript/seidr/docs/Value.md#automatic-scope-cleanup-vs-manual-unwatch), [docs/components.md](file:///home/claus/code/TypeScript/seidr/docs/components.md#onunmounted)

### Rule 4: Fine-Grained Reactive DOM Data-Binding via `$()` and HTML Helpers
- **The Invariant**: Passing an `ObservableValue<T>` directly as an attribute property (e.g. `disabled: isDisabled`, `className: clsValue`) or child into `$()` / `$button()` / `$div()` binds reactively to that exact attribute or text node.
- **Why It Matters**: Updates bypass parent and sibling elements completely. There is no diffing overhead; only the targeted DOM attribute or text node mutates.
- **Reference Docs**: [docs/DOM.md](file:///home/claus/code/TypeScript/seidr/docs/DOM.md#--create-dom-elements), [docs/Value.md](file:///home/claus/code/TypeScript/seidr/docs/Value.md#automatic-dom-data-binding)

### Rule 5: Derivations (`.as()`) vs Multi-Source (`mergeValues`) & The Conditional Branch Trap
- **The Invariant**: Use `source.as(v => transform(v))` for single-source derivations. Use `mergeValues(() => a() + b())` for multi-source derivations.
- **The Conditional Trap**: `mergeValues` only auto-discovers dependencies read on its **initial execution**. If it contains conditional branches (`if (cond()) x() else y()`), observables in untaken branches will *not* be tracked. In such cases, you **must** supply explicit parents: `mergeValues(fn, { parents: [cond, x, y] })`.
- **Reference Docs**: [docs/Value.md](file:///home/claus/code/TypeScript/seidr/docs/Value.md#as), [docs/Value.md](file:///home/claus/code/TypeScript/seidr/docs/Value.md#mergevalues)

### Rule 6: Control Flow (`Show`, `Switch`, `List`) Returns Derived Reactive Values
- **The Invariant**: `Show(condition, whenTrue, whenFalse)` and `Switch(value, branches, fallback)` are not compiler macros; they return a `DerivedValue<SeidrChild | null>`.
- **The Show Pattern**: Always wrap conditions into an observable (`wrapValue(condition)`) and return `Show(condition, renderEl) as DerivedValue<SeidrElementTagNameMap[T] | null>`. Never branch with `if (condition) return Show(...) else return $(...)`.
- **Composition**: They can be embedded directly in child arrays: `$div([ Show(isOpen, () => $p('Open')) ])`.
- **List Fine-Grained Reactivity**: `List(items, getKey, (itemVal, key) => ...)` provides an `itemVal: ObservableValue<T>` to each item factory. Mutating an item in place updates only that item's DOM bindings without re-rendering the list. When item collections can change dynamically, use `List` or `ReactiveValue<T[]>`.
- **Reference Docs**: [docs/Show.md](file:///home/claus/code/TypeScript/seidr/docs/Show.md), [docs/Switch.md](file:///home/claus/code/TypeScript/seidr/docs/Switch.md), [docs/List.md](file:///home/claus/code/TypeScript/seidr/docs/List.md)

### Rule 7: Element References (`createRef`) & Document Attachment Timing
- **The Invariant**: `createRef<T>()` creates a decorated `Ref<T>` with SSR hydration disabled. Pass it to the `ref` prop: `$input({ ref: inputRef })`.
- **Attachment Timing**: While Seidr sets the ref on element creation and resets it to `null` on unmount, the node is **only guaranteed to be attached to the document DOM tree inside `onMounted()`**. Measuring layout geometry (`getBoundingClientRect`), focusing elements, or initializing canvas contexts must be done inside `onMounted()`.
- **Reference Docs**: [docs/DOM.md](file:///home/claus/code/TypeScript/seidr/docs/DOM.md#element-references-createref), [docs/components.md](file:///home/claus/code/TypeScript/seidr/docs/components.md#onmounted)

### Rule 8: Guarded State Pattern & Subcomponent Integrity
- **Guarded State Invariant**: When state transitions can be blocked (e.g. `isDisabled`, `isReadOnly`), never expose the raw mutable `state: Value<T>` directly to consumers.
  1. Internal mutable state: `const state = createValue(initial)`.
  2. Exposed value: derived read-only `state.as(v => v)` (`DerivedValue<T>`).
  3. Exposed updater: explicit function `setIsSelected(val)` or `toggle()` checking `isBlocked = isReadOnly || isDisabled` before calling `state(val)`.
- **Fail-Fast with `SeidrError`**: Sub-components that require an `instance` coordinator (e.g. `Image.Fallback`, `RadioGroup.ItemInput`, `Collapsible.Content`, `FormControl.ErrorMessage`) MUST throw a clear `SeidrError` if the required instance is missing, rather than silently continuing with broken state.
- **Note on `useControllableValue`**: In Seidr, this hook only provides default value fallbacks and an `onChange` watcher—it does not manage complex controlled state transitions, and is often unnecessary.
- **Reference Docs**: [docs/Value.md](file:///home/claus/code/TypeScript/seidr/docs/Value.md#as)

### Rule 9: Dual-Mode Environment Boundaries (`isClient`, `inClient`, `inServer`)
- **The Invariant**: Seidr components run isomorphically on both server (SSR) and client.
- **Environment Isolation**:
  - `inClient(() => ...)` runs exclusively in the browser. Wrap all browser-only globals (`window`, `document`, timers, `localStorage`, `ResizeObserver`) here.
  - `inServer(async () => ...)` runs exclusively during SSR. `renderToString()` automatically awaits returned Promises before emitting static HTML.
- **SSR Fallbacks**: Immediate fallbacks cover SSR out of the box; delayed fallbacks setup their timers inside `inClient()`.
- **Reference Docs**: [docs/SSR.md](file:///home/claus/code/TypeScript/seidr/docs/SSR.md#isclient-inclient-isserver-inserver)

### Rule 10: Deterministic IDs & Context Management (`AppState`)
- **The Invariant**: `createValue(init, { id: '...' })` acts as a **singleton** within the active `AppState`. Calling `createValue` with an existing `id` returns the existing instance rather than creating a new one.
- **SSR Lock-Step Hydration**: Values created inside components automatically get deterministic sequence IDs (`1-1`, `1-2`) based on the component's hierarchical ID.
- **Global Values**: Creating Values outside of components during SSR without explicit IDs warns in development because it risks hydration mismatches.
- **Reference Docs**: [docs/AppState.md](file:///home/claus/code/TypeScript/seidr/docs/AppState.md), [docs/Value.md](file:///home/claus/code/TypeScript/seidr/docs/Value.md#valueoptions), [docs/SSR.md](file:///home/claus/code/TypeScript/seidr/docs/SSR.md#architecture-lock-step-hydration)

### Rule 11: Synchronous Unmount Engine & Exit Animations
- **The Invariant**: Seidr's reactive node remover synchronously tears down components and removes DOM nodes when a condition becomes falsy.
- **Do NOT Replicate React `usePresence`**: Multi-pass presence hooks that abuse re-renders are fundamentally incompatible with Seidr's single-pass model.
- **Idiomatic Approach**: For animated reveals and hides, prefer modern CSS transitions with `@starting-style` and `transition-behavior: allow-discrete` (toggling `hidden` and `data-state`), or a dedicated reactive coordinator component (`AnimatedShow`).
- **Reference Docs**: [docs/presence-and-transitions.md](file:///home/claus/code/TypeScript/seidr/docs/presence-and-transitions.md#5-architectural-approaches-for-seidr)

### Rule 12: Minimal Architecture (No Unneeded Context Stacks)
- **The Invariant**: Avoid replicating ANY external framework features or complex context hierarchies unless it is a core, unavoidable requirement.
- Coordinate directly via props, derived values, or minimal element factories.
- **Reference Docs**: [docs/components.md](file:///home/claus/code/TypeScript/seidr/docs/components.md)
