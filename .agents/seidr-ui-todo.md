# Seidr UI: Radix UI Porting Roadmap & Dependency Analysis

This document provides a complete implementation roadmap for porting **Radix UI Primitives** into `@fimbul-works/seidr-ui`.

All 59 packages from Radix UI are analyzed below and partitioned into sequential implementation phases sorted strictly from **simplest to most complex**:
1. **Phase 1: Pure Foundational Primitives (No Slot, No Primitive, No Portal)** - 15 packages (hooks, utilities, and presence/direction).
2. **Phase 2: Primitives Requiring Primitive / Slot Behavior (No Portal)** - 29 packages (all element-based components and roving focus/collections).
3. **Phase 3: Overlay Primitives Requiring Portal** - 14 packages (Dialog, Popover, Menu, Select, Toast, etc.) blocked until a Portal primitive is designed.
4. **Phase 4: Umbrella Barrel Package** - 1 package (`radix-ui`).

---

## Executive Summary

| Category | Count | Status / Notes |
| :--- | :---: | :--- |
| **Total Analyzed Packages** | **59** | Complete Radix UI React primitives suite |
| **Already Implemented (in `seidr` core & `seidr-ui`)** | **9** | `accessible-icon`, `visually-hidden`, `use-previous`, `use-rect`, `use-size`, `compose-refs`, `use-layout-effect` (`useEffect`), `use-escape-keydown`, `direction` |
| **Phase 1: Pure Foundational (No Slot, No Primitive, No Portal)** | **15** | **8 remaining** (7 already implemented: `use-layout-effect`, `use-previous`, `use-rect`, `use-size`, `compose-refs`, `use-escape-keydown`, `direction`) |
| **Phase 2: Requires Primitive / Slot (No Portal)** | **29** | **27 remaining** (2 already implemented in `seidr-ui`: `visually-hidden`, `accessible-icon`) |
| **Phase 3: Blocked by Portal Primitives** | **14** | Overlays requiring `document.body` detachment (Dialog, Popover, Menu, Select, Toast, etc.) |
| **Phase 4: Umbrella Barrel Package** | **1** | `radix-ui` (re-exports all primitives) |

> [!TIP]
> **Implementation Strategy**:
> Since Radix UI's `primitive` package lists `slot` as a dependency, all packages that depend on `primitive` (or `slot`) are grouped into **Phase 2**.
> - **Phase 1 (15 packages)** contains all pure foundational hooks and utilities that are completely free of `primitive`, `slot`, and `portal` dependencies.
> - **Phase 2 (29 packages)** begins with `slot` and `primitive` so we can evaluate Seidr's DOM composition (`$(tag)` and `assignProps`) before tackling the components.

---

## Phase 1: Pure Foundational Primitives (No Slot, No Primitive, No Portal) - 15 Packages

These packages have zero dependency on `primitive`, `slot`, or `portal`:

- [x] use-layout-effect
  - Description: Isomorphic layout effect hook falling back to useEffect during SSR to suppress hydration warnings.
  - Complexity: Trivial (~15 LOC). Implemented as useEffect in Seidr core (packages/seidr/src/hooks/use-effect.ts). Validates observable/ref dependencies and runs in inClient on onMounted.

- [ ] id
  - Description: Generates deterministic unique IDs across SSR and client hydration.
  - Complexity: Low (~20 LOC). Deterministic ID generation for SSR hydration. In Seidr, createComponent handles hydration IDs; useId can be added if needed.
  - Deps:
    - [x] use-layout-effect

- [x] use-previous
  - Description: Tracks and returns the previous value of a reactive state or property.
  - Complexity: Trivial (~21 LOC). Implemented in packages/seidr-ui/src/hooks/use-previous.ts and packages/seidr/src/hooks/use-previous.ts with full unit tests.

- [x] use-rect
  - Description: Tracks an element bounding rect dimensions and coordinates using a shared requestAnimationFrame loop.
  - Complexity: Trivial (~28 LOC). Implemented in packages/seidr-ui/src/hooks/use-rect.ts (ports @radix-ui/rect observeElementRect).
  - Deps:
    - [x] @radix-ui/rect (core)

