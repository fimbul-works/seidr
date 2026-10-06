# Porting Example: Radix UI Switch Primitive

This example demonstrates how to port the `@radix-ui/react-switch` primitive to an idiomatic, accessible Seidr implementation without leaking React architecture.

---

## 1. Original React / Radix Implementation

In React, Radix implements `<Switch.Root>` and `<Switch.Thumb>` using compound components, React Context, and `useControllableState`:

```tsx
// React (Radix UI)
import * as React from 'react';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const SwitchRoot = React.forwardRef<HTMLButtonElement, SwitchProps>((props, forwardedRef) => {
  const { checked: checkedProp, defaultChecked = false, onCheckedChange, disabled, ...rest } = props;
  const [checked = false, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked,
    onChange: onCheckedChange,
  });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      ref={forwardedRef}
      onClick={(e) => {
        rest.onClick?.(e);
        if (!disabled) setChecked((prev) => !prev);
      }}
      onKeyDown={(e) => {
        rest.onKeyDown?.(e);
        if (e.key === ' ') e.preventDefault(); // Prevent page scroll on Space
      }}
      {...rest}
    />
  );
});
```

---

## 2. Idiomatic Seidr Implementation

In Seidr, we do not need forwardRef, synthetic events, or custom hook libraries. We create a coordinator/element factory that normalizes controlled and uncontrolled usage with `wrapValue()`.

```typescript
import {
  createComponent,
  onUnmounted,
  wrapValue,
  type SeidrChild,
  type SeidrElementProps,
  type Value
} from '@fimbul-works/seidr';
import { $button, $span } from '@fimbul-works/seidr/html';

export interface SwitchOptions {
  checked?: boolean | Value<boolean>;
  defaultChecked?: boolean;
  disabled?: boolean | Value<boolean>;
  onCheckedChange?: (checked: boolean) => void;
  className?: string | Value<string>;
  thumbClassName?: string | Value<string>;
}

/**
 * Creates an accessible, headless Switch primitive.
 */
export const createSwitch = (options: SwitchOptions = {}) => {
  // 1. Normalize controlled/uncontrolled state
  const isChecked = wrapValue(options.checked ?? options.defaultChecked ?? false);
  const isDisabled = wrapValue(options.disabled ?? false);

  if (options.onCheckedChange) {
    const unwatch = isChecked.watch(options.onCheckedChange);
    onUnmounted(unwatch);
  }

  const toggle = () => {
    if (!isDisabled()) {
      isChecked((prev) => !prev);
    }
  };

  // 2. Headless Thumb element
  const Thumb = (props: SeidrElementProps = {}) =>
    $span({
      ...props,
      dataState: isChecked.as((c) => (c ? 'checked' : 'unchecked')),
      dataDisabled: isDisabled.as((d) => (d ? '' : undefined)),
      className: props.className ?? options.thumbClassName ?? 'switch-thumb'
    });

  // 3. Headless Root button element
  const Root = (props: SeidrElementProps = {}, children?: SeidrChild | SeidrChild[]) =>
    $button({
      ...props,
      type: 'button',
      role: 'switch',
      disabled: isDisabled,
      ariaChecked: isChecked,
      dataState: isChecked.as((c) => (c ? 'checked' : 'unchecked')),
      dataDisabled: isDisabled.as((d) => (d ? '' : undefined)),
      className: props.className ?? options.className ?? 'switch-root',
      onclick: (e: MouseEvent) => {
        props.onclick?.(e);
        toggle();
      },
      onkeydown: (e: KeyboardEvent) => {
        props.onkeydown?.(e);
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault(); // Prevent window scrolling on Space
          toggle();
        }
      }
    }, children ?? [Thumb()]);

  return {
    isChecked,
    isDisabled,
    toggle,
    Thumb,
    Root
  };
};
```

---

## 3. Usage Example

```typescript
import { createSwitch } from './switch.js';

// Uncontrolled usage:
const simpleSwitch = createSwitch({ defaultChecked: true });
const element = simpleSwitch.Root();

// Controlled usage:
const myState = createValue(false);
const controlledSwitch = createSwitch({
  checked: myState,
  onCheckedChange: (val) => console.log('Switched:', val)
});
```

---

## 4. Contamination Review Audit

| Check | Result | Rationale |
| :--- | :--- | :--- |
| **No Hook Mimicry** | Passed | No `useControllableState` or `useCallback` helpers created. |
| **Single-Pass Invariant** | Passed | Factory runs once; closures over `isChecked` and `toggle` are stable forever. |
| **Declarative ARIA** | Passed | `ariaChecked: isChecked` binds reactively to the DOM attribute without imperative DOM calls. |
| **Zero Context Soup** | Passed | Coordinator pattern returns bound `Root` and `Thumb` directly. |
| **SSR Safe** | Passed | No browser globals accessed during module or component evaluation. |
