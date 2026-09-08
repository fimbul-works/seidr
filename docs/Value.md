# Reactive State: Values

Seidr uses callable getter-setter functions called **Values** (`Value<T>`) for reactive state management. A `Value` acts as both a getter (when called with no arguments) and a setter (when called with a new value or updater function), while providing automatic fine-grained change tracking, derivation, and DOM data-binding.

---

## `createValue()`

The primary factory function for creating reactive state.

```typescript
import { createValue } from '@fimbul-works/seidr';

const count = createValue(0);
const name = createValue('Alice');
const isActive = createValue<boolean>(false);

// Reading value (getter)
console.log(count()); // 0

// Writing value (setter)
count(5); // Updates value to 5, returns previous value (0)

// Functional updater
count((prev) => prev + 1); // Updates value to 6, returns previous value (5)
```

**Generic Type:** `T` — The type of value being stored.

### `ValueOptions`

When creating a `Value`, you can provide an options object:

```typescript
const count = createValue(0, {
  id: 'count',
  isEqual: Object.is,
  hydrate: true
});
```

- `id?: string` — Unique identifier for this observable. Essential for singleton state sharing and SSR hydration matching.
- `isEqual?: (a: any, b: any) => boolean` (default: `Object.is`) — Comparison function used to determine if the value has changed.
  - Defaults to `Object.is` (where `NaN === NaN` and `-0 !== +0`).
  - To create a "signal" that always notifies listeners on invocation (even when set to identical data), supply `isEqual: () => false`.
- `hydrate?: boolean` (default: `true`) — Whether this observable should capture its value during SSR and restore it on the client.

### Properties

- `id: string` — Readonly unique identifier.

  ```typescript
  const count = createValue(0, { id: 'counter' });
  console.log(count.id); // 'counter'
  ```

  > [!NOTE]
  > Values with explicit IDs act as **singletons** within their `AppState`. If `createValue` is called with an `id` that already exists in the current application state, it returns the existing `Value` instance instead of creating a new one. This enables safe state sharing across modules and components in both client and SSR contexts.

  **Deterministic IDs in SSR:**
  - **Inside Components**: Values created within a component automatically receive an ID derived from the component's ID and its creation sequence (e.g. `1-1`, `1-2`), ensuring deterministic hydration matches.
  - **Outside Components**: Values created globally receive sequential IDs managed by `AppState`.

- `isDerived: boolean` — Readonly boolean indicating if this value is derived from one or more parent values.

  ```typescript
  const count = createValue(0);
  const doubled = count.as((n) => n * 2);
  console.log(doubled.isDerived); // true
  ```

- `hydrate: boolean` — Readonly boolean indicating if SSR hydration is enabled for this value.

---

## Methods on `Value<T>`

### `.as()`

Creates a derived `Value` that automatically transforms the source observable's value whenever it changes.

**Generic Type:** `D` — The type of the transformed/derived value.

**Parameters:**
- `transformFn: (value: T) => D` — Function to transform the source value.
- `options?: ValueOptions` — Optional configuration for the derived `Value`.

**Returns:** Derived `Value<D>` instance.

```typescript
const count = createValue(2);

const doubled = count.as((n) => n * 2);         // Value<number>
const isEven = count.as((n) => n % 2 === 0);    // Value<boolean>
const label = count.as((n) => `Count: ${n}`);   // Value<string>

console.log(doubled()); // 4
console.log(isEven());  // true
console.log(label());   // "Count: 2"

count(5);
console.log(doubled()); // 10
console.log(isEven());  // false
console.log(label());   // "Count: 5"
```

---

### `.watch()`

Registers a change handler callback that is invoked whenever the value changes.

**Parameters:**
- `handler: (value: T, prevValue?: T) => any` — Callback receiving the new value and previous value.

**Returns:** `CleanupFunction` (`() => void`) to unregister the handler.

```typescript
const count = createValue(0);

const unwatch = count.watch((newVal, prevVal) => {
  console.log(`Changed from ${prevVal} to ${newVal}`);
});

count(1); // Logs: "Changed from 0 to 1"
count(2); // Logs: "Changed from 1 to 2"

// Stop watching
unwatch();
```

---

### `.bind()`

Registers a change handler callback that is invoked **immediately** with the current value and again whenever the value changes.

**Parameters:**
- `handler: (value: T, prevValue?: T) => any` — Callback receiving the current/new value and previous value.

**Returns:** `CleanupFunction` (`() => void`) to unregister the handler.

```typescript
const count = createValue(10);

const unbind = count.bind((value) => {
  console.log(`Current value: ${value}`);
});
// Immediately logs: "Current value: 10"

count(20); // Logs: "Current value: 20"

unbind();
```

---

### `.cleanup()`

Registers a cleanup function that will be executed when `.destroy()` is called on the `Value`.

**Parameters:**
- `fn: CleanupFunction` — Cleanup callback.

```typescript
const count = createValue(0);
count.cleanup(() => {
  console.log('Value destroyed, performing custom resource cleanup');
});
```