- [ ] use-callback-ref
  - Description: Maintains a stable function reference across renders to avoid stale event handlers.
  - Complexity: Trivial (~34 LOC). In React, prevents stale closure traps. In Seidr, single-pass factory closures never become stale, so this hook is unnecessary.
  - Deps:
    - [x] use-layout-effect

- [x] use-escape-keydown
  - Description: Listens for Escape keydown events with proper listener cleanup and owner-document scoping.
  - Complexity: Trivial (~30 LOC). Implemented in packages/seidr-ui/src/hooks/use-escape-keydown.ts with capture phase, ownerDocument scoping, Value reactivity, and full unit tests.
  - Deps:
    - [ ] use-callback-ref

- [ ] use-effect-event
  - Description: Polyfills React experimental useEffectEvent for reactive callback encapsulation.
  - Complexity: Trivial (~39 LOC). Superseded in Seidr by inClient / useEffect; unneeded in single-pass closures.
  - Deps:
    - [x] use-layout-effect

- [ ] use-is-hydrated
  - Description: Hook returning whether the component has completed hydration on the client.
  - Complexity: Trivial (~42 LOC). In Seidr, hydration pass is synchronous, so client hydration evaluates true directly.

- [x] direction
  - Description: Provides and detects text reading direction (LTR vs RTL) for bidirectional layout adaptation.
  - Complexity: Low (~48 LOC). Implemented in packages/seidr-ui/src/direction.ts and packages/seidr-ui/src/hooks/use-direction.ts using a global singleton Value (`{ id: "direction" }`), stack-based scoped DirectionProvider restoration, reactive localDir overrides, and full unit tests.

- [x] use-size
  - Description: Tracks element width and height dimensions using ResizeObserver with reactive value updates.
  - Complexity: Low (~80 LOC). Implemented in packages/seidr-ui/src/hooks/use-size.ts using ResizeObserver and Value observables.
  - Deps:
    - [x] use-layout-effect

- [x] compose-refs
  - Description: Composes multiple ref objects or callback functions into a single unified ref callback.
  - Complexity: Low (~63 LOC). Implemented in Seidr core (packages/seidr/src/hooks/compose-refs.ts). Returns a composite Ref that synchronizes value changes across all underlying refs.

- [ ] focus-guards
  - Description: Inserts hidden boundary sentinel DOM elements with tabindex=0 to constrain focus within active modals/dialogs.
  - Complexity: Low (~86 LOC). Inserts hidden boundary sentinel DOM elements with tabindex=0 before and after modals to trap focus.

- [ ] presence
  - Description: Manages mounting and unmounting of DOM nodes while synchronizing enter/exit CSS animations and transitions.
  - Complexity: Moderate (~306 LOC). Handles enter/exit animations and mounting/unmounting DOM elements with CSS transition/animation tracking.
  - Deps:
    - [x] use-layout-effect

- [ ] use-controllable-state
  - Description: Synchronizes controlled and uncontrolled component state with change event dispatching.
  - Complexity: Moderate (~222 LOC). Manages controlled vs uncontrolled state. In Seidr, wrapValue(props.value ?? props.defaultValue) handles this cleanly.
  - Deps:
    - [ ] use-effect-event
    - [x] use-layout-effect
    - [ ] @radix-ui/primitive (core)

- [ ] context
  - Description: Scoped Context provider/consumer factory for compound component state propagation.
  - Complexity: Moderate (~232 LOC). React Context scoping utility. In Seidr, use AppData Map<string, State> for multi-instance state or coordinator factory closures for local instances.

---

## Phase 2: Primitives Requiring Primitive / Slot Behavior (No Portal) - 29 Packages

Because Radix UI's `primitive` package depends on `slot`, all packages that build upon `primitive` or `slot` belong to this phase. They do not require Portals:

- [ ] slot
  - Description: Merges props and behavior onto an immediate child element without introducing extra DOM wrappers.
  - Complexity: Moderate (~299 LOC). React Slot / asChild props merger. Entry point for Phase 2: analyze whether components pass DOM props or component props.
  - Deps:
    - [x] compose-refs

