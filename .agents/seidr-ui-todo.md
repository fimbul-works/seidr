# Seidr UI: Radix UI Porting Roadmap & Dependency Analysis

This document provides a complete implementation roadmap for porting **Radix UI Primitives** into `@fimbul-works/seidr-ui`.

All 59 packages from Radix UI are analyzed below, strictly ordered from **simplest to most complex** while honoring all dependency requirements (every package appears **strictly after** all of its dependencies in the list).

---

## Executive Summary

| Category | Count | Status / Notes |
| :--- | :---: | :--- |
| **Total Analyzed Packages** | **59** | Complete Radix UI React primitives suite |
| **Already Implemented (in `seidr` core & `seidr-ui`)** | **7** | `accessible-icon`, `visually-hidden`, `use-previous`, `use-rect`, `use-size`, `compose-refs`, `use-layout-effect` (`useEffect`) |
| **Ready for Porting (No Portal Required)** | **37** | Overlay-independent primitives and foundational utilities |
| **Blocked by Portal Primitives** | **15** | Overlays requiring `document.body` detachment (Dialog, Popover, Menu, Select, Toast, etc.) |
| **Umbrella Barrel Package** | **1** | `radix-ui` (re-exports all primitives) |

> [!IMPORTANT]
> **Known Framework Gap: React Portal**
> Seidr currently lacks a native `<Portal>` or `createPortal()` primitive. In accordance with the Seidr Architecture Constitution:
> - **Phase 1 Priority:** Focus exclusively on the **44 portal-independent packages** (hooks, utilities, and overlay-independent components such as Switch, Checkbox, Slider, Tabs, Accordion, Collapsible, RadioGroup, Toggle, Progress, Separator, Avatar, and ScrollArea).
> - **Phase 2 (Blocked):** The **15 portal-reliant packages** (Dialog, Alert Dialog, Popover, Tooltip, Hover Card, Menu, Dropdown Menu, Context Menu, Menubar, Select, Toast, Navigation Menu, Announce, and Portal itself) require an architectural decision on DOM projection / portals in Seidr before implementation.

---

## Radix UI Packages Todo List

- [x] use-layout-effect
  - Description: Isomorphic layout effect hook. Implemented as `useEffect` in Seidr core (`packages/seidr/src/hooks/use-effect.ts`).
  - Complexity: Low (~45 LOC). Validates observable/ref dependencies, maps them to a derived Value, runs in `inClient` on `onMounted`, and chains per-update cleanup.
  - Relies on Portal: No
  - Deps:
    - None

- [ ] id
  - Description: Generates deterministic unique IDs across SSR and client hydration.
  - Complexity: Low (~20 LOC). Deterministic ID generation for SSR hydration. In Seidr, can use a module counter or deterministic hydration context.
  - Relies on Portal: No
  - Deps:
    - [x] use-layout-effect

- [x] use-previous
  - Description: Tracks and returns the previous value of a reactive state or property.
  - Complexity: Trivial (~21 LOC). Already implemented in packages/seidr-ui/src/hooks/use-previous.ts with full unit tests.
  - Relies on Portal: No
  - Deps:
    - None

- [x] use-rect
  - Description: Tracks an element bounding rect dimensions and coordinates using a shared requestAnimationFrame loop.
  - Complexity: Trivial (~28 LOC). Already implemented in packages/seidr-ui/src/hooks/use-rect.ts (ports @radix-ui/rect observeElementRect).
  - Relies on Portal: No
  - Deps:
    - [x] @radix-ui/rect (core)

- [ ] use-callback-ref
  - Description: Maintains a stable function reference across renders to avoid stale event handlers.
  - Complexity: Trivial (~34 LOC). In React, prevents stale closure traps. In Seidr, single-pass factory closures never become stale, so this hook is unnecessary.
  - Relies on Portal: No
  - Deps:
    - [x] use-layout-effect

- [ ] use-escape-keydown
  - Description: Listens for Escape keydown events with proper listener cleanup and owner-document scoping.
  - Complexity: Trivial (~30 LOC). Lightweight document keydown listener for the Escape key with cleanup.
  - Relies on Portal: No
  - Deps:
    - [ ] use-callback-ref

- [ ] use-effect-event
  - Description: Polyfills React experimental useEffectEvent for reactive callback encapsulation.
  - Complexity: Trivial (~39 LOC). Experimental React hook polyfill; unneeded in Seidr single-pass closures.
  - Relies on Portal: No
  - Deps:
    - [x] use-layout-effect

- [ ] use-is-hydrated
  - Description: Hook returning whether the component has completed hydration on the client.
  - Complexity: Trivial (~42 LOC). Tracks client-side hydration status; in Seidr, inClient() and onMounted() provide native hydration checks.
  - Relies on Portal: No
  - Deps:
    - None

