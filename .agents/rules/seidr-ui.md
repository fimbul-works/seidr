# Seidr UI Rules & Guidelines

## ⚠️ HARD RULE: Kobalte Porting & Component Implementation Workflow

Before implementing, refactoring, or porting any component, primitive, or hook for `packages/seidr-ui`:

1. **Slow Down & Behavior-First Protocol**:
   - **DO NOT** begin writing or refactoring implementation code right away.
   - **Study Kobalte for Intended Behavior**: Inspect Kobalte source code solely to extract the component's **behavioral contract** (accessibility roles, keyboard navigation, state transitions, user interaction, lifecycle).
   - **Ignore SolidJS/React Implementation Details**: Signals, JSX fragments, context trees, accessors, synthetic event hacks, and render props do not map to Seidr and must be discarded.
   - **Explain to the User Before Writing Code**:
     - Explain clearly what the intended behavior is.
     - Summarize how SolidJS implemented it for reference.
     - Discuss how to implement it cleanly using Seidr's reactive model.
   - **WAIT FOR PERMISSION**: Do not start implementing until the user gives explicit approval.

2. **State & Controllable Values**:
   - In Seidr, `Value<T>` is a dual getter/setter function.
   - `useControllableValue` / `useControllableBooleanValue` only wires up optional default values and an `onChange` watcher.
   - **Guarded State**: When enforcing constraints (e.g. `isDisabled`, `isReadOnly`), keep mutable internal state private (`state: Value<T>`). Expose the value as a derived read-only `Value` (`state.as(v => v)`), and provide explicit setter functions (`setIsSelected`, `toggle`) that verify `isBlocked` before mutating `state`.

3. **No Functions as Children / No Mixed Render Props**:
   - In Seidr, `Value<T>` and reactive child getters `() => SeidrChild` are functions, and both are valid `SeidrChild`ren.
   - Mixing render props with children (e.g. `children?: SeidrChild | ((state) => SeidrChild)` or checking `typeof content === 'function'`) misclassifies reactive getters and breaks Seidr reactivity.
   - Avoid JSX function-as-child patterns. Component content must strictly be `SeidrChild | SeidrChild[]`.

4. **Minimal Architecture (No Unneeded Context Stacks)**:
   - Focus on DOM behavior rather than porting complex framework context hierarchies.
   - Clean up listeners and observers directly with `onUnmounted(() => ...)`.