- [ ] primitive
  - Description: Base component factory and event handler composition utility (composeEventHandlers).
  - Complexity: Moderate (~127 LOC). Base component factory and event handler composition utility. In React, depends on slot. In Seidr, direct $(tag) replaces this without needing Slot.
  - Deps:
    - [ ] slot

- [ ] arrow
  - Description: Renders an optional SVG arrow pointing toward an anchor element for poppers and tooltips.
  - Complexity: Low (~47 LOC). Small SVG arrow component positioned alongside popper content.
  - Deps:
    - [ ] primitive

- [ ] label
  - Description: Accessible label component that prevents text selection on double-click and associates with input controls.
  - Complexity: Low (~48 LOC). Accessible label wrapper with mousedown event prevention to avoid text selection on double-click.
  - Deps:
    - [ ] primitive

- [x] visually-hidden
  - Description: Hides elements visually while keeping them accessible to screen readers and assistive tech.
  - Complexity: Low (~58 LOC). Implemented in packages/seidr-ui/src/visually-hidden.ts with standard clip-path/off-screen CSS styles.
  - Deps:
    - [ ] primitive

- [x] accessible-icon
  - Description: Makes icons accessible by adding screen-reader labels and applying aria-hidden to SVG graphics.
  - Complexity: Low (~41 LOC). Implemented in packages/seidr-ui/src/accessible-icon.ts with aria-hidden on SVG and visually hidden label.
  - Deps:
    - [x] visually-hidden

- [ ] aspect-ratio
  - Description: Maintains a consistent width-to-height aspect ratio for media and responsive containers.
  - Complexity: Low (~62 LOC). Container enforcing aspect ratio via padding-bottom trick or CSS aspect-ratio property.
  - Deps:
    - [ ] primitive

- [ ] separator
  - Description: Renders an accessible semantic separator element (horizontal or vertical) dividing sections of content.
  - Complexity: Low (~72 LOC). Semantic separator element rendering <hr> or <div> with role="separator" and orientation.
  - Deps:
    - [ ] primitive

- [ ] toggle
  - Description: A two-state pressed/unpressed button with aria-pressed state management.
  - Complexity: Low (~76 LOC). Two-state button with aria-pressed attribute. Controlled and uncontrolled pressed state.
  - Deps:
    - [ ] primitive
    - [ ] use-controllable-state
    - [ ] @radix-ui/primitive (core)

- [ ] progress
  - Description: Accessible progress bar indicator displaying task completion progress with min, max, and current values.
  - Complexity: Moderate (~171 LOC). Accessible progress bar with role="progressbar", aria-valuenow, min, max, and indeterminate support.
  - Deps:
    - [ ] context
    - [ ] primitive

- [ ] avatar
  - Description: An image element with customizable fallback display (initials or icon) while loading or on error.
  - Complexity: Moderate (~261 LOC). Image with fallback text/icon handling load and error states.
  - Deps:
    - [ ] context
    - [ ] primitive
    - [ ] use-callback-ref
    - [ ] use-is-hydrated
    - [x] use-layout-effect
    - [ ] @radix-ui/primitive (core)

- [ ] collapsible
  - Description: An expandable and collapsible section of content with animated height transitions and open/closed state.
  - Complexity: Moderate (~263 LOC). Collapsible disclosure with animated height transition, controlled/uncontrolled state, and ARIA attributes.
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] id
    - [ ] presence
    - [ ] primitive
    - [ ] use-controllable-state
    - [x] use-layout-effect
    - [ ] @radix-ui/primitive (core)

- [ ] switch
  - Description: A toggle switch control allowing users to switch between checked and unchecked states with form input sync.
  - Complexity: Complex (~455 LOC). Toggle switch control with thumb, keyboard Space/Enter handling, and hidden form input synchronization.
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] primitive
    - [ ] use-controllable-state
    - [x] use-size
    - [ ] @radix-ui/primitive (core)

- [ ] checkbox
  - Description: A tri-state checkbox control supporting checked, unchecked, and indeterminate states with hidden input sync.
  - Complexity: Complex (~487 LOC). Tri-state checkbox (checked, unchecked, indeterminate) with keyboard Space toggling and hidden form input.
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] presence
    - [ ] primitive
    - [ ] use-controllable-state
    - [x] use-size
    - [ ] @radix-ui/primitive (core)