- [ ] direction
  - Description: Provides and detects text reading direction (LTR vs RTL) for bidirectional layout adaptation.
  - Complexity: Low (~48 LOC). Direction provider/consumer (LTR/RTL). Can be modeled via coordinator closures or reading inherited dir attribute.
  - Relies on Portal: No
  - Deps:
    - None

- [x] use-size
  - Description: Tracks element width and height dimensions using ResizeObserver with reactive value updates.
  - Complexity: Low (~80 LOC). Already implemented in packages/seidr-ui/src/hooks/use-size.ts using ResizeObserver and Value observables.
  - Relies on Portal: No
  - Deps:
    - [x] use-layout-effect

- [x] compose-refs
  - Description: Composes multiple ref objects into a single unified composite ref.
  - Complexity: Low (~25 LOC). Implemented in Seidr core (`packages/seidr/src/hooks/compose-refs.ts`). Returns a composite Ref that synchronizes value changes across all underlying refs.
  - Relies on Portal: No
  - Deps:
    - None

- [ ] focus-guards
  - Description: Inserts hidden boundary sentinel DOM elements with tabindex=0 to constrain focus within active modals/dialogs.
  - Complexity: Low (~86 LOC). Inserts hidden boundary sentinel DOM elements with tabindex=0 before and after modals to trap focus.
  - Relies on Portal: No
  - Deps:
    - None

- [ ] use-controllable-state
  - Description: Synchronizes controlled and uncontrolled component state with change event dispatching.
  - Complexity: Moderate (~222 LOC). Manages controlled vs uncontrolled state. In Seidr, wrapValue(props.value ?? props.defaultValue) handles this cleanly.
  - Relies on Portal: No
  - Deps:
    - [ ] use-effect-event
    - [x] use-layout-effect
    - [ ] @radix-ui/primitive (core)

- [ ] context
  - Description: Scoped Context provider/consumer factory for compound component state propagation.
  - Complexity: Moderate (~232 LOC). React Context scoping utility. In Seidr, compound components use coordinator factory closures instead of Context trees.
  - Relies on Portal: No
  - Deps:
    - None

- [ ] slot
  - Description: Merges props and behavior onto an immediate child element without introducing extra DOM wrappers.
  - Complexity: Moderate (~299 LOC). React Slot / asChild props merger. In Seidr, direct DOM composition and assignProps() eliminate the need for Slot.
  - Relies on Portal: No
  - Deps:
    - [x] compose-refs

- [ ] primitive
  - Description: Base component factory and event handler composition utility (composeEventHandlers).
  - Complexity: Moderate (~127 LOC). Base element wrapper and event composer. In Seidr, direct $(tag) from @fimbul-works/seidr replace this.
  - Relies on Portal: No
  - Deps:
    - [ ] slot

- [ ] arrow
  - Description: Renders an optional SVG arrow pointing toward an anchor element for poppers and tooltips.
  - Complexity: Low (~47 LOC). Small SVG arrow component positioned alongside popper content.
  - Relies on Portal: No
  - Deps:
    - [ ] primitive

- [ ] label
  - Description: Accessible label component that prevents text selection on double-click and associates with input controls.
  - Complexity: Low (~48 LOC). Accessible label wrapper with mousedown event prevention to avoid text selection on double-click.
  - Relies on Portal: No
  - Deps:
    - [ ] primitive

- [x] visually-hidden
  - Description: Hides elements visually while keeping them accessible to screen readers and assistive tech.
  - Complexity: Low (~58 LOC). Already implemented in packages/seidr-ui/src/visually-hidden.ts with standard clip-path/off-screen CSS styles.
  - Relies on Portal: No
  - Deps:
    - [ ] primitive

- [x] accessible-icon
  - Description: Makes icons accessible by adding screen-reader labels and applying aria-hidden to SVG graphics.
  - Complexity: Low (~41 LOC). Already implemented in packages/seidr-ui/src/accessible-icon.ts with aria-hidden on SVG and visually hidden label.
  - Relies on Portal: No
  - Deps:
    - [x] visually-hidden

- [ ] aspect-ratio
  - Description: Maintains a consistent width-to-height aspect ratio for media and responsive containers.
  - Complexity: Low (~62 LOC). Container enforcing aspect ratio via padding-bottom trick or CSS aspect-ratio property.
  - Relies on Portal: No
  - Deps:
    - [ ] primitive

- [ ] separator
  - Description: Renders an accessible semantic separator element (horizontal or vertical) dividing sections of content.
  - Complexity: Low (~72 LOC). Semantic separator element rendering <hr> or <div> with role="separator" and orientation.
  - Relies on Portal: No
  - Deps:
    - [ ] primitive

