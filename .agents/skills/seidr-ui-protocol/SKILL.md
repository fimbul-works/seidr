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

## 2. Seidr State & Controllable Value Invariants

- **`Value<T>` is a dual getter/setter FUNCTION**:
  - `const val = createValue(initial)`: reading is `val()`, updating is `val(newVal)`.
- **`useControllableValue` / `useControllableBooleanValue`**:
  - This hook simply accepts an optional default value and registers `state.watch(onChange)`.
  - It does NOT provide automatic controlled/uncontrolled state switching or guard checks.
  - It  is likely nott needed!
- **Guarded State Contract**:
  - When state updates can be blocked (e.g. `isDisabled`, `isReadOnly`):
    - Rename internal mutable state to `state: Value<T>`.
    - **Never** expose `state` directly if external callers could mutate it.
    - Expose the value as a derived read-only value: `state.as(v => v)`.
    - Provide explicit update functions (e.g. `setIsSelected(val)`, `toggle()`) that check `isBlocked` before updating `state`.

---

## 3. Forbid Functions-as-Children / Mixed Render Props

- **The Problem**:
  - In Seidr, `Value<T>` and reactive child getters (`() => SeidrChild`) are functions. Both are valid `SeidrChild` nodes.
  - Allowing `children?: SeidrChild | ((state) => SeidrChild)` or checking `typeof content === "function"` misinterprets reactive child getters as render functions!
- **The Rule**:
  - Never allow functions as `children`.
  - Content must strictly accept `SeidrChild | SeidrChild[]`.
  - Avoid JSX render-prop patterns or mixing them with component children.
  - If render-function is required for some reason, they must NEVER be mixed with normal children/props!
  - Consider using a custom `RenderContent` type for such cases (and add it to `src/types.ts`).


## 4. Minimal Architecture (No Unneeded Context Stacks)

- Avoid replicating ANY  external framework fetures or bbehavior unless it is a core feature of Seidr!
  - Coordinate via props or simple state values.
  - Image example: A single `Value<ImageLoadingStatus>`, immediate fallback for SSR / timer in `inClient()`, and clean up with `onUnmounted()`.
- Observers and window/document listeners must always register cleanup via `onUnmounted(() => ...)`.