- [ ] focus-scope
  - Description: Traps focus within a container, manages Tab loop cycling, and handles initial autofocus and return focus on close.
  - Complexity: Complex (~498 LOC). Focus containment container: traps focus, loops Tab key navigation, and manages initial/return autofocus.
  - Deps:
    - [x] compose-refs
    - [ ] primitive
    - [ ] use-callback-ref

- [ ] popper
  - Description: Positions floating overlay elements relative to anchor elements with collision detection and offset handling.
  - Complexity: Complex (~521 LOC). Positions floating elements relative to anchor elements. Uses @floating-ui/react-dom.
  - Deps:
    - [ ] arrow
    - [x] compose-refs
    - [ ] context
    - [ ] primitive
    - [ ] use-callback-ref
    - [x] use-layout-effect
    - [x] use-rect
    - [x] use-size
    - [x] @radix-ui/rect (core)
    - [ ] @floating-ui/react-dom (external)

- [ ] password-toggle-field
  - Description: Password input field with built-in show/hide visibility toggle and accessible state announcements.
  - Complexity: Complex (~540 LOC). Password input with visibility toggle button and accessibility announcements.
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] id
    - [ ] primitive
    - [ ] use-controllable-state
    - [ ] use-effect-event
    - [ ] use-is-hydrated
    - [ ] @radix-ui/primitive (core)

- [ ] dismissable-layer
  - Description: Layer handling pointer clicks outside the boundary, Escape key presses, and nested layer dismiss order.
  - Complexity: Complex (~569 LOC). Layer managing Escape dismissal, outside pointer clicks, and nested layer stacking orders.
  - Deps:
    - [x] compose-refs
    - [ ] primitive
    - [ ] use-callback-ref
    - [ ] use-effect-event
    - [ ] @radix-ui/primitive (core)

- [ ] form
  - Description: Accessible form primitives with real-time custom validation, error messages, and HTML5 constraint validation.
  - Complexity: Very Complex (~817 LOC). Comprehensive form validation and error message rendering integrated with HTML5 constraint validation.
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] id
    - [ ] label
    - [ ] primitive
    - [ ] @radix-ui/primitive (core)

- [ ] collection
  - Description: Registers and manages an ordered collection of DOM items for roving tabindex keyboard navigation.
  - Complexity: Very Complex (~1037 LOC). Registers and tracks an ordered collection of DOM nodes for roving tabindex and keyboard navigation. Uses Slot in React.
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] primitive
    - [ ] slot
    - [x] use-layout-effect

- [ ] roving-focus
  - Description: Manages roving tabindex focus across collections of items with Arrow key, Home, and End navigation.
  - Complexity: Complex (~418 LOC). Manages roving tabindex focus across collections with Arrow keys, Home, End, and loop options.
  - Deps:
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] id
    - [ ] primitive
    - [ ] use-callback-ref
    - [ ] use-controllable-state
    - [ ] use-is-hydrated
    - [x] use-layout-effect
    - [ ] @radix-ui/primitive (core)

- [ ] tabs
  - Description: A set of layered sections of content (tab triggers and tab panels) displayed one at a time with keyboard activation.
  - Complexity: Moderate (~329 LOC). Tab list, tab triggers, and tab panels with roving focus, orientation, and keyboard activation.
  - Deps:
    - [ ] context
    - [ ] direction
    - [ ] id
    - [ ] presence
    - [ ] primitive
    - [ ] roving-focus
    - [ ] use-controllable-state
    - [ ] @radix-ui/primitive (core)

- [ ] toggle-group
  - Description: A group of two-state buttons functioning either as single selection (radio-like) or multiple selection.
  - Complexity: Moderate (~345 LOC). Set of toggle buttons behaving either as single selection (radio-like) or multiple selection with roving focus.
  - Deps:
    - [ ] context
    - [ ] direction
    - [ ] primitive
    - [ ] roving-focus
    - [ ] toggle
    - [ ] use-controllable-state
    - [ ] @radix-ui/primitive (core)