- [ ] toggle
  - Description: A two-state pressed/unpressed button with aria-pressed state management.
  - Complexity: Low (~76 LOC). Two-state button with aria-pressed attribute. Controlled and uncontrolled pressed state.
  - Relies on Portal: No
  - Deps:
    - [ ] primitive
    - [ ] use-controllable-state
    - [ ] @radix-ui/primitive (core)

- [ ] progress
  - Description: Accessible progress bar indicator displaying task completion progress with min, max, and current values.
  - Complexity: Moderate (~171 LOC). Accessible progress bar with role="progressbar", aria-valuenow, min, max, and indeterminate support.
  - Relies on Portal: No
  - Deps:
    - [ ] context
    - [ ] primitive

- [ ] avatar
  - Description: An image element with customizable fallback display (initials or icon) while loading or on error.
  - Complexity: Moderate (~261 LOC). Image with fallback text/icon handling load and error states.
  - Relies on Portal: No
  - Deps:
    - [ ] context
    - [ ] primitive
    - [ ] use-callback-ref
    - [ ] use-is-hydrated
    - [x] use-layout-effect
    - [ ] @radix-ui/primitive (core)

- [ ] presence
  - Description: Manages mounting and unmounting of DOM nodes while synchronizing enter/exit CSS animations and transitions.
  - Complexity: Moderate (~306 LOC). Handles enter/exit animations and mounting/unmounting DOM elements with CSS transition/animation tracking.
  - Relies on Portal: No
  - Deps:
    - [x] use-layout-effect

- [ ] collapsible
  - Description: An expandable and collapsible section of content with animated height transitions and open/closed state.
  - Complexity: Moderate (~263 LOC). Collapsible disclosure with animated height transition, controlled/uncontrolled state, and ARIA attributes.
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Relies on Portal: No
  - Deps:
    - [x] compose-refs
    - [ ] primitive
    - [ ] use-callback-ref

- [ ] popper
  - Description: Positions floating overlay elements relative to anchor elements with collision detection and offset handling.
  - Complexity: Complex (~521 LOC). Positions floating elements relative to anchor elements. Uses @floating-ui/react-dom.
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Relies on Portal: No
  - Deps:
    - [x] compose-refs
    - [ ] primitive
    - [ ] use-callback-ref
    - [ ] use-effect-event
    - [ ] @radix-ui/primitive (core)

- [ ] form
  - Description: Accessible form primitives with real-time custom validation, error messages, and HTML5 constraint validation.
  - Complexity: Very Complex (~817 LOC). Comprehensive form validation and error message rendering integrated with HTML5 constraint validation.
  - Relies on Portal: No
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] id
    - [ ] label
    - [ ] primitive
    - [ ] @radix-ui/primitive (core)

- [ ] collection
  - Description: Registers and manages an ordered collection of DOM items for roving tabindex keyboard navigation.
  - Complexity: Very Complex (~1037 LOC). Registers and tracks an ordered collection of DOM nodes for roving tabindex and keyboard navigation.
  - Relies on Portal: No
  - Deps:
    - [x] compose-refs
    - [ ] context
    - [ ] primitive
    - [ ] slot
    - [x] use-layout-effect

- [ ] roving-focus
  - Description: Manages roving tabindex focus across collections of items with Arrow key, Home, and End navigation.
  - Complexity: Complex (~418 LOC). Manages roving tabindex focus across collections with Arrow keys, Home, End, and loop options.
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Relies on Portal: No
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
  - Complexity: Very Complex (~1239 LOC). Custom scrollbars with native physics, custom thumb dragging, track hover reveals, and scroll corner.
  - Relies on Portal: No
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
    - [ ] direction
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
    - [ ] use-escape-keydown
    - [ ] use-is-hydrated
    - [x] use-layout-effect
    - [x] use-size
    - [x] visually-hidden
    - [ ] @radix-ui/primitive (core)

---

## Portal Dependency Breakdown

### 1. Overlay-Independent Packages (Can be implemented now in Seidr) - 44 Packages

These packages do not mount DOM nodes outside their local subtree and are safe to port immediately without Portal support:

