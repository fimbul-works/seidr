# Porting Radix & Headless UI Primitives to Seidr

This guide defines the architectural standards for creating accessible, unstyled, headless UI components in Seidr (e.g. for `@fimbul-works/seidr-ui`).

---

## 1. The Core Philosophy: Preserve Behavior, Not React Structure

Radix UI primitives are defined by their **behavioral contract**, not their React component tree.
- **Contract to Preserve**: WAI-ARIA compliance, keyboard navigation (Escape, Enter, Space, Arrow roving), focus management, click-outside detection, and controlled/uncontrolled state support.
- **Structure to Discard**: React Context providers, `forwardRef`, `cloneElement`, custom hook dependency arrays, synthetic events, and render-count/re-render test assertions (Seidr components always execute once; never test for re-renders).

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

## 5. Cross-Tree State (Global Services Only)

When true global services or top-level managers need to communicate across separate subtrees (e.g., a global toast alert queue or global modal manager), use `getAppState()`:

```typescript
import { getAppState } from '@fimbul-works/seidr';

const TOAST_KEY = 'seidr-ui.toasts';
const appState = getAppState();

if (!appState.hasData(TOAST_KEY)) {
  appState.setData(TOAST_KEY, createValue([]));
}
const toastRegistry = appState.getData<Value<ToastItem[]>>(TOAST_KEY);
```

> [!CAUTION]
> **Per-Instance State Rule**:
> NEVER use `getAppState()` or `createValue({ id })` for individual compound components (accordions, tabs, dialogs). Doing so causes instance state collisions if more than one instance exists on a page. Per-instance state belongs strictly inside coordinator factory closures.

---

## 6. Radix DOM Utilities & Known Gaps

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

### Known Framework Gap: Portal (`createPortal` / `<Portal>`)
- Radix Dialog, Popover, Tooltip, Select, and DropdownMenu all lean on Portal in React to render overlays into `document.body`.
- **Portal does NOT yet exist in Seidr.**
- **MANDATORY RULE FOR AGENTS**:
  If a requested port depends on a Portal, **STOP and report the missing capability to the user**.
  **Do NOT invent or hallucinate a `createPortal()` API.** Do not fake a Portal component, and do not improvise custom document body mutation hacks.
- **Port overlay-independent primitives first**: Focus on primitives that mount completely within their parent hierarchy:
  **Switch, Checkbox, RadioGroup, Slider, Accordion, Tabs, Toggle, Label, Progress, Separator, Avatar, and Collapsible**.

---

## 7. Monorepo Package Scaffolding & Verification

Ported primitives live in the Turborepo monorepo under `packages/`:

### 1. Package Directory Structure:
```text
packages/
└── primitives/           # or packages/<primitive-name>
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── switch/
    │   ├── accordion/
    │   └── index.ts
    └── test/
        └── switch.test.ts
```

### 2. Addon `package.json`:
```json
{
  "name": "@fimbul-works/seidr-primitives",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@fimbul-works/seidr": "workspace:*"
  }
}
```

### 3. Verification Commands:
- **Run tests for this addon**: `pnpm turbo run test --filter=@fimbul-works/seidr-primitives`
- **Build this addon**: `pnpm turbo run build --filter=@fimbul-works/seidr-primitives`
- **Typecheck this addon**: `pnpm turbo run build:lib --filter=@fimbul-works/seidr-primitives`