- [ ] toolbar
  - Description: A container for grouping interactive controls (buttons, toggles, separators) under a single roving tab stop.
  - Complexity: Moderate (~274 LOC). Toolbar container grouping interactive controls with single roving tabindex navigation.
  - Deps:
    - [ ] context
    - [ ] direction
    - [ ] primitive
    - [ ] roving-focus
    - [ ] separator
    - [ ] toggle-group
    - [ ] @radix-ui/primitive (core)

- [ ] accordion
  - Description: A vertically stacked set of interactive headings that reveal collapsible content sections with roving focus.
  - Complexity: Complex (~604 LOC). Stacked disclosure panels (single or multiple expansion) built on Collapsible with roving focus across triggers.
  - Deps:
    - [ ] collapsible
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] id
    - [ ] primitive
    - [ ] use-controllable-state
    - [ ] @radix-ui/primitive (core)

- [ ] radio-group
  - Description: A set of checkable radio buttons where only one item can be selected at a time with arrow key roving focus.
  - Complexity: Complex (~773 LOC). Radio button group with roving focus, Arrow key navigation, and form value integration.
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] presence
    - [ ] primitive
    - [ ] roving-focus
    - [ ] use-controllable-state
    - [x] use-size
    - [ ] @radix-ui/primitive (core)

- [ ] one-time-password-field
  - Description: Segmented input field for one-time passcodes (OTP) supporting pasting, auto-advancing focus, and backspace.
  - Complexity: Very Complex (~1013 LOC). Segmented OTP input with multi-box focus movement, paste handling, backspace navigation, and masking.
  - Deps:
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] primitive
    - [ ] roving-focus
    - [ ] use-controllable-state
    - [ ] use-effect-event
    - [ ] use-is-hydrated
    - [x] use-layout-effect
    - [ ] @radix-ui/number (core)
    - [ ] @radix-ui/primitive (core)

- [ ] slider
  - Description: A multi-thumb range slider supporting min, max, step increments, touch/mouse dragging, and keyboard navigation.
  - Complexity: Very Complex (~1118 LOC). Multi-thumb range slider with mouse/touch drag tracking, keyboard arrow steps, value clamping, and RTL support.
  - Deps:
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] primitive
    - [ ] use-controllable-state
    - [x] use-layout-effect
    - [x] use-size
    - [ ] @radix-ui/number (core)
    - [ ] @radix-ui/primitive (core)

- [ ] scroll-area
  - Description: Augments native browser scrolling with customizable, cross-browser styled scrollbars and hover-revealed thumbs.
  - Complexity: Very Complex (~1239 LOC). Custom scrollbars with native physics, custom thumb dragging, track hover reveals, and scroll corner. Uses Slot directly.
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] presence
    - [ ] primitive
    - [ ] slot
    - [ ] use-callback-ref
    - [x] use-layout-effect
    - [ ] @radix-ui/number (core)
    - [ ] @radix-ui/primitive (core)

---

## Phase 3: Overlay Primitives Requiring Portal - 14 Packages

These packages render overlay content into `document.body` or a portal host node and remain blocked until a Portal capability exists in Seidr:

- [ ] portal
  - Description: Renders elements into a DOM node outside the parent component tree (e.g., document.body).
  - Complexity: Low (~47 LOC). Renders DOM nodes into document.body or arbitrary container. BLOCKED: Seidr lacks Portal primitive.
  - Relies on Portal: Yes (Primitive: renders directly into document.body or custom container)
  - Deps:
    - [ ] primitive
    - [x] use-layout-effect

- [ ] announce
  - Description: Utility component to announce dynamic messages to screen readers via a portaled ARIA live region.
  - Complexity: Moderate (~254 LOC). Live region screen-reader announcer. Relies directly on ReactDOM.createPortal to portal into live region.
  - Relies on Portal: Yes (Directly invokes ReactDOM.createPortal)
  - Deps:
    - [x] compose-refs
    - [ ] primitive
    - [x] use-layout-effect

