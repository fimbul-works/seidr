# Porting Example: Headless Dialog / Modal Primitive

This example demonstrates how to port a complex compound component like `@radix-ui/react-dialog` to an idiomatic Seidr Coordinator Factory.

---

## 1. Architectural Strategy

A Dialog requires:
1. **Open/Close State**: Controlled or uncontrolled (`wrapValue`).
2. **Keyboard Interaction**: Pressing `Escape` closes the dialog.
3. **Focus Restoration**: Remembering the previously active trigger element and restoring focus when closed.
4. **Accessible Structure**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
5. **Backdrop & Dismissal**: Clicking outside or on the backdrop triggers close.

---

## 2. Idiomatic Seidr Implementation

```typescript
import {
  getDocument,
  inClient,
  onMounted,
  onUnmounted,
  Show,
  useRef,
  wrapValue,
  type SeidrChild,
  type SeidrElementProps,
  type Value
} from '@fimbul-works/seidr';
import { $button, $div, $h2, $p } from '@fimbul-works/seidr/html';

export interface DialogOptions {
  open?: boolean | Value<boolean>;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Creates an accessible, headless Dialog primitive.
 */
export const createDialog = (options: DialogOptions = {}) => {
  const isOpen = wrapValue(options.open ?? options.defaultOpen ?? false);

  if (options.onOpenChange) {
    onUnmounted(isOpen.watch(options.onOpenChange));
  }

  const triggerRef = useRef<HTMLButtonElement>();
  const contentRef = useRef<HTMLDivElement>();

  const open = () => isOpen(true);
  const close = () => isOpen(false);
  const toggle = () => isOpen((o) => !o);

  // 1. Escape key handler & focus restoration via .bind() lifecycle
  onUnmounted(isOpen.bind((active) => {
    if (!active) return;

    return inClient(() => {
      const doc = getDocument();
      const previousActiveElement = doc.activeElement as HTMLElement | null;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
        }
      };

      doc.addEventListener('keydown', handleKeyDown);

      // Return teardown to run when dialog closes:
      return () => {
        doc.removeEventListener('keydown', handleKeyDown);
        previousActiveElement?.focus?.();
      };
    });
  }));

  // 2. Trigger Component
  const Trigger = (props: SeidrElementProps = {}, children?: SeidrChild | SeidrChild[]) =>
    $button({
      ...props,
      type: 'button',
      ref: triggerRef,
      ariaHasPopup: 'dialog',
      ariaExpanded: isOpen,
      onclick: (e: MouseEvent) => {
        props.onclick?.(e);
        toggle();
      }
    }, children);

  // 3. Backdrop / Overlay Component
  const Overlay = (props: SeidrElementProps = {}) =>
    Show(isOpen, () =>
      $div({
        ...props,
        className: props.className ?? 'dialog-overlay',
        onclick: (e: MouseEvent) => {
          props.onclick?.(e);
          close();
        }
      })
    );

  // 4. Content / Modal Panel Component
  const Content = (props: SeidrElementProps = {}, children?: SeidrChild | SeidrChild[]) =>
    Show(isOpen, () => {
      const panel = $div({
        ...props,
        ref: contentRef,
        role: 'dialog',
        ariaModal: 'true',
        dataState: isOpen.as((o) => (o ? 'open' : 'closed')),
        className: props.className ?? 'dialog-content'
      }, children);

      // Focus first interactive element or panel on mount:
      onMounted(() => {
        inClient(() => {
          panel.focus?.();
        });
      }, panel);

      return panel;
    });

  // 5. Close Button Component
  const Close = (props: SeidrElementProps = {}, children?: SeidrChild | SeidrChild[]) =>
    $button({
      ...props,
      type: 'button',
      onclick: (e: MouseEvent) => {
        props.onclick?.(e);
        close();
      }
    }, children ?? ['Close']);

  return {
    isOpen,
    open,
    close,
    toggle,
    Trigger,
    Overlay,
    Content,
    Close
  };
};
```

---

## 3. Usage in an Application

```typescript
import { createComponent } from '@fimbul-works/seidr';
import { $div, $h2, $p } from '@fimbul-works/seidr/html';
import { createDialog } from './dialog.js';

export const UserProfileModal = createComponent(() => {
  const dialog = createDialog();

  return $div([
    dialog.Trigger({ className: 'btn-primary' }, 'Edit Profile'),
    dialog.Overlay(),
    dialog.Content([
      $h2('Edit Profile'),
      $p('Make changes to your account settings below.'),
      dialog.Close({ className: 'btn-secondary' }, 'Cancel')
    ])
  ]);
}, 'UserProfileModal');
```