1. `use-layout-effect` (Implemented in Seidr core as `useEffect`)
2. `id`
3. `use-previous` (Implemented in `seidr-ui` with tests)
4. `use-rect` (Implemented in `seidr-ui`)
5. `use-callback-ref`
6. `use-escape-keydown`
7. `use-effect-event`
8. `use-is-hydrated`
9. `direction`
10. `use-size` (Implemented in `seidr-ui`)
11. `compose-refs` (Implemented in Seidr core)
12. `focus-guards`
13. `use-controllable-state`
14. `context`
15. `slot`
16. `primitive`
17. `arrow`
18. `label`
19. `visually-hidden` (Implemented)
20. `accessible-icon` (Implemented)
21. `aspect-ratio`
22. `separator`
23. `toggle`
24. `progress`
25. `avatar`
26. `presence`
27. `collapsible`
28. `switch`
29. `checkbox`
30. `focus-scope`
31. `popper`
32. `password-toggle-field`
33. `dismissable-layer`
34. `form`
35. `collection`
36. `roving-focus`
37. `tabs`
38. `toggle-group`
39. `toolbar`
40. `accordion`
41. `radio-group`
42. `one-time-password-field`
43. `slider`
44. `scroll-area`

---

### 2. Portal-Reliant Packages (Blocked until Portal capability exists) - 15 Packages + 1 Umbrella

These packages render overlay content directly into `document.body` or a portal host node:

| Package | Direct vs Transitive | Portal Dependency Chain |
| :--- | :--- | :--- |
| **`portal`** | Direct | Base portal primitive wrapper around `ReactDOM.createPortal` |
| **`announce`** | Direct | Uses `ReactDOM.createPortal` to inject announcements into hidden ARIA live region |
| **`hover-card`** | Direct | Depends on `portal` to float hover preview card over UI |
| **`dialog`** | Direct | Depends on `portal` for modal backdrop and content |
| **`alert-dialog`** | Transitive | Depends on `dialog` |
| **`popover`** | Direct | Depends on `portal` for popover overlay content |
| **`tooltip`** | Direct | Depends on `portal` for tooltip popups |
| **`toast`** | Direct | Depends on `portal` to project toasts into toast viewport |
| **`menu`** | Direct | Depends on `portal` for submenus and menu content |
| **`dropdown-menu`** | Transitive | Depends on `menu` |
| **`context-menu`** | Transitive | Depends on `menu` |
| **`menubar`** | Transitive | Depends on `menu` |
| **`navigation-menu`** | Direct | Uses `ReactDOM.createPortal` for indicators and viewport overlays |
| **`select`** | Direct | Depends on `portal` for dropdown option list overlay |
| **`radix-ui`** | Umbrella | Re-exports all components including all overlays |

---

## Core & External Dependencies Reference

### Radix Core Packages (`packages/core`)
- **`@radix-ui/primitive`**: Base DOM event handlers (`composeEventHandlers`). In Seidr, event listeners attach directly to DOM nodes and compose via simple functions.
- **`@radix-ui/number`**: Numeric clamping and rounding utilities used by `slider`, `scroll-area`, `select`, and `one-time-password-field`. Trivial pure math functions.
- **`@radix-ui/rect`**: Element bounding rect observation loop using `requestAnimationFrame`. **Already fully ported** into `packages/seidr-ui/src/hooks/use-rect.ts`.

### External NPM Dependencies
- **`@floating-ui/react-dom`**: Used by `popper` for anchor positioning, offset, flip, shift, and arrow calculation.
- **`aria-hidden`**: Used by `dialog`, `alert-dialog`, and `menu` to hide background document nodes from screen readers when modal is active.
- **`react-remove-scroll`**: Used by `dialog`, `alert-dialog`, and `menu` to lock background scroll while open. In Seidr, this can be handled via a clean client DOM body style coordinator or small utility.

---

## Architectural Mapping Cheatsheet (React to Seidr)

When implementing the packages above in Seidr, apply these core rules from the Seidr Constitution:

1. **No Stale Closures (Discard `useCallback` and `useCallbackRef`)**:
   In Seidr, component factories execute only once at mount time. Closures retain persistent references and never become stale.
2. **Fine-Grained Values (Discard `useState` & `useMemo`)**:
   Use `createValue(init)` for mutable state. Use `val.as(fn)` or `mergeValues(fn)` for derived state. Pass callable values directly into element attribute builders.
3. **Controlled / Uncontrolled Props (Discard `useControllableState`)**:
   Use `wrapValue(props.value ?? props.defaultValue)` to transparently bridge controlled and uncontrolled state.
4. **Compound Components (Discard React Context Trees)**:
   Do not recreate Context providers. Use instance coordinator factory closures:
   ```typescript
   export function createTabs(props: TabsProps) {
     const activeTab = wrapValue(props.value ?? props.defaultValue);
     return {
       Root: (props, children) => ...,
       List: (props, children) => ...,
       Trigger: (props, children) => ...,
       Content: (props, children) => ...,
     };
   }
   ```
5. **No Slot / `asChild` Workarounds**:
   In Seidr, you construct real DOM elements with `$button(...)` or enhance existing elements with `assignProps(el, props)` directly.