- [ ] hover-card
  - Description: Displays a floating preview card triggered when a sighted user hovers over a target link or element.
  - Complexity: Complex (~461 LOC). Popper overlay triggered on pointer hover/focus with delay timers. Relies on Portal.
  - Relies on Portal: Yes (Directly depends on @radix-ui/react-portal)
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] dismissable-layer
    - [ ] focus-scope
    - [ ] popper
    - [ ] portal
    - [ ] presence
    - [ ] primitive
    - [ ] use-controllable-state
    - [ ] @radix-ui/primitive (core)

- [ ] dialog
  - Description: A modal dialog window that overlays the primary page, locking background scroll and trapping focus.
  - Complexity: Complex (~650 LOC). Modal dialog with focus trap, backdrop, scroll lock, and portal rendering. Relies on Portal.
  - Relies on Portal: Yes (Directly depends on @radix-ui/react-portal)
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] dismissable-layer
    - [ ] focus-guards
    - [ ] focus-scope
    - [ ] id
    - [ ] portal
    - [ ] presence
    - [ ] primitive
    - [ ] slot
    - [ ] use-controllable-state
    - [x] use-layout-effect
    - [ ] @radix-ui/primitive (core)
    - [ ] aria-hidden (external)
    - [ ] react-remove-scroll (external)

- [ ] alert-dialog
  - Description: A modal confirmation dialog interrupting the user with important content that requires explicit confirmation.
  - Complexity: Moderate (~267 LOC). Confirmation modal with alertdialog role, built on Dialog. Relies on Portal via Dialog.
  - Relies on Portal: Yes (Transitive via `dialog`)
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] dialog
    - [ ] primitive
    - [ ] @radix-ui/primitive (core)

- [ ] popover
  - Description: An anchored floating overlay triggered by a button, supporting rich content, dismissable layers, and focus trap.
  - Complexity: Complex (~699 LOC). Non-modal/modal anchored popup with focus containment and dismissable layer. Relies on Portal.
  - Relies on Portal: Yes (Directly depends on @radix-ui/react-portal)
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] dismissable-layer
    - [ ] focus-guards
    - [ ] focus-scope
    - [ ] id
    - [ ] popper
    - [ ] portal
    - [ ] presence
    - [ ] primitive
    - [ ] slot
    - [ ] use-controllable-state
    - [x] use-layout-effect
    - [ ] @radix-ui/primitive (core)
    - [ ] aria-hidden (external)
    - [ ] react-remove-scroll (external)

- [ ] tooltip
  - Description: A lightweight floating popup displaying brief helper text when hovering or focusing an element.
  - Complexity: Very Complex (~832 LOC). Hover/focus informational popup with shared provider delay grouping. Relies on Portal.
  - Relies on Portal: Yes (Directly depends on @radix-ui/react-portal)
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] dismissable-layer
    - [ ] focus-scope
    - [ ] id
    - [ ] popper
    - [ ] portal
    - [ ] presence
    - [ ] primitive
    - [ ] slot
    - [ ] use-controllable-state
    - [x] use-layout-effect
    - [x] visually-hidden
    - [ ] @radix-ui/primitive (core)

- [ ] toast
  - Description: A temporary notification toast message that appears succinctly, supports swipe dismiss, and manages queue viewports.
  - Complexity: Very Complex (~1071 LOC). Toast notifications with swipe-to-dismiss, timeout pauses, and viewport queueing. Relies on Portal.
  - Relies on Portal: Yes (Directly depends on @radix-ui/react-portal)
  - Deps:
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] dismissable-layer
    - [ ] portal
    - [ ] presence
    - [ ] primitive
    - [ ] use-callback-ref
    - [ ] use-controllable-state
    - [x] use-layout-effect
    - [x] visually-hidden
    - [ ] @radix-ui/primitive (core)

- [ ] navigation-menu
  - Description: A website navigation menu supporting rich submenus, animated viewports, indicators, and hover delay grace areas.
  - Complexity: Very Complex (~1450 LOC). Navigation menu with delayed hover submenus, animated viewport, and indicator. Relies directly on createPortal.
  - Relies on Portal: Yes (Directly invokes ReactDOM.createPortal)
  - Deps:
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] dismissable-layer
    - [ ] id
    - [ ] presence
    - [ ] primitive
    - [ ] slot
    - [ ] use-callback-ref
    - [ ] use-controllable-state
    - [x] use-layout-effect
    - [x] use-previous
    - [x] visually-hidden
    - [ ] @radix-ui/primitive (core)

