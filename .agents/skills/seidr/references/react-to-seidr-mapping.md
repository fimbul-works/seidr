# React to Seidr Mapping Guide

This guide maps common React hooks, patterns, and component conventions to their idiomatic Seidr equivalents.

> **CRITICAL RULE**: Map the **intent** of the code, not its syntax. Never mechanically convert React abstractions into fake Seidr hooks.

---

## Hooks & State Equivalents

### 1. `useState` ➔ `createValue`

```typescript
// --- React ---
const [open, setOpen] = useState(false);
const toggle = () => setOpen((prev) => !prev);

// --- Seidr ---
import { createValue } from '@fimbul-works/seidr';

const open = createValue(false);
const toggle = () => open((prev) => !prev);

// Reading:
console.log(open());
// Writing:
open(true);
```

### 2. `useMemo` ➔ `.as()` or `mergeValues()`

In Seidr, derived state is computed reactively and updates fine-grained subscribers automatically.

```typescript
// --- React ---
const doubleCount = useMemo(() => count * 2, [count]);
const fullName = useMemo(() => `${first} ${last}`, [first, last]);

// --- Seidr ---
import { mergeValues } from '@fimbul-works/seidr';

// Single dependency:
const doubleCount = count.as((c) => c * 2);

// Multiple dependencies:
const fullName = mergeValues(() => `${first()} ${last()}`);

// CONDITIONAL logic requires EXPLICIT parents:
const titleAndLastName = mergeValues(() => title().length ? `${title()}. ${last()}` : last(), { parents: [title, last] });
```

### 3. `useEffect` ➔ `.watch()`, `.bind()`, or `onMounted()`

In React, `useEffect` serves multiple distinct purposes. In Seidr, choose based on intent:

| React Intent | Seidr Primitive | Why |
| :--- | :--- | :--- |
| Run side-effect when a value changes | `value.watch((newVal, prevVal) => { ... })` | Does not run on setup; runs on subsequent value updates. Teardown function supported. Always pass the returned cleanup function to `onUnmounted()` hook! |
| Run side-effect immediately and on subsequent changes | `value.bind((currentVal) => { ... })` | Runs once immediately, then on every change. Teardown function supported. Always pass the returned cleanup function to `onUnmounted()` hook! |
| Run side-effect once when DOM element attaches | `onMounted((container) => { ... })` | Guarantees element is attached to DOM. |
| Run cleanup when component detaches | `onUnmounted(() => { ... })` | Cancels timers, listeners, subscriptions. |

```typescript
// --- React: Syncing with external event listener ---
useEffect(() => {
  if (!active) return;
  const onKey = (e) => { ... };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [active]);

// --- Seidr: .bind() handles immediate check + subscription lifecycle ---
// Always pass the returned cleanup function to `onUnmounted()` hook!
onUnmounted(active.bind((isActive) => {
  if (!isActive) return;
  const onKey = (e: KeyboardEvent) => { ... };
  window.addEventListener('keydown', onKey);
  // Teardown is called before next change and when active is destroyed
  return () => window.removeEventListener('keydown', onKey);
}));
```

### 4. `useCallback` ➔ Plain Functions

```typescript
// --- React ---
const handleClick = useCallback(() => {
  doSomething(count);
}, [count]);

// --- Seidr ---
// Component setup runs once. Closures are stable forever.
const handleClick = () => {
  doSomething(count());
};
```

### 5. `useRef` ➔ `useRef<T>()`

Seidr provides `useRef()` which returns a `Ref<T>` (a decorated `Value<T | null>` with `hydrate: false`).

```typescript
// --- React ---
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  inputRef.current?.focus();
}, []);
return <input ref={inputRef} />;

// --- Seidr ---
import { createComponent, onMounted, useRef } from '@fimbul-works/seidr';
import { $input } from '@fimbul-works/seidr/html';

export const AutoFocusInput = createComponent(() => {
  const inputRef = useRef<HTMLInputElement>();

  onMounted(() => {
    inputRef()?.focus();
  });

  return $input({ ref: inputRef, type: 'text' });
}, 'AutoFocusInput');
```

### 6. `useContext` ➔ `getAppState()` or Coordinator Object

