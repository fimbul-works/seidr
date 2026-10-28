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

5. **Strict Two-Tier Component Model & Semantic Styling Annotations**:
   - **Strictly Two Public Tiers Only (No Tier 3)**:
     - Component packages export ONLY `<Component>`, `create<Component>`, and `types`.
     - Underlying `use<Component>` hooks and subcomponent primitives are strictly **internal implementation details**—never exported or supported for standalone consumer instantiations.
   - **Tier 1: All-in-One Component (`export const <Component> = createComponent(...)`)**:
     - Compound components must be wrapped in `createComponent(fn, "<Component>")`.
     - Single-element atoms (`Button`, `Alert`, `Badge`, `Separator`, `Skeleton`, `VisuallyHidden`) are direct element factories.
     - Exposes high-level convenience props (`label`, `description`, `errorMessage`, `indicator`, etc.) and subcomponent prop bags (`rootProps`, `controlProps`, etc.).
     - Internally instantiates `create<Component>(...)` and renders the standard composition.
   - **Tier 2: Fine-Grained Coordinator (`create<Component>`)**:
     - The single entry point for fine-grained DOM sculpting.
     - Returns `{ ...instance, Root, Control, Indicator, ... }` with pre-bound compound element helpers.
     - Pre-bound helpers use clean signatures: `(props, children) => ComponentPart({ instance, ...props }, children)` without `resolvePropsAndChildren` overhead.
   - **Internal Subcomponent Primitives (Non-Exported Implementation Details)**:
     - Standardized signature: `(props: Props<T>, children?: SeidrChild | SeidrChild[]) => SeidrElementTagNameMap[T]`.
     - Receives `instance` passed by `create<Component>` (throws `SeidrError` if missing).
   - **Semantic CSS Style System Annotations (`dataComponent` & `dataPart`)**:
     - Every element must specify `dataComponent: "<kebab-name>"` (e.g. `"button"`, `"checkbox"`, `"collapsible"`, `"form-control"`).
     - Every compound sub-element must specify `dataPart: "<kebab-part>"` (e.g. `"root"`, `"control"`, `"indicator"`, `"thumb"`, `"trigger"`, `"content"`, `"label"`, `"description"`, `"error-message"`).
     - Composed parts delegating to another primitive (e.g., `CheckboxLabel` -> `FormControlLabel`): pass `dataComponent: "checkbox"` so it overrides the delegate's default `dataComponent: "form-control"`, preserving `dataPart: "label"`.


