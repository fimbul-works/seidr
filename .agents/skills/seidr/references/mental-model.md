# Seidr Mental Model: Single-Pass Fine-Grained Reactivity

Seidr's execution and rendering architecture is inspired by fine-grained reactive frameworks like SolidJS. To write idiomatic Seidr code and port external libraries successfully, you must discard the React Virtual DOM re-render mental model.

---

## 1. The Single-Pass Component Lifecycle

In React, a component function is a **render loop**: it re-executes on every state change, prop change, or parent re-render.

In Seidr, a component function is a **setup factory**: it executes **exactly once**.

```typescript
import { createComponent, createValue } from '@fimbul-works/seidr';
import { $button, $div, $p } from '@fimbul-works/seidr/html';

export const Counter = createComponent(() => {
  // 1. This entire block executes ONCE during instantiation
  console.log('Counter setup runs once');

  const count = createValue(0);

  // 2. Event handlers and callbacks are permanent closures.
  // No useCallback or identity caching needed!
  const increment = () => count((c) => c + 1);

  // 3. Elements are real DOM nodes wired to signals.
  // The count observable drives DOM text directly.
  return $div({ className: 'counter' }, [
    $p({ textContent: count.as((c) => `Count is: ${c}`) }),
    $button({ textContent: 'Increment', onclick: increment })
  ]);
}, 'Counter');
```

### Consequences of Single-Pass Execution:
1. **No Stale Closures**: Handler functions always close over persistent variable references. You will never need `useCallback` or dependency arrays.
2. **No Re-render Overhead**: Updating state modifies only the specific DOM attribute or text node subscribed to that `Value`. The surrounding component is never re-run.
3. **Props Are Captured at Construction**: If you pass a plain value (e.g. `title: "Hello"`), reading `props.title` inside the factory only reads the value passed at construction time. If a prop can change over time, it must be reactive (see Section 3).
4. **Never Test for Re-renders**: In React, tests frequently assert whether a component does or does not re-render (e.g., tracking `renderCount` to verify memoization). In Seidr, this is completely unnecessary: the component factory is architecturally guaranteed to run only once. Testing render counts or asserting "without component re-render" is a category error and a sign of React mental model contamination.

---

## 2. Direct DOM Bindings vs Virtual DOM

React creates a Virtual DOM tree of plain objects on every render pass, compares it to the previous tree (diffing), and patches the real DOM.

Seidr constructs **real DOM elements immediately** using factory functions (`$()`, `$div`, `$button`, etc.) and attaches reactive listeners directly to DOM nodes:

```typescript
const isToggled = createValue(false);

// Reactive attributes:
const btn = $button({
  ariaExpanded: isToggled, // Automatically binds aria-expanded attribute
  className: isToggled.as((t) => t ? 'active' : 'inactive'),
  textContent: isToggled.as((t) => t ? 'Open' : 'Closed')
});
```

When `isToggled(true)` is called:
- Seidr's observable notifies only the attribute updater and text node updater.
- `btn.setAttribute('aria-expanded', 'true')` and class/text updates execute surgically.
- No VDOM tree is allocated; no diff algorithm runs.

---

## 3. The Props Contract & Dynamic Values

Because component factories execute once, how do child components receive dynamic data from parents?

### The Permissive Standard: `wrapValue()`
In Seidr, components standardize on accepting `T | Value<T>` for dynamic inputs, and normalizing them inside the component using `wrapValue()`:

```typescript
import { createComponent, wrapValue, type Value } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

interface BadgeProps {
  label: string | Value<string>;
  count?: number | Value<number>;
}

export const Badge = createComponent<BadgeProps>(({ label, count = 0 }) => {
  // Normalize to Value<T> regardless of whether parent passed static data or a reactive Value
  const labelVal = wrapValue(label);
  const countVal = wrapValue(count);

  return $div({ className: 'badge' }, [
    labelVal.as((l) => `${l}: `),
    countVal.as(String)
  ]);
}, 'Badge');
```

