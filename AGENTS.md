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

---

## Core Reactive & Architectural Invariants in Seidr

### 2. State & Controllable Values (`Value<T>` vs React/Solid State)
- In Seidr, `Value<T>` is a dual getter/setter function (`val()` to read, `val(newVal)` to write).
- `useControllableValue` / `useControllableBooleanValue` in Seidr only provides an optional default value fallback and registers `state.watch(onChange)`. It is **not** a complex controlled-state state machine.
- **Guarded State Contract**:
  - When a hook or component needs to enforce guard conditions (e.g. `isDisabled`, `isReadOnly`):
    - Name internal mutable state `state: Value<T>`.
    - **DO NOT** expose the raw mutable `state` directly if external calls or bindings could bypass the guard conditions.
    - Expose the state property (e.g. `isSelected`) as a **derived read-only value** (e.g. `state.as(v => v)` or derived getter).
    - Provide an explicit updater function (e.g. `setIsSelected(val)`, `toggle()`) that checks the block status (`isBlocked = isReadOnly || isDisabled`) and only mutates `state` if unblocked.

### 3. FORBID Functions-as-Children / Render Props Mixed with `SeidrChild`
- In React/SolidJS, passing a function as `children` (`children(state)`) is common.
- **IN SEIDR, NEVER ACCEPT A FUNCTION AS `children` OR MIX RENDER FUNCTIONS WITH `SeidrChild` / `props`**:
  - In Seidr, `Value<T>` is a function! Reactive child getters `() => SeidrChild` are also functions and are valid `SeidrChild` elements.
  - Checking `typeof children === "function"` or allowing `((state) => SeidrChild) | SeidrChild` misclassifies reactive child getters and `Value<T>` as render props, breaking reactive runtime updates.
  - Component children must strictly be `SeidrChild | SeidrChild[]`. Avoid JSX function-as-child patterns.

### 4. Behavior First — Eliminate Unnecessary Context Stacks
- Avoid replicating complex Solid/React context hierarchies or heavy scoped API factories unless absolutely required by multi-element coordination that cannot be achieved cleanly with props.
- Keep components minimal and direct:
  - *Example (`Image`)*:
    - Main internal state: `Value<ImageLoadingStatus>` initialized to `'idle'`.
    - Fallback: Renders while image has not finished loading. If no `fallbackDelay`, render immediately (handles SSR out of the box). If `fallbackDelay`, set a timer inside `inClient()`, and clean it up in `onUnmounted()`. Wrap fallback children in Seidr's `Show`.
    - Img: Resets status on `src` change depending on whether URL exists; updates status on `onload` / `onerror`.
- Hook cleanups must be wired directly using `onUnmounted(() => ...)`.