React uses Context because props cannot easily bypass intermediate VDOM nodes. In Seidr:
1. **Direct Parameter Passing**: Component factories are JavaScript functions; you can pass coordinator objects or stores down cleanly.
2. **Global / Scoped Shared State**: Use `getAppState()`:
```typescript
import { getAppState } from '@fimbul-works/seidr';

const APP_CONTEXT_KEY = 'my-library.context';
const state = getAppState();

if (!state.hasData(APP_CONTEXT_KEY)) {
  state.setData(APP_CONTEXT_KEY, new Map());
}
const contextMap = state.getData<Map<string, any>>(APP_CONTEXT_KEY);
```

### 7. Controlled vs Uncontrolled (`useControllableState`) ➔ `wrapValue`

Radix UI components often support both controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) modes.

In Seidr:
```typescript
import { wrapValue, type Value } from '@fimbul-works/seidr';

interface ToggleProps {
  pressed?: boolean | Value<boolean>;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

export const createToggle = (props: ToggleProps = {}) => {
  // Normalize controlled or uncontrolled state into a single reactive Value:
  const isPressed = wrapValue(props.pressed ?? props.defaultPressed ?? false);

  if (props.onPressedChange) {
    onUnmounted(isPressed.watch(props.onPressedChange));
  }

  return {
    isPressed,
    toggle: () => isPressed((p) => !p)
  };
};
```

### 8. Two-Way Form Input Binding ➔ `bindInput()`

For form controls (like `<input>` or `<textarea>`), Seidr provides `bindInput()` to wire a `Value<string>` to the element's `value` and `oninput` handler in a single expression:

```typescript
// --- React ---
const [text, setText] = useState('');
<input value={text} onChange={(e) => setText(e.target.value)} />

// --- Seidr ---
import { bindInput, createValue } from '@fimbul-works/seidr';
import { $input } from '@fimbul-works/seidr/html';

const text = createValue('');

// bindInput expands into { value: text, oninput: ... }
const inputEl = $input({ ...bindInput(text), placeholder: 'Type here...' });
```

---

## Component & Markup Equivalents

### 1. Conditional Rendering (`{condition && <Element />}`) ➔ `Show()`

```typescript
// --- React ---
{isOpen && <ModalContent />}

// --- Seidr ---
import { Show } from '@fimbul-works/seidr';

Show(isOpen, () => ModalContent())

// if ModalContent requires no props, the closure is unnecessary (TypeScript will complain when unsure)
Show(isOpen, ModalContent)
```

### 2. Multi-Branch Matching ➔ `Switch()`

```typescript
// --- Seidr ---
import { Switch } from '@fimbul-works/seidr';

Switch(status, {
  loading: () => LoadingSpinner(),
  success: () => SuccessView(),
  error: () => ErrorView()
});
// if component requires no props, the closure is unnecessary (TypeScript will complain when unsure)
Switch(status, {
  loading: LoadingSpinner,
  success: SuccessView,
  error: ErrorView
});
```

### 3. Keyed Lists (`items.map(...)`) ➔ `List()`

```typescript
// --- React ---
<ul>
  {todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}
</ul>

// --- Seidr ---
import { List } from '@fimbul-works/seidr';
import { $ul } from '@fimbul-works/seidr/html';

$ul([
  List(todosValue, (t) => t.id, (itemValue) => {
    // itemValue is Value<Todo> for fine-grained per-item updates
    return TodoItem({ todo: itemValue });
  })
])
```

### 4. DOM Events ➔ Standard Event Listeners

Seidr attaches native DOM event listeners directly:

```typescript
// --- React ---
<button onClick={(e) => handleClick(e)} onKeyDown={(e) => handleKey(e)} />

// --- Seidr ---
import { $button } from '@fimbul-works/seidr/html';

$button({
  onclick: (e: MouseEvent) => handleClick(e),
  onkeydown: (e: KeyboardEvent) => handleKey(e)
});
```

### 5. `<Suspense>` ➔ `Suspense()`

```typescript
// --- React ---
<Suspense fallback={<LoadingSpinner />}>
  <AsyncProfile />
</Suspense>

// --- Seidr ---
import { Suspense, Switch } from '@fimbul-works/seidr';

Suspense(
  fetchDataPromise,
  createComponent(({ state, value, error }) => {
    return Switch(state, {
      pending: LoadingSpinner,
      resolved: () => ProfileView(value),
      error: () => ErrorView(error)
    });
  })
);
```

### 6. `<ErrorBoundary>` ➔ `Safe()`

```typescript
// --- React ---
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComplexWidget />
</ErrorBoundary>

// --- Seidr ---
import { Safe } from '@fimbul-works/seidr';

Safe(ComplexWidget, ErrorFallback);
```
