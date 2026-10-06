<img src="../public/seidr-logo.svg" alt="@fimbul-works/seidr" style="height:200px;margin-bottom:-1rem;"/>

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
  > Values with explicit IDs act as **singletons** within their [`AppState`](AppState.md). If `createValue` is called with an `id` that already exists in the current application state, it returns the existing `Value` instance instead of creating a new one. This enables safe state sharing across modules and components in both client and SSR contexts.

  **Deterministic IDs in SSR:**
  - **Inside Components**: Values created within a component automatically receive an ID derived from the component's ID and its creation sequence (e.g. `1-1`, `1-2`), ensuring deterministic hydration matches.
  - **Outside Components**: Values created globally receive sequential IDs managed by [`AppState`](AppState.md).

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
- `handler: (value: T, prevValue?: T) => CleanupFunction | void` — Callback receiving the new value and previous value. Can optionally return a `CleanupFunction` (`() => void`).

**Returns:** `CleanupFunction` (`() => void`) to unregister the handler and run any active cleanup.

#### Cleanup Function Lifecycle

Handlers can return an optional cleanup function (similar to React's `useEffect` teardown). When returned:
1. **Before subsequent runs**: If the value changes again, the previously returned cleanup runs immediately before the handler is invoked with the new value.
2. **On unwatch**: When the returned unsubscribe function (`unwatch()`) is invoked, the active cleanup function runs immediately.
3. **On `.destroy()`**: If the `Value` is destroyed, any active cleanup function is executed.

#### Basic Usage

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

#### Side Effects with Teardown

```typescript
const userId = createValue('user-1');

const unwatch = userId.watch((id) => {
  const controller = new AbortController();
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => console.log('User data:', data));

  // Cleanup runs before next user ID change or when unwatching
  return () => controller.abort();
});
```

---

### `.bind()`

Registers a change handler callback that is invoked **immediately** with the current value and again whenever the value changes.

**Parameters:**
- `handler: (value: T, prevValue?: T) => CleanupFunction | void` — Callback receiving the current/new value and previous value. Can optionally return a `CleanupFunction` (`() => void`).

**Returns:** `CleanupFunction` (`() => void`) to unregister the handler and run any active cleanup.

#### Immediate Execution & Teardown Lifecycle

Unlike `.watch()`, `.bind()` executes the handler immediately upon registration with `(currentValue, currentValue)`.
- If the handler returns a cleanup function, it is captured from the initial call.
- The cleanup function automatically runs before subsequent updates, when calling the unbind function, or when `.destroy()` is called on the `Value`.

#### Basic Usage

```typescript
const count = createValue(10);

const unbind = count.bind((value) => {
  console.log(`Current value: ${value}`);
});
// Immediately logs: "Current value: 10"

count(20); // Logs: "Current value: 20"

unbind();
```

#### Managing External Subscriptions

`.bind()` is particularly useful for establishing active subscriptions or listeners that should be active immediately and cleaned up upon change or teardown:

```typescript
const isTracking = createValue(false);

const unbind = isTracking.bind((active) => {
  if (!active) return;

  const onMouseMove = (e: MouseEvent) => {
    console.log(`Pointer at (${e.clientX}, ${e.clientY})`);
  };

  window.addEventListener('mousemove', onMouseMove);

  // Automatically cleans up before active changes or when unbound
  return () => window.removeEventListener('mousemove', onMouseMove);
});

isTracking(true);  // Attaches event listener
isTracking(false); // Cleans up event listener

unbind();          // Removes handler and runs active cleanup
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

Removes all registered watcher and binding callbacks, runs their active cleanup functions, and executes all registered cleanups.

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

### `wrapValueObject()`

Wraps a `Value<T>` observable in a plain JavaScript object with getter and setter accessors.

This provides an OOP accessor bridge for reactive `Value` observables, allowing libraries that operate on object property mutations - such as [Flaedi](https://github.com/fimbul-works/flaedi) and other tweening or property-based animation tools—to read and update reactive state transparently.

**Generic Types:**

* `T` — The type of value stored in the observable.
* `K extends string = "value"` — The property key name on the returned object (defaults to `"value"`).

**Parameters:**

* `value: Value<T>` — The reactive `Value<T>` observable to wrap.
* `key?: K` (default: `"value"`) — The property key to use on the returned object.

**Returns:** `Record<K, T>` — An object with getter and setter accessors bound to the `Value`.

```typescript
import { createValue, wrapValueObject } from "@fimbul-works/seidr";

// Default key: "value"

const count = createValue(0);
const target = wrapValueObject(count);

console.log(target.value); // 0 (calls count())

target.value = 10;         // Calls count(10), triggering watchers and bindings

console.log(count());      // 10

// Custom key
const opacity = createValue(0);
const animTarget = wrapValueObject(opacity, "opacity");

console.log(animTarget.opacity); // 0

animTarget.opacity = 1;          // Calls opacity(1)
```

#### OOP Animation Integration (e.g. [Flaedi](https://github.com/fimbul-works/flaedi))

When animating reactive values with OOP tweening engines like [Flaedi](https://github.com/fimbul-works/flaedi), `wrapValueObject` bridges the gap between property-mutating animators and functional reactive observables.

```typescript
import { createValue, wrapValueObject } from "@fimbul-works/seidr";
import { tween } from "@fimbul-works/flaedi";

const x = createValue(0);

const animTarget = wrapValueObject(x, "x");

// Flaedi mutates the property directly
// Each assignment is forwarded to the reactive Value
const animation = tween(animTarget, "x", 100, 1000);

await animation;
```

Because `animTarget.x` is a getter/setter backed directly by `x`, every assignment made by Flaedi updates the original `Value`. Existing Seidr watchers and DOM bindings therefore react normally.

The same adapter can be used with other libraries that expect mutable object properties, without requiring those libraries to depend on Seidr.

---

### `useRef()`

Creates a specialized `Ref<T>` observable holding a DOM element reference (or `null`). A `Ref` is a decorated `Value` tailored for DOM element bindings via the `ref` prop, with SSR hydration disabled.

```typescript
import { useRef } from '@fimbul-works/seidr';

const inputRef = useRef<HTMLInputElement>();
console.log(inputRef()); // null initially
```

For full details on using `useRef` with elements, the `ref` prop, and lifecycle timing with `onMounted()`, see **[DOM Elements: Element References (`useRef`)](DOM.md#element-references-useref)**.

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

### `isRef()`

Type guard checking if a value is a Seidr `Ref` observable created by `useRef()`.

**Parameters:**
- `v: any` — Value to test.

**Returns:** `boolean` (type narrows to `v is Ref<T>`).

```typescript
import { isRef, useRef } from '@fimbul-works/seidr';

const ref = useRef<HTMLDivElement>();
console.log(isRef(ref)); // true
console.log(isRef({}));  // false
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