- [ ] menu
  - Description: Comprehensive low-level menu primitive providing submenus, roving focus, item selection, and popper positioning.
  - Complexity: Very Complex (~1498 LOC). Foundational menu primitive for submenus, keyboard navigation, roving focus, and popper anchoring. Relies on Portal.
  - Relies on Portal: Yes (Directly depends on @radix-ui/react-portal)
  - Deps:
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] dismissable-layer
    - [ ] focus-guards
    - [ ] focus-scope
    - [ ] id
    - [ ] popper
    - [ ] portal
    - [ ] presence
    - [ ] primitive
    - [ ] roving-focus
    - [ ] slot
    - [ ] use-callback-ref
    - [ ] @radix-ui/primitive (core)
    - [ ] aria-hidden (external)
    - [ ] react-remove-scroll (external)

- [ ] dropdown-menu
  - Description: A dropdown menu displaying a list of actions or submenus triggered by a button click.
  - Complexity: Complex (~589 LOC). Dropdown menu built on top of Menu primitive. Relies on Portal via Menu.
  - Relies on Portal: Yes (Transitive via `menu`)
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] id
    - [ ] menu
    - [ ] primitive
    - [ ] use-controllable-state
    - [ ] @radix-ui/primitive (core)

- [ ] context-menu
  - Description: A contextual menu triggered by right-clicking or long-pressing, positioned at the pointer coordinates.
  - Complexity: Complex (~648 LOC). Context menu triggered by right-click/long-press positioned at pointer coordinates. Relies on Portal via Menu.
  - Relies on Portal: Yes (Transitive via `menu`)
  - Deps:
    - [ ] context
    - [ ] menu
    - [ ] primitive
    - [ ] use-controllable-state
    - [ ] @radix-ui/primitive (core)

- [ ] menubar
  - Description: A persistent horizontal desktop-style menu bar offering access to grouped dropdown menus with keyboard arrows.
  - Complexity: Complex (~780 LOC). Horizontal menubar with submenus and keyboard navigation across menus. Relies on Portal via Menu.
  - Relies on Portal: Yes (Transitive via `menu`)
  - Deps:
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] id
    - [ ] menu
    - [ ] primitive
    - [ ] roving-focus
    - [ ] use-controllable-state
    - [ ] @radix-ui/primitive (core)

- [ ] select
  - Description: A full-featured select dropdown with option search/typeahead, item scrolling, custom viewports, and form integration.
  - Complexity: Very Complex (~2119 LOC). Full native-like select dropdown with viewport scrolling, typeahead, roving focus, and form input. Relies on Portal.
  - Relies on Portal: Yes (Directly depends on @radix-ui/react-portal)
  - Deps:
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] direction
    - [ ] dismissable-layer
    - [ ] focus-guards
    - [ ] focus-scope
    - [ ] id
    - [ ] popper
    - [ ] portal
    - [ ] presence
    - [ ] primitive
    - [ ] slot
    - [ ] use-callback-ref
    - [ ] use-controllable-state
    - [x] use-layout-effect
    - [x] visually-hidden
    - [ ] @radix-ui/number (core)
    - [ ] @radix-ui/primitive (core)
    - [ ] aria-hidden (external)
    - [ ] react-remove-scroll (external)

---

## Phase 4: Umbrella Barrel Package - 1 Package

