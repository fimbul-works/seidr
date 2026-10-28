---
name: seidr-ui-protocol
description: >-
  Use this skill whenever implementing, porting, refactoring, or reviewing components, hooks, or primitives in packages/seidr-ui. Enforces the behavior-first Kobalte analysis protocol, Seidr reactive state contracts, and forbids function-as-children anti-patterns.
---

# Seidr UI Component & Hook Protocol

This skill guides the design, analysis, and implementation of UI components and primitives in `@fimbul-works/seidr-ui` ported from Kobalte.

---

## 1. The Hard Workflow Rule: Slow Down & Align First

Before writing ANY code in `packages/seidr-ui`:

1. **Study Kobalte for Intended Behavior ONLY**:
   - Inspect the source code in `packages/seidr-ui/kobalte-packages/core/src/<component>/`.
   - Extract the pure **behavioral contract**:
     - WAI-ARIA roles, attributes, and states (e.g. `aria-pressed`, `data-disabled`).
     - Keyboard interactions and DOM event handling.
     - State transitions (e.g. idle -> loading -> loaded / error).
     - Focus management and browser event timing.
   - **Ignore SolidJS/React implementation details**:
     - JSX syntax, fragment wrappers, createSignal/createMemo/createEffect, context stacks, accessor getters, and render props belong to JSX-land and DO NOT apply to Seidr.
2. **Present Findings to the User**:
   - Clearly explain the intended behavior.
   - Summarize how SolidJS implemented it for reference.
   - Discuss how Seidr should idiomatically implement it.
3. **DO NOT CODE WITHOUT APPROVAL**:
   - Never write code until the user explicitly agrees on the behavioral model and grants permission to proceed.

---

## 2. Seidr Reactive Typing Hierarchy & Controllable Values

- **Seidr Reactive Typing Tiers**:
  - `Value<T>`: Callable dual getter/setter function for mutable state (`val()` reads, `val(newVal)` mutates).
  - `DerivedValue<T>`: Read-only derived reactive value (`.as()`, `mergeValues()`, `Show()`).
  - `ObservableValue<T>`: Union `Value<T> | DerivedValue<T>` for any reactive observable.
  - `ReactiveValue<T>`: `T | ObservableValue<T>` (scalar or observable).
- **Conversion Utilities**:
  - `wrapValue(x)`: Normalizes scalar or observable to an observable.
  - `unwrapValue(x)`: Extracts the underlying scalar from an observable or scalar.
- **Immediate vs Delayed Observers (`bind` vs `watch`)**:
  - `watch(cb)`: Runs *only* on subsequent state mutations.
  - `bind(cb)`: Runs *immediately* on registration, and on every subsequent mutation.
- **Avoid Casting with `as Value`**: Use `DerivedValue<T>` or `ObservableValue<T>`.
- **Guarded State Contract**:
  - When state updates can be blocked (e.g. `isDisabled`, `isReadOnly`):
    - Keep internal mutable state private: `state: Value<T>`.
    - **Never** expose `state` directly if external callers could mutate it.
    - Expose the value as a derived read-only value: `state.as(v => v)` (`DerivedValue<T>`).
    - Provide explicit update functions (e.g. `setIsSelected(val)`, `toggle()`) that check `isBlocked` before updating `state`.

---

## 3. Control Flow & Show Invariant

- **The Show Pattern**:
  - Always wrap the condition: `wrapValue(condition)`.
  - Always return `Show(condition, renderEl) as DerivedValue<SeidrElementTagNameMap[T] | null>`.
  - Never branch with `if (condition) return Show(...) else return $(...)`.
- **Dynamic Collections (`List`)**:
  - When collections of items are dynamic, use `List` or `ReactiveValue<T[]>` so updates are fine-grained rather than re-creating the entire list.

---

## 4. Subcomponent Integrity & Fail-Fast with `SeidrError`

- If a sub-component requires an `instance` coordinator and none is provided, throw a `SeidrError` immediately.
- Do not fall back to an uncoordinated local state unless explicitly designed for standalone operation.

---

## 5. Forbid Functions-as-Children / Mixed Render Props

- **The Problem**:
  - In Seidr, `Value<T>` and reactive child getters (`() => SeidrChild`) are functions. Both are valid `SeidrChild` nodes.
  - Allowing `children?: SeidrChild | ((state) => SeidrChild)` or checking `typeof content === "function"` misinterprets reactive child getters as render functions!
- **The Rule**:
  - Never allow functions as `children`.
  - Content must strictly accept `SeidrChild | SeidrChild[]`.
  - Avoid JSX render-prop patterns or mixing them with component children.
  - If a render-function is required for a specific prop, use a separate named prop (e.g. `RenderContent`).

---

## 6. Minimal Architecture (No Unneeded Context Stacks)

- Avoid replicating ANY  external framework fetures or bbehavior unless it is a core feature of Seidr!
  - Coordinate via props or simple state values.
  - Image example: A single `Value<ImageLoadingStatus>`, immediate fallback for SSR / timer in `inClient()`, and clean up with `onUnmounted()`.
- Observers and window/document listeners must always register cleanup via `onUnmounted(() => ...)`.
