# Seidr UI: Kobalte Porting Roadmap & Dependency Analysis

This document provides a streamlined implementation roadmap for porting **Kobalte** (`packages/seidr-ui/kobalte-packages/core/src`) into `@fimbul-works/seidr-ui`.

Kobalte is SolidJS's headless UI foundation (used by Solid's port of `shadcn/ui`). Unlike Radix UI (which relies heavily on React's multi-pass re-render cycle, `useCallbackRef`, `useEffectEvent`, synthetic event hacks, and `asChild`/`Slot` element cloning), Kobalte is built for Solid's **single-pass reactive execution model** — which maps directly to Seidr's architecture (`createValue`, `inClient`, single-pass component closures).

---

## Strategy & Workflow Rules

### 🚨 HARD RULE: Kobalte Porting & Component Protocol
Before implementing or modifying ANYTHING for `seidr-ui`:
1. **Study Kobalte ONLY for INTENDED BEHAVIOR**:
   - Understand the behavioral contract (interactions, accessibility/WAI-ARIA roles, attributes, keyboard handling, states).
   - **Ignore SolidJS/React implementation details** (signals, JSX fragments, context trees, accessors, synthetic wrappers, render props).
2. **Explain to the USER Before Writing Code**:
   - Detail the intended behavior.
   - Summarize how SolidJS did it for context.
   - Discuss the proposed idiomatic Seidr approach.
3. **DO NOT start implementing until explicit permission is given by the user!**

### 📐 Seidr Architectural Invariants
- **Guarded State Contract (`Value<T>`)**:
  - `Value<T>` is a dual getter/setter function.
  - `useControllableValue` / `useControllableBooleanValue` only wires default values and `onChange` callbacks.
  - When enforcing guards (e.g., `isDisabled`, `isReadOnly`), keep mutable internal state private (`state: Value<T>`). Expose the value as a derived read-only value (`state.as(v => v)`), and provide explicit setter functions (`setIsSelected`, `toggle`) that verify `isBlocked` before mutating `state`.
- **NO Functions-as-Children / NO Render Props Mixed with `SeidrChild`**:
  - In Seidr, `Value<T>` and reactive child getters `() => SeidrChild` are functions, and both are valid `SeidrChild`ren.
  - Never accept a function as `children` or mix `render` functions with `SeidrChild` / `props` (e.g. `children?: SeidrChild | ((state) => SeidrChild)` or checking `typeof content === 'function'`).
  - Content must strictly be `SeidrChild | SeidrChild[]`.
- **Behavior-First / Minimal Architecture (No Unneeded Context Stacks)**:
  - Do not replicate framework context hierarchies when simple state or props suffice (e.g., `Image` only needs `Value<ImageLoadingStatus>`, an immediate fallback for SSR / timer for delay via `inClient()`, and `Show`).
- **Seidr Lifecycle Cleanup Pattern**:
  - SolidJS hooks use internal `onCleanup()`. In Seidr, all hooks must call `onUnmounted(() => ...)` directly inside the hook to clean up observers and listeners.

1. **Phase 1: Hooks Only & Clean Simplicity**:
   - Implement only the reactive hooks from `primitives`.
   - **Simplify our existing ported hooks** (`use-size`, `use-escape-keydown`, etc.): strip away the React-induced "this may change at runtime" workarounds (`requestAnimationFrame` loops, synthetic event captures, etc.).
   - **Omit `i18n` and `live-announcer`**: The app targets English; bidirectional layout checks are already served by `use-direction.ts`, and live announcer is non-essential overhead for headless accessibility core.
   - **Minimal `useColorMode`**: A simple hook exposing a `Value<'light' | 'dark' | 'system'>` that toggles a class on `document.documentElement`. CSS handles the rest.
   - **Postpone heavy `Polymorphic`**: In Seidr, component factories simply pass element props to the target element builder (`$button`, `$div`, etc.).
2. **Phase 2: Simple UI Atoms**:
   - Quick element factories (`$div`, `$button`) and light wrappers following the Behavior-First protocol.
3. **Phase 3: Complex Non-Portal Widgets (One at a Time with Discussion)**:
   - Implemented **one at a time**.
   - Strictly follow the Behavior-First protocol with prior discussion and user sign-off.
4. **Phase 4: Non-Portal Specialized Form Fields**:
   - Standalone specialized inputs (`file-field`, `time-field`, `rating`).
5. **Phase 5: Overlay Components & Portal Architecture**:
   - Solve `Portal` feature dynamics into Seidr's component rendering structure first.
   - Then implement all 13 overlay packages.
6. **Phase 6: Deferred Niche Color Suite (Backlog)**:
   - Color picker suite (7 packages) deferred to the very end as optional backlog.

---

## Executive Phasing Overview

| Phase | Category | Count | Focus & Rules |
| :---: | :--- | :---: | :--- |
| **Phase 1** | **Foundational Hooks (`primitives`) & `useColorMode`** | **1** | Only the essential hooks. Simplify over-engineered hooks. Hook cleanups via `onUnmounted()`. Omit `i18n` and `live-announcer`. |
| **Phase 2** | **Simple UI Atoms & Standalone Controls** | **10** | Quick element factories / light wrappers: `alert`, `badge`, `image`, `skeleton`, `separator`, `button`, `link`, `form-control`, `collapsible`, `toggle-button`. |
| **Phase 3** | **Intermediate Foundations & Complex Non-Portal Widgets** | **21** | **One at a time with prior discussion**: `dismissable-layer`, `selection`, `list`, `checkbox`, `switch`, `radio-group`, `segmented-control`, `text-field`, `spin-button`, `number-field`, `meter`, `progress`, `slider`, `tabs`, `accordion`, `breadcrumbs`, `pagination`, `toggle-group`, `listbox`, `popper`, `toast`. |
| **Phase 4** | **Non-Portal Specialized Form Fields** | **3** | Specialized inputs (excluding colors): `file-field`, `time-field`, `rating`. |
| **Phase 5** | **Overlay Components & Portal Architecture** | **13** | **Solve Seidr `Portal` dynamics first**, then wrap up overlays: `tooltip`, `popover`, `hover-card`, `dialog`, `alert-dialog`, `select`, `combobox`, `search`, `menu`, `dropdown-menu`, `context-menu`, `menubar`, `navigation-menu`. |
| **Phase 6** | **Deferred Color Suite (Post-Portal Backlog)** | **7** | Low priority / deferred until needed: `colors`, `color-swatch`, `color-area`, `color-slider`, `color-wheel`, `color-field`, `color-channel-field`. |

---

## Phase 1: Foundational Hooks (`primitives`) & `useColorMode`

Pure reactive hooks. Zero dependencies on other components or Portals. Cleanups are wired directly to `onUnmounted()`.

### 1. Foundational Hooks Suite
- **Location**: `kobalte-packages/core/src/primitives` (to be implemented under `packages/seidr-ui/src/hooks/`)
- **Cleanup Invariant**: All observer disconnects and window/document event listeners must call `onUnmounted(() => ...)` internally.

#### A. Refactoring & Simplifying Existing Hooks
- [x] **`use-size`** (simplify `packages/seidr-ui/src/hooks/use-size.ts`):
  - Current state: 85 LOC with `requestAnimationFrame` loops and `borderBoxSize` polyfills.
  - Target: Kobalte's clean ~45 LOC `createSize`. Direct `ResizeObserver` callback updating `{ width, height }` (or `Value<Size>`), disconnecting on `onUnmounted`.
- [x] **`use-escape-keydown`** (simplify `packages/seidr-ui/src/hooks/use-escape-keydown.ts`):
  - Current state: 100+ LOC with custom capture phases and synthetic dispatchers to guard against React stale closures.
  - Target: Kobalte's clean ~49 LOC `createEscapeKeyDown`. Direct document keydown listener, removing listener on `onUnmounted`.

#### B. Core State & Accessibility Hooks
- [x] **`use-controllable-value`** (Kobalte `createControllableSignal`):
  - Manages controlled vs uncontrolled state with `wrapValue(props.value ?? props.defaultValue)` and `onChange` callback notification (~89 LOC).
- [x] **`use-disclosure-state`** (Kobalte `createDisclosureState`):
  - Manages `isOpen`, `open()`, `close()`, `toggle()` with controlled/uncontrolled support (~60 LOC).
- [x] **`use-toggle-state`** (Kobalte `createToggleState`):
  - Boolean toggle state for switches, checkboxes, toggle buttons (`isSelected`, `toggle()`).
- [x] **`use-register-id`** (Kobalte `createRegisterId`):
  - Registers child IDs into coordinator state for ARIA labelling (~15 LOC).
- [x] **`use-tag-name`** (Kobalte `createTagName`):
  - Reactive getter returning lowercase `element.tagName` for tag-specific behavior adjustments.
- [x] **`use-form-reset-listener`** (Kobalte `createFormResetListener`):
  - Listens to parent `<form>` reset events to restore initial uncontrolled values.
- [x] **`use-transition`** (Kobalte `createTransition`):
  - Phase state machine (`beforeEnter`, `enter`, `afterEnter`, `beforeExit`, `exit`, `afterExit`) with `keepMounted` accessor and transition styling. Keeps unmounted DOM alive until exit CSS transitions finish (replaces complex React presence machines).
- [x] **`use-interact-outside`** (Kobalte `createInteractOutside`):
  - Detects pointerdown or focus events outside target container. Clean document listeners wired to `onUnmounted`.
- [x] **`use-focus-scope`** (Kobalte `createFocusScope`):
  - Traps tab focus within an active container; manages autofocus on mount/unmount.
- [x] **`use-hide-outside`** (Kobalte `createHideOutside`):
  - Sets `aria-hidden="true"` on outside sibling elements during modal mode. (Simplified: no live-announcer edge case).
- [x] **`use-collection` & `use-dom-collection`** (Kobalte `createCollection` & `createDomCollection`):
  - Item counting, sequential collection navigation, and DOM-ordered registry for roving focus collections.

### 2. `useColorMode` (Minimal Theme Hook)
- **Location**: `packages/seidr-ui/src/hooks/use-color-mode.ts`
- **Specification**: Exposes a `Value<'light' | 'dark' | 'system'>`. Changing the value toggles a `.dark` / `.light` class or `data-theme` attribute on `document.documentElement`. CSS handles the styling rules.
- **Tasks**:
  - [x] Implement `useColorMode`.

---

## Phase 2: Simple UI Atoms & Standalone Controls (10 Directories)

Fast element factories and simple wrappers.

### 3. `alert`
- **Location**: `kobalte-packages/core/src/alert`
- **Description**: Accessible alert container with `role="alert"`.
- **Complexity**: Trivial (~80 LOC).
- **Tasks**:
  - [x] Implement `Alert.Root`.

### 4. `badge`
- **Location**: `kobalte-packages/core/src/badge`
- **Description**: Lightweight badge element wrapper.
- **Complexity**: Trivial (~57 LOC).
- **Tasks**:
  - [x] Implement `Badge.Root`.

### 5. `image`
- **Location**: `kobalte-packages/core/src/image`
- **Description**: Avatar / image container with loading fallback (`onload` / `onerror`).
- **Complexity**: Low (~210 LOC).
- **Tasks**:
  - [x] Implement `Image.Root`, `Image.Img`, `Image.Fallback`.

### 6. `skeleton`
- **Location**: `kobalte-packages/core/src/skeleton`
- **Description**: Animated placeholder for loading content (`aria-busy="true"`).
- **Complexity**: Trivial (~77 LOC).
- **Tasks**:
  - [x] Implement `Skeleton.Root`.

### 7. `separator`
- **Location**: `kobalte-packages/core/src/separator`
- **Description**: Accessible horizontal or vertical divider (`role="separator"`).
- **Dependencies**: `useTagName`.
- **Complexity**: Trivial (~95 LOC).
- **Tasks**:
  - [x] Implement `Separator.Root`.

### 8. `button`
- **Location**: `kobalte-packages/core/src/button`
- **Description**: Accessible button with Space/Enter keyboard trigger when rendered as non-button element, plus disabled suppression.
- **Dependencies**: `useTagName`.
- **Complexity**: Low (~114 LOC).
- **Tasks**:
  - [x] Implement `Button.Root`.

### 9. `link`
- **Location**: `kobalte-packages/core/src/link`
- **Description**: Accessible link with keyboard activation and disabled state for non-anchor elements.
- **Dependencies**: Integrated directly into `@fimbul-works/seidr-router`'s `Link`.
- **Tasks**:
  - [x] Add accessibility features to `Link` in `seidr-router`.

### 10. `form-control`
- **Location**: `kobalte-packages/core/src/form-control`
- **Description**: Context coordinator providing automatic ID linkage (`aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-required`) and disabled/readOnly state across form components.
- **Dependencies**: `useRegisterId`.
- **Complexity**: Low to Moderate (~457 LOC). Essential backbone for all inputs!
- **Tasks**:
  - [ ] Implement `createFormControl` coordinator.
  - [ ] Implement `FormControl.Label`, `FormControl.Description`, `FormControl.ErrorMessage`.

### 11. `collapsible`
- **Location**: `kobalte-packages/core/src/collapsible`
- **Description**: Animated expandable/collapsible disclosure panel. Measures content dimensions on open/close for smooth CSS height transitions.
- **Dependencies**: `button`, `useDisclosureState`, `useRegisterId`, `useTransition`.
- **Complexity**: Low to Moderate (~375 LOC).
- **Tasks**:
  - [x] Implement `Collapsible.Root`, `Collapsible.Trigger`, `Collapsible.Content`.

### 12. `toggle-button`
- **Location**: `kobalte-packages/core/src/toggle-button`
- **Description**: Two-state toggle button with `aria-pressed="true|false"`.
- **Dependencies**: `button`, `useToggleState`.
- **Complexity**: Low (~124 LOC).
- **Tasks**:
  - [x] Implement `ToggleButton.Root`.

---

## Phase 3: Intermediate Foundations & Complex Non-Portal Widgets (21 Directories)

> [!IMPORTANT]
> **Implementation Rule for Phase 3+**:
> Implement these **one at a time**. Before starting each component, we will have a focused discussion on the best architectural approach for Seidr.

### 13. `dismissable-layer`
- **Location**: `kobalte-packages/core/src/dismissable-layer`
- **Description**: Layer stack manager for overlays and popups. Manages top-layer pointer events, outside-click detection, and Escape key dismissal.
- **Dependencies**: `useEscapeKeyDown`, `useInteractOutside`.
- **Complexity**: Moderate (~460 LOC). Clean singleton array without React synthetic event hacks.
- **Tasks**:
  - [ ] Port `layer-stack.ts`.
  - [ ] Implement `DismissableLayer`.

### 14. `selection`
- **Location**: `kobalte-packages/core/src/selection`
- **Description**: Selection engine: roving tabindex, single/multi-selection, keyboard arrow navigation (using `useDirection`), typeahead searching.
- **Dependencies**: `useControllableValue`, `useDirection`.
- **Complexity**: Moderate to High (~1,490 LOC).
- **Tasks**:
  - [ ] Port `SelectionManager` and `createMultipleSelectionState`.
  - [ ] Implement `createSelectableCollection` & `createSelectableItem`.
  - [ ] Implement `createTypeSelect` (typeahead).

### 15. `list`
- **Location**: `kobalte-packages/core/src/list`
- **Description**: Coordinates list items, roving focus, selection, and orientation. Backbone of Listbox, Tabs, Menus, Accordion.
- **Dependencies**: `createCollection`, `selection`, `useDirection`.
- **Complexity**: Moderate (~260 LOC).
- **Tasks**:
  - [ ] Implement `createListState`.
  - [ ] Implement `createSelectableList`.

### 16. `checkbox`
- **Location**: `kobalte-packages/core/src/checkbox`
- **Description**: Tri-state checkbox (`checked`, `unchecked`, `indeterminate`) with hidden form input and animated presence indicator.
- **Dependencies**: `form-control`, `useToggleState`, `useFormResetListener`, `useTransition`.
- **Complexity**: Low to Moderate (~626 LOC).
- **Tasks**:
  - [ ] Implement Checkbox parts.

### 17. `switch`
- **Location**: `kobalte-packages/core/src/switch`
- **Description**: Toggle switch (`role="switch"`) with sliding thumb.
- **Dependencies**: `form-control`, `useToggleState`, `useFormResetListener`.
- **Complexity**: Low (~567 LOC).
- **Tasks**:
  - [ ] Implement Switch parts.

### 18. `radio-group`
- **Location**: `kobalte-packages/core/src/radio-group`
- **Description**: Accessible radio group with roving keyboard focus and arrow navigation.
- **Dependencies**: `form-control`, `useControllableValue`, `useTransition`.
- **Complexity**: Moderate (~828 LOC).
- **Tasks**:
  - [ ] Implement RadioGroup parts.

### 19. `segmented-control`
- **Location**: `kobalte-packages/core/src/segmented-control`
- **Description**: Sliding pill tabs built on top of RadioGroup, calculating indicator width/offset using `useSize`.
- **Dependencies**: `useSize`, `radio-group`.
- **Complexity**: Low (~290 LOC).
- **Tasks**:
  - [ ] Implement SegmentedControl parts.

### 20. `text-field`
- **Location**: `kobalte-packages/core/src/text-field`
- **Description**: Single-line text input and auto-resizing multi-line textarea with form validation linking.
- **Dependencies**: `form-control`, `useControllableValue`, `useFormResetListener`.
- **Complexity**: Low to Moderate (~485 LOC).
- **Tasks**:
  - [ ] Implement TextField parts.

### 21. `spin-button`
- **Location**: `kobalte-packages/core/src/spin-button`
- **Description**: Low-level numeric stepper state machine (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`, Home/End/PageUp/PageDown).
- **Complexity**: Low (~145 LOC).
- **Tasks**:
  - [ ] Implement `createSpinButton`.

### 22. `number-field`
- **Location**: `kobalte-packages/core/src/number-field`
- **Description**: Full numeric input with increment/decrement buttons, min/max clamping, decimal precision.
- **Dependencies**: `button`, `form-control`, `spin-button`.
- **Complexity**: Moderate (~1,072 LOC).
- **Tasks**:
  - [ ] Implement NumberField parts.

### 23. `meter`
- **Location**: `kobalte-packages/core/src/meter`
- **Description**: Graphical display of a numeric quantity within a known range (`role="meter"`).
- **Dependencies**: `useRegisterId`.
- **Complexity**: Low (~394 LOC).
- **Tasks**:
  - [ ] Implement Meter parts.

### 24. `progress`
- **Location**: `kobalte-packages/core/src/progress`
- **Description**: Progress bar (`role="progressbar"`) supporting determinate and indeterminate animation states.
- **Dependencies**: `meter`.
- **Complexity**: Low (~418 LOC).
- **Tasks**:
  - [ ] Implement Progress parts.

### 25. `slider`
- **Location**: `kobalte-packages/core/src/slider`
- **Description**: Range slider supporting single and multi-thumb ranges, horizontal/vertical orientation, keyboard navigation, and touch dragging.
- **Dependencies**: `form-control`, `useControllableValue`, `useFormResetListener`, `useSize`, `useDirection`.
- **Complexity**: Moderate (~1,232 LOC).
- **Tasks**:
  - [ ] Implement all Slider parts.

### 26. `tabs`
- **Location**: `kobalte-packages/core/src/tabs`
- **Description**: Tabbed interface with automatic/manual activation, sliding active indicator, and presence transitions.
- **Dependencies**: `list`, `selection`, `useSize`, `useTransition`, `useDirection`.
- **Complexity**: Moderate (~694 LOC).
- **Tasks**:
  - [ ] Implement all Tabs parts.

### 27. `accordion`
- **Location**: `kobalte-packages/core/src/accordion`
- **Description**: Vertically stacked collapsible panels with single or multiple expansion modes.
- **Dependencies**: `collapsible`, `list`, `selection`.
- **Complexity**: Moderate (~460 LOC). Cleanly composes `collapsible` + `list`.
- **Tasks**:
  - [ ] Implement all Accordion parts.

### 28. `breadcrumbs`
- **Location**: `kobalte-packages/core/src/breadcrumbs`
- **Description**: Navigational trail of links (`<nav aria-label="Breadcrumbs">`).
- **Dependencies**: `link`.
- **Complexity**: Low (~215 LOC).
- **Tasks**:
  - [ ] Implement Breadcrumbs parts.

### 29. `pagination`
- **Location**: `kobalte-packages/core/src/pagination`
- **Description**: Page number navigation with automatic ellipsis collapsing and keyboard controls.
- **Dependencies**: `button`, `useControllableValue`.
- **Complexity**: Low to Moderate (~738 LOC).
- **Tasks**:
  - [ ] Implement Pagination parts.

### 30. `toggle-group`
- **Location**: `kobalte-packages/core/src/toggle-group`
- **Description**: Group of two-state buttons with single or multiple selection.
- **Dependencies**: `list`, `selection`, `tabs`, `toggle-button`.
- **Complexity**: Moderate (~436 LOC).
- **Tasks**:
  - [ ] Implement ToggleGroup parts.

### 31. `listbox`
- **Location**: `kobalte-packages/core/src/listbox`
- **Description**: Unportaled item selection list widget with keyboard navigation and grouping. Used inside Select and Combobox, but also functions standalone in regular DOM flow.
- **Dependencies**: `list`, `selection`.
- **Complexity**: Moderate (~852 LOC).
- **Tasks**:
  - [ ] Implement all Listbox parts.

### 32. `popper`
- **Location**: `kobalte-packages/core/src/popper`
- **Description**: Floating element positioning engine wrapping `@floating-ui/dom`. Handles placement (top, bottom, left, right), flip, shift, offset, and arrow math.
- **Dependencies**: `@floating-ui/dom`, `useDirection`.
- **Complexity**: Moderate (~577 LOC).
- **Tasks**:
  - [ ] Wrap `@floating-ui/dom` with reactive placement signals.
  - [ ] Implement `Popper.Root`, `Popper.Positioner`, `Popper.Arrow`.

### 33. `toast`
- **Location**: `kobalte-packages/core/src/toast`
- **Description**: Toast notification manager and queue. Includes imperative `toaster.show()`, `toaster.promise()`, auto-dismiss timers, swipe-to-dismiss gesture, and pause-on-hover.
- **Dependencies**: `button`, `dismissable-layer`, `useSize`, `useTransition`.
- **Complexity**: Moderate to High (~1,079 LOC).
- **Tasks**:
  - [ ] Implement reactive `toastStore` & imperative `toaster` API.
  - [ ] Implement `Toast.Region`, `Toast.List`, `Toast.Root`, `Toast.CloseButton`.

---

## Phase 4: Non-Portal Specialized Form Fields (3 Directories)

Non-standard specialized form components (excluding color pickers, which are deferred to Phase 6).

### 34. `file-field`
- **Location**: `kobalte-packages/core/src/file-field`
- **Description**: Drag-and-drop file upload zone and file list manager.
- **Dependencies**: `button`, `form-control`.
- **Complexity**: Low to Moderate (~570 LOC).
- **Tasks**:
  - [ ] Implement FileField parts.

### 35. `time-field`
- **Location**: `kobalte-packages/core/src/time-field`
- **Description**: Specialized time input with segmented hour, minute, and AM/PM tokens.
- **Dependencies**: `form-control`, `spin-button`.
- **Complexity**: Moderate (~750 LOC).
- **Tasks**:
  - [ ] Implement TimeField parts.

### 36. `rating`
- **Location**: `kobalte-packages/core/src/rating`
- **Description**: Star rating input with half-stars, keyboard navigation, and form validation.
- **Dependencies**: `form-control`.
- **Complexity**: Low (~469 LOC).
- **Tasks**:
  - [ ] Implement Rating parts.

---

## Phase 5: Overlay Components & Portal Architecture (13 Directories)

> [!IMPORTANT]
> **Prerequisite: Seidr `Portal` Architecture**
> In Phase 5, we will first figure out the `Portal` feature dynamics into Seidr's component rendering structure (mounting to `document.body` or target element, maintaining reactive scope, cleaning up on unmount). Once the Portal foundation is solid, we will wrap up all 13 overlay packages.

### 0. `portal` (Architectural Prerequisite)
- **Goal**: Figure out `Portal` dynamics in Seidr's single-pass rendering lifecycle.
- **Complexity**: Low (~50 LOC).
- **Tasks**:
  - [ ] Design and implement `Portal(props)` in Seidr / `seidr-ui`.

---

### 37. `tooltip`
- **Location**: `kobalte-packages/core/src/tooltip`
- **Description**: Floating tooltip triggered on hover or keyboard focus, with open/close delay, warm-up skip delay, and popper positioning.
- **Dependencies**: `portal`, `popper`, `dismissable-layer`, `useDisclosureState`, `useRegisterId`, `useTransition`.
- **Complexity**: Low to Moderate (~485 LOC).
- **Tasks**:
  - [ ] Implement Tooltip parts.

### 38. `popover`
- **Location**: `kobalte-packages/core/src/popover`
- **Description**: Floating popover anchored to a trigger element with focus trapping and outside-click dismissal.
- **Dependencies**: `portal`, `button`, `popper`, `dismissable-layer`, `useDisclosureState`, `useFocusScope`, `useTransition`.
- **Complexity**: Moderate (~626 LOC).
- **Tasks**:
  - [ ] Implement Popover parts.

### 39. `hover-card`
- **Location**: `kobalte-packages/core/src/hover-card`
- **Description**: Card preview overlay displayed when hovering over a link or element.
- **Dependencies**: `portal`, `link`, `popper`, `dismissable-layer`, `useDisclosureState`, `useTransition`.
- **Complexity**: Low to Moderate (~488 LOC).
- **Tasks**:
  - [ ] Implement HoverCard parts.

### 40. `dialog`
- **Location**: `kobalte-packages/core/src/dialog`
- **Description**: Modal dialog overlay with backdrop overlay, focus containment, body scroll locking, escape key dismissal, and outside click dismissal.
- **Dependencies**: `portal`, `button`, `dismissable-layer`, `useDisclosureState`, `useFocusScope`, `useHideOutside`, `useTransition`.
- **Complexity**: Moderate (~680 LOC). Essential backbone for modal dialogs.
- **Tasks**:
  - [ ] Implement Dialog parts.

### 41. `alert-dialog`
- **Location**: `kobalte-packages/core/src/alert-dialog`
- **Description**: Confirmation modal with `role="alertdialog"` requiring explicit user action.
- **Dependencies**: `portal`, `dialog`.
- **Complexity**: Trivial (~190 LOC). Direct thin wrapper over `dialog`.
- **Tasks**:
  - [ ] Implement AlertDialog by wrapping Dialog.

### 42. `select`
- **Location**: `kobalte-packages/core/src/select`
- **Description**: Dropdown select menu with customizable trigger, native hidden `<select>` fallback for form submission, typeahead search, popper positioning, and keyboard navigation.
- **Dependencies**: `portal`, `button`, `form-control`, `list`, `listbox`, `popper`, `dismissable-layer`, `useDisclosureState`, `useFocusScope`, `selection`, `useTransition`.
- **Complexity**: High (~1,664 LOC).
- **Tasks**:
  - [ ] Implement Select parts.

### 43. `combobox`
- **Location**: `kobalte-packages/core/src/combobox`
- **Description**: Autocomplete / searchable combobox input combining text field input with floating dropdown listbox.
- **Dependencies**: `portal`, `button`, `dismissable-layer`, `form-control`, `list`, `listbox`, `popper`, `select`, `selection`, `useTransition`.
- **Complexity**: High (~1,927 LOC).
- **Tasks**:
  - [ ] Implement Combobox parts.

### 44. `search`
- **Location**: `kobalte-packages/core/src/search`
- **Description**: Search input variant wrapping combobox with custom search query filtering.
- **Dependencies**: `portal`, `combobox`, `form-control`, `listbox`, `popper`.
- **Complexity**: Moderate (~477 LOC). Wraps Combobox.
- **Tasks**:
  - [ ] Implement Search parts.

### 45. `menu`
- **Location**: `kobalte-packages/core/src/menu`
- **Description**: Comprehensive menu system supporting submenus, checkbox items, radio groups, separators, keyboard navigation, and popper positioning.
- **Dependencies**: `portal`, `button`, `dismissable-layer`, `list`, `popper`, `useDisclosureState`, `useFocusScope`, `selection`, `useTransition`.
- **Complexity**: High (~2,168 LOC).
- **Tasks**:
  - [ ] Implement core Menu root, trigger, content, item.
  - [ ] Implement submenus (`Menu.Sub`, `Menu.SubTrigger`, `Menu.SubContent`).
  - [ ] Implement checkbox & radio items.

### 46. `dropdown-menu`
- **Location**: `kobalte-packages/core/src/dropdown-menu`
- **Description**: Standard dropdown menu button that opens a menu.
- **Dependencies**: `portal`, `menu`, `popper`, `separator`.
- **Complexity**: Low (~231 LOC). Thin wrapper around `menu`.
- **Tasks**:
  - [ ] Implement DropdownMenu parts by wrapping Menu.

### 47. `context-menu`
- **Location**: `kobalte-packages/core/src/context-menu`
- **Description**: Right-click context menu that positions the menu at pointer coordinates `(clientX, clientY)`.
- **Dependencies**: `portal`, `menu`, `popper`, `separator`.
- **Complexity**: Low to Moderate (~418 LOC). Wraps `menu` with virtual anchor coordinates.
- **Tasks**:
  - [ ] Implement ContextMenu parts.

### 48. `menubar`
- **Location**: `kobalte-packages/core/src/menubar`
- **Description**: Horizontal desktop-style menubar (File, Edit, View) coordinating multiple top-level dropdown menus with arrow key switching.
- **Dependencies**: `portal`, `menu`, `popper`, `separator`.
- **Complexity**: Moderate (~389 LOC). Coordinates top-level menu instances.
- **Tasks**:
  - [ ] Implement Menubar parts.

### 49. `navigation-menu`
- **Location**: `kobalte-packages/core/src/navigation-menu`
- **Description**: Complex site navigation menu with animated indicator, sliding viewport across submenu panels, and hover intent delay.
- **Dependencies**: `portal`, `dismissable-layer`, `menu`, `menubar`, `popper`, `separator`, `useTransition`.
- **Complexity**: High (~1,498 LOC).
- **Tasks**:
  - [ ] Implement NavigationMenu parts.

---

## Phase 6: Deferred Niche Color Suite (Post-Portal Backlog - 7 Directories)

> [!NOTE]
> These packages provide full graphical color picker controls. They are deferred to the post-portal backlog and will only be tackled if an explicit need arises.

### 50. `colors` (Math & Parser Utility)
- **Location**: `kobalte-packages/core/src/colors`
- **Description**: Color parsing and color space conversion math (RGB, HSL, HSB, HEX, alpha).
- **Complexity**: Moderate (~1,234 LOC).

### 51. `color-swatch`
- **Location**: `kobalte-packages/core/src/color-swatch`
- **Description**: Visual swatch square displaying a parsed color.
- **Dependencies**: `colors`.
- **Complexity**: Low (~112 LOC).

### 52. `color-area`
- **Location**: `kobalte-packages/core/src/color-area`
- **Description**: 2D gradient color selection surface (saturation & lightness axes).
- **Dependencies**: `colors`, `form-control`, `slider`.
- **Complexity**: Moderate (~663 LOC).

### 53. `color-slider`
- **Location**: `kobalte-packages/core/src/color-slider`
- **Description**: Gradient slider for hue, alpha, or channel values.
- **Dependencies**: `colors`, `form-control`, `slider`.
- **Complexity**: Moderate (~624 LOC).

### 54. `color-wheel`
- **Location**: `kobalte-packages/core/src/color-wheel`
- **Description**: Circular 360-degree hue angle color picker wheel.
- **Dependencies**: `colors`, `form-control`.
- **Complexity**: Moderate (~620 LOC).

### 55. `color-field`
- **Location**: `kobalte-packages/core/src/color-field`
- **Description**: Text field for hex / rgb color strings.
- **Dependencies**: `colors`, `form-control`, `text-field`.
- **Complexity**: Low (~145 LOC).

### 56. `color-channel-field`
- **Location**: `kobalte-packages/core/src/color-channel-field`
- **Description**: Numeric field for individual color channel values (R, G, B, H, S, L).
- **Dependencies**: `colors`, `form-control`, `number-field`.
- **Complexity**: Low (~158 LOC).