- [ ] radix-ui
  - Description: The comprehensive umbrella barrel package re-exporting all Radix UI Primitives.
  - Complexity: Moderate (~139 LOC). Umbrella barrel package re-exporting all Radix Primitives.
  - Relies on Portal: Yes (Directly depends on @radix-ui/react-portal)
  - Deps:
    - [x] accessible-icon
    - [ ] accordion
    - [ ] alert-dialog
    - [ ] arrow
    - [ ] aspect-ratio
    - [ ] avatar
    - [ ] checkbox
    - [ ] collapsible
    - [ ] collection
    - [x] compose-refs
    - [ ] context
    - [ ] context-menu
    - [ ] dialog
    - [x] direction
    - [ ] dismissable-layer
    - [ ] dropdown-menu
    - [ ] focus-guards
    - [ ] focus-scope
    - [ ] form
    - [ ] hover-card
    - [ ] label
    - [ ] menu
    - [ ] menubar
    - [ ] navigation-menu
    - [ ] one-time-password-field
    - [ ] password-toggle-field
    - [ ] popover
    - [ ] popper
    - [ ] portal
    - [ ] presence
    - [ ] primitive
    - [ ] progress
    - [ ] radio-group
    - [ ] roving-focus
    - [ ] scroll-area
    - [ ] select
    - [ ] separator
    - [ ] slider
    - [ ] slot
    - [ ] switch
    - [ ] tabs
    - [ ] toast
    - [ ] toggle
    - [ ] toggle-group
    - [ ] toolbar
    - [ ] tooltip
    - [ ] use-callback-ref
    - [ ] use-controllable-state
    - [ ] use-effect-event
    - [x] use-escape-keydown
    - [ ] use-is-hydrated
    - [x] use-layout-effect
    - [x] use-size
    - [x] visually-hidden
    - [ ] @radix-ui/primitive (core)

---

## Phase Breakdown Summary

### Phase 1: Pure Foundational Primitives (15 Packages)
1. `use-layout-effect` (Implemented in Seidr core as `useEffect`)
2. `id`
3. `use-previous` (Implemented with tests)
4. `use-rect` (Implemented)
5. `use-callback-ref`
6. `use-escape-keydown` (Implemented with tests)
7. `use-effect-event`
8. `use-is-hydrated` (Won't ipmplement)
9. `direction` (Implemented with tests)
10. `use-size` (Implemented)
11. `compose-refs` (Implemented in Seidr core)
12. `focus-guards`
13. `use-controllable-state`
14. `context`
15. `presence`

### Phase 2: Primitives Requiring Primitive / Slot Behavior (29 Packages)
1. `slot`
2. `primitive`
3. `arrow`
4. `label`
5. `visually-hidden` (Implemented)
6. `accessible-icon` (Implemented)
7. `aspect-ratio`
8. `separator`
9. `toggle`
10. `progress`
11. `avatar`
12. `collapsible`
13. `switch`
14. `checkbox`
15. `focus-scope`
16. `popper`
17. `password-toggle-field`
18. `dismissable-layer`
19. `form`
20. `collection`
21. `roving-focus`
22. `tabs`
23. `toggle-group`
24. `toolbar`
25. `accordion`
26. `radio-group`
27. `one-time-password-field`
28. `slider`
29. `scroll-area`

### Phase 3: Overlay Primitives Requiring Portal (14 Packages)
1. `portal`
2. `announce`
3. `hover-card`
4. `dialog`
5. `alert-dialog`
6. `popover`
7. `tooltip`
8. `toast`
9. `navigation-menu`
10. `menu`
11. `dropdown-menu`
12. `context-menu`
13. `menubar`
14. `select`

### Phase 4: Umbrella Package (1 Package)
1. `radix-ui`

---

## Core & External Dependencies Reference

### Radix Core Packages (`packages/core`)
- **`@radix-ui/primitive`**: Base DOM event utilities (`composeEventHandlers`). In Seidr, event listeners attach directly to DOM nodes and compose via functions.
- **`@radix-ui/number`**: Numeric clamping and rounding utilities used by `slider`, `scroll-area`, `select`, and `one-time-password-field`. Trivial pure math functions.
- **`@radix-ui/rect`**: Element bounding rect observation loop using `requestAnimationFrame`. **Already fully ported** into `packages/seidr-ui/src/hooks/use-rect.ts`.

### External NPM Dependencies
- **`@floating-ui/react-dom`**: Used by `popper` for anchor positioning, offset, flip, shift, and arrow calculation.
- **`aria-hidden`**: Used by `dialog`, `alert-dialog`, and `menu` to hide background document nodes from screen readers when modal is active.
- **`react-remove-scroll`**: Used by `dialog`, `alert-dialog`, and `menu` to lock background scroll while open. In Seidr, this can be handled via a clean client DOM body style coordinator or small utility.