---

### `.destroy()`

Removes all registered watcher/binding callbacks and executes all registered cleanups.

```typescript
const count = createValue(0);
count.destroy();
```

---

## Automatic DOM Data-Binding

Passing `Value` observables directly as props, attributes, or children into Seidr DOM element creators automatically binds them to the DOM:

```typescript
import { createValue } from '@fimbul-works/seidr';
import { $button, $div, $span } from '@fimbul-works/seidr/html';

const count = createValue(0);
const isDisabled = count.as((c) => c >= 10);

const counter = $div({ className: 'counter' }, [
  $span({ textContent: count.as((c) => `Clicks: ${c}`) }),
  $button({
    textContent: '+1',
    disabled: isDisabled, // Reactive attribute binding
    onclick: () => count((c) => c + 1)
  })
]);
```

When elements are created inside a component, all bindings are automatically tracked and cleaned up when the component is unmounted.

---

## Companion Utilities

### `mergeValues()`

Creates a derived `Value` that depends on multiple reactive sources. Any `Value` invoked inside `mergeFn` during initial evaluation is automatically recorded as a dependency.

**Generic Type:** `T` — The type of the derived value.

**Parameters:**
- `mergeFn: () => T` — Function computing the merged value.
- `options?: ValueOptions` — Optional configuration for the derived `Value` (e.g. `parents`, `id`, `isEqual`, `hydrate`).

**Returns:** Derived `Value<T>` instance.

```typescript
import { createValue, mergeValues } from '@fimbul-works/seidr';

const firstName = createValue('John');
const lastName = createValue('Doe');

const fullName = mergeValues(() => `${firstName()} ${lastName()}`);
console.log(fullName()); // "John Doe"

firstName('Jane');
console.log(fullName()); // "Jane Doe"

lastName('Smith');
console.log(fullName()); // "Jane Smith"
```

> [!IMPORTANT]
> **Handling Conditional Logic with `options.parents`:**
> Dependency auto-discovery occurs during the initial execution of `mergeFn`. If your merge function contains **conditional branches** (such as ternary operators or `if` statements), values inside branches that are not executed on the initial run will not be discovered.
>
> When conditional logic is involved, getter auto-discovery cannot be trusted to capture all dependencies. You must pass an explicit array of parent `Value` observables in `options.parents`:
>
> ```typescript
> const showDetails = createValue(false);
> const basicInfo = createValue('Basic Info');
> const detailedInfo = createValue('Detailed Info');
>
> // Explicit parents ensure updates trigger even if detailedInfo was not read initially
> const displayInfo = mergeValues(
>   () => showDetails() ? detailedInfo() : basicInfo(),
>   { parents: [showDetails, basicInfo, detailedInfo] }
> );
> ```

---

### `withStorage()`

Synchronizes a `Value` observable with browser storage (`localStorage` or `sessionStorage`) with automatic persistence and restoration across reloads.

**Parameters:**
- `key: string` — Storage key.
- `value: Value<T>` — Observable to bind.
- `storage?: Storage` (default: `localStorage`) — Storage API to use.
- `onError?: (error: SeidrError, operation: "read" | "write") => void` — Optional error callback.

**Returns:** The same `Value` instance with storage synchronization enabled.

```typescript
import { createValue, withStorage } from '@fimbul-works/seidr';

// Persist in localStorage
const theme = withStorage('app_theme', createValue('dark'));

// Persist in sessionStorage with custom error handling
const draft = withStorage(
  'draft_content',
  createValue(''),
  sessionStorage,
  (error, op) => console.warn(`Storage ${op} failed:`, error)
);
```

---

### `wrapValue()`

Ensures a value is wrapped in a `Value` observable. If already a `Value`, it is returned unchanged; otherwise a new `Value` is created.

**Parameters:**
- `v: T | Value<T>` — Plain value or `Value` observable.
- `options?: ValueOptions` — Optional configuration if a new `Value` is created.

**Returns:** `Value<T>`

```typescript
import { createValue, wrapValue } from '@fimbul-works/seidr';

const v1 = wrapValue(42);         // Returns a new Value<number> with 42
const v2 = wrapValue(createValue(42)); // Returns existing Value instance
```

---

### `unwrapValue()`

Safely extracts the raw value from a `Value` observable or returns plain values as-is.

**Parameters:**
- `v: T | Value<T>` — Plain value or `Value` observable.

**Returns:** `T`

```typescript
import { createValue, unwrapValue } from '@fimbul-works/seidr';

const count = createValue(5);
console.log(unwrapValue(count)); // 5
console.log(unwrapValue(10));    // 10
```

---

### `isValue()`

Type guard checking if a value is a Seidr `Value` observable.

**Parameters:**
- `v: any` — Value to test.

**Returns:** `boolean` (type narrows to `v is Value<T>`).

```typescript
import { createValue, isValue } from '@fimbul-works/seidr';

const count = createValue(0);
console.log(isValue(count)); // true
console.log(isValue(42));    // false
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
