# Porting Radix & Headless UI Primitives to Seidr

This guide defines the architectural standards for creating accessible, unstyled, headless UI components in Seidr (e.g. for `@fimbul-works/seidr-ui`).

---

## 1. The Core Philosophy: Preserve Behavior, Not React Structure

Radix UI primitives are defined by their **behavioral contract**, not their React component tree.
- **Contract to Preserve**: WAI-ARIA compliance, keyboard navigation (Escape, Enter, Space, Arrow roving), focus management, click-outside detection, and controlled/uncontrolled state support.
- **Structure to Discard**: React Context providers, `forwardRef`, `cloneElement`, custom hook dependency arrays, and synthetic events.

---

## 2. Compound Components via Coordinator Factories

In React/Radix, compound components communicate via React Context:
```tsx
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>...</Dialog.Content>
</Dialog.Root>
```

In Seidr, use a **Coordinator Factory** (e.g. `createDialog()`). The coordinator holds the reactive state and returns tied sub-components:

```typescript
import { createValue, Show, onUnmounted, wrapValue, type SeidrChild, type Value } from '@fimbul-works/seidr';
import { $button, $div } from '@fimbul-works/seidr/html';

export interface DialogOptions {
  open?: boolean | Value<boolean>;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const createDialog = (options: DialogOptions = {}) => {
  // Controlled or uncontrolled state normalized via wrapValue:
  const isOpen = wrapValue(options.open ?? options.defaultOpen ?? false);

  if (options.onOpenChange) {
    onUnmounted(isOpen.watch(options.onOpenChange));
  }

  const toggle = () => isOpen((o) => !o);
  const open = () => isOpen(true);
  const close = () => isOpen(false);

  const Trigger = (props: Record<string, any> = {}, children?: SeidrChild | SeidrChild[]) =>
    $button({
      ...props,
      ariaHasPopup: 'dialog',
      ariaExpanded: isOpen,
      onclick: (e: MouseEvent) => {
        props.onclick?.(e);
        toggle();
      }
    }, children);

  const Content = (props: Record<string, any> = {}, children?: SeidrChild | SeidrChild[]) =>
    Show(isOpen, () =>
      $div({
        ...props,
        role: 'dialog',
        ariaModal: 'true',
        dataState: isOpen.as((o) => (o ? 'open' : 'closed'))
      }, children)
    );

  return {
    isOpen,
    open,
    close,
    toggle,
    Trigger,
    Content
  };
};
```

---

## 3. Controlled vs. Uncontrolled State Pattern

Every headless component that manages toggle, value, or selection states must support both controlled and uncontrolled usage:

```typescript
// 1. Accept T | Value<T> for controlled, and T for default/uncontrolled:
export interface PrimitiveOptions<T> {
  value?: T | Value<T>;
  defaultValue?: T;
  onValueChange?: (val: T) => void;
}

// 2. Normalize to a single Value<T> using wrapValue:
const state = wrapValue(options.value ?? options.defaultValue ?? fallbackDefault);

// 3. Attach change notification:
if (options.onValueChange) {
  onUnmounted(state.watch(options.onValueChange));
}
```

---

## 4. Keyboard Navigation & ARIA Semantics

### Key Conventions:
- **Escape Key**: Dismisses open popups/dialogs.
- **Space / Enter**: Toggles buttons, checkboxes, accordion triggers.
- **Arrow Keys**: Roves focus across lists, tabs, or menus.
- **Home / End**: Jumps to first / last focusable element in roving tablists.

### ARIA Attributes:
Always bind reactive states directly to ARIA properties:
- `ariaChecked: isChecked`
- `ariaExpanded: isOpen`
- `ariaSelected: isSelected`
- `ariaDisabled: isDisabled`
- `dataState: isChecked.as(c => c ? 'checked' : 'unchecked')`

---

## 5. Cross-Tree State via `AppState` Data API

When components across separate subtrees need to communicate without explicit prop passing, use `getAppState()`:

```typescript
import { getAppState } from '@fimbul-works/seidr';

const COMPONENT_KEY = 'seidr-ui.active-accordion';
const appState = getAppState();

if (!appState.hasData(COMPONENT_KEY)) {
  appState.setData(COMPONENT_KEY, new Map());
}
const accordionRegistry = appState.getData<Map<string, any>>(COMPONENT_KEY);
```

For state that must serialize during SSR and restore during client hydration, implement `registerDataStrategy()` on `AppState`.

---

## 6. Radix DOM Utilities & Missing Primitives

### DOM Helpers:
When porting Radix DOM utilities:
```typescript
import { getDocument, isServer } from '@fimbul-works/seidr';

// 1. getOwnerDocument:
export const getOwnerDocument = (el?: Element | null): Document => {
  return el?.ownerDocument ?? getDocument();
};

// 2. getOwnerWindow:
export const getOwnerWindow = (el?: Element | null): (Window & typeof globalThis) | null => {
  if (isServer()) return null;
  return el?.ownerDocument?.defaultView ?? window;
};

// 3. getActiveElement:
export const getActiveElement = (doc: Document = getDocument()): Element | null => {
  return doc.activeElement;
};
```

### The Portal Primitive Plan (`createPortal`):
- Simple primitives (Toggle, Switch, Checkbox, RadioGroup, Slider, Accordion) **do not require portals**. Port them first!
- Complex overlay primitives (Dialog, Popover, Tooltip) require mounting outside the parent hierarchy (e.g. into `document.body`).
- Current workaround: Attach the element to `document.body` inside `onMounted()`, and detach it inside `onUnmounted()`.
- Future core primitive: A first-class `createPortal()` DOM utility will be introduced when building overlay components.