- If a consumer passes `Badge({ label: "Static" })`, `wrapValue` wraps `"Static"` into a `Value<string>`.
- If a consumer passes `Badge({ label: dynamicLabelValue })`, `wrapValue` returns the existing `Value` unchanged.
- The child component always works with reactive observables consistently.

---

## 4. Derived State (`as` vs `mergeValues`)

Derived state in Seidr does not require memoization hooks like `useMemo`. You derive values directly from existing observables:

### Single Dependency: `val.as(transformFn)`
```typescript
const count = createValue(2);
const doubled = count.as((c) => c * 2); // Derived Value<number>
```

### Multiple Dependencies: `mergeValues(computeFn, options?)`
```typescript
import { createValue, mergeValues } from '@fimbul-works/seidr';

const firstName = createValue('Ada');
const lastName = createValue('Lovelace');

const fullName = mergeValues(() => `${firstName()} ${lastName()}`);
```

> **Warning on Conditional Derivations**:
> `mergeValues` auto-tracks `Value` calls executed during its *initial* run. If your derivation contains conditional logic (`if/else` or ternary) where some values are not accessed on the first run, pass them explicitly in `options.parents`:
> ```typescript
> const display = mergeValues(
>   () => (showAdvanced() ? advancedValue() : basicValue()),
>   { parents: [showAdvanced, advancedValue, basicValue] }
> );
> ```

---

## 5. Control Flow Primitives

Never use JavaScript array `.map()` or ternary operators directly inside Seidr markup when branches or items depend on reactive values. Instead, use Seidr's fine-grained control flow:

### Boolean Conditional Content: `Show(condition, whenTrue, whenFalse?)`
```typescript
import { Show, createValue } from '@fimbul-works/seidr';
import { $p } from '@fimbul-works/seidr/html';

const isLoggedIn = createValue(false);

// Show returns a reactive Value<SeidrChild> that switches branches dynamically
const content = Show(
  isLoggedIn,
  () => $p('Welcome back!'),
  () => $p('Please sign in.')
);
```

### State-Value Conditional Content: `Switch(value, branches, fallback?)`
```typescript
import { Switch, createValue } from '@fimbul-works/seidr';
import { $p } from '@fimbul-works/seidr/html';

type Tab = 'home' | 'profile' | 'settings';

const activeTab = createValue<Tab>('home');

// Switch returns a reactive Value<SeidrChild> that switches branches dynamically
const TabContent = () => Switch(
  activeTab,
  {
    home: () => $p({ textContent: 'Welcome to the Home tab!' }),
    profile: () => $p({ textContent: 'User profile and details.' }),
    settings: () => $p({ textContent: 'Application settings.' })
  },
  () => $p({ textContent: 'Page not found.' })
);
```

### Dynamic Lists: `List(arrayValue, keyFn, itemFactory)`
```typescript
import { List, createValue, type Value } from '@fimbul-works/seidr';
import { $li } from '@fimbul-works/seidr/html';

interface Item { id: string; text: string; }
const items = createValue<Item[]>([]);

// itemFactory receives itemValue as a reactive Value<Item>!
const list = List(
  items,
  (item) => item.id,
  (itemValue: Value<Item>) => {
    return $li({ textContent: itemValue.as((i) => i.text) });
  }
);
```
With `List`, updates to an individual item's properties update *only that item's DOM node* in-place without touching other elements in the list.

### Error Boundaries: `Safe(Component, Fallback?)`
Provides isolated error containment. Catches rendering exceptions and unmount cleanups, displaying the fallback component instead of crashing the application.

### Asynchronous Boundaries: `Suspense(promise, Component)`
Manages Promise resolution, passing a reactive `SuspenseState<T>` (`{ state: 'pending' | 'resolved' | 'error', value, error }`) to the child component. Typically paired with `Switch(state, { pending, resolved, error })`.

### Dynamic Code Splitting: `lazy(importer)`
Defines asynchronous component factories imported dynamically via `import()`, loading only when mounted.
