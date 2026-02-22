# Reactive State

Seidr consists of a single class for reactive state, the [`Seidr`](#seidr-class) class. It is a simple, lightweight, and efficient reactive state management system.

For global state management, see [`useState()`](state.md#usestate).

## Seidr class

The core reactive state class.

```typescript
import { Seidr } from '@fimbul-works/seidr';

const count = new Seidr<number>(0);
const name = new Seidr<string>('Alice');
const isActive = new Seidr<boolean>(false);
```

**Generic Type:** `T` - The type of value being stored.

### Properties
- `id` - Readonly unique identifier.
  ```typescript
  const count = new Seidr(0, { id: 'count' });
  console.log(count.id); // 'count'
  ```

- `value` - Get or set the current value. Setting triggers all bindings.

  ```typescript
  const count = new Seidr(0);
  count.value = 5;          // Set value
  console.log(count.value); // Get value: 5
  ```

- `isDerived` - Readonly boolean indicating if the instance is derived.
  ```typescript
  const count = new Seidr(0);
  const doubled = count.as(n => n * 2);
  console.log(doubled.isDerived); // true
  ```

- `parents` - Readonly array of parent `Seidr` instances.
  ```typescript
  const count = new Seidr(0);
  const doubled = count.as(n => n * 2);
  console.log(doubled.parents); // [count]
  ```

### as()

Create a derived observable that transforms the source value.

**Generic Type:** `D` - The type of the transformed/derived value.

**Parameters:**
- `transform` - Tranforming function (signature `(value: T) => Seidr<D>`)

**Returns**: Derived `Seidr<D>` instance

```typescript
const count = new Seidr(0);

const doubled = count.as(n => n * 2);         // Seidr<number>
const isEven = count.as(n => n % 2 === 0);    // Seidr<boolean>
const message = count.as(n => `Count: ${n}`); // Seidr<string>

count.value = 5;
console.log(doubled.value);  // 10
console.log(message.value);  // "Count: 5"
```

### observe()

Register a callback that runs when the value changes.

**Parameters:**
- `handler` - Callback function (signature `(value: T) => void`)

**Returns:** `CleanupFunction` (signature `() => void`)

```typescript
const count = new Seidr(0);

const cleanup = count.observe((value) => {
  console.log(`Count changed to: ${value}`);
});

count.value = 5;  // Logs: "Count changed to: 5"

// When done:
cleanup();
```

### bind()

Manually bind a to an object with custom update logic. Unlike [`observe()`](#observe), this function will call the handler immediately with the current value.

**Generic Type:** `O` - The type being bound to.

**Parameters:**
- `target` - Target value to apply changes to
- `handler` - Callback function (signature `(value: T, target: O) => void`)

**Returns:** `CleanupFunction` (signature `() => void`)

```typescript
const count = new Seidr(0);
const display = document.createElement('span');

// Custom transformation function
const cleanup = count.bind(display, (value, el) => {
  el.textContent = value > 5 ? 'Many clicks!' : `Count: ${value}`;
  el.style.color = value > 5 ? 'red' : 'black';
});

count.value = 3; // display shows "Count: 3" in black
count.value = 7; // display shows "Many clicks!" in red

// When done:
cleanup();
```

**Automatic binding:**
You can use [`Seidr`](#seidr-class) instances as props on `HTMLElement` to update element properties automatically.

```typescript
import { $ } from '@fimbul-works/seidr';

const textContent = new Seidr('');

const div = $('div', { textContent });
textContent.value = 'Hello!';
// div.textContent is now "Hello!"
```

### destroy()

Cleanup all observables and derived computations.

```typescript
const count = new Seidr(0);
const doubled = count.as(n => n * 2);

count.destroy();
```

### Seidr.merge

Static method that creates a derived [`Seidr`](#seidr-class) that depends on multiple sources.

**Generic Type:** `D` - The type of the derived value

**Parameters:**
- `mergeFn` - Function that merges the parent values to a new value (signature `() => D`)
- `dependencies` - Array of [`Seidr`](#seidr-class) observables this computation depends on

**Returns**: Derived [`Seidr<D>`](#seidr-class) instance

```typescript
const firstName = new Seidr('John');
const lastName = new Seidr('Doe');

// Full name updates when either name changes
const fullName = Seidr.merge(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);

console.log(fullName.value);  // "John Doe"

firstName.value = 'Jane';
console.log(fullName.value);  // "Jane Doe"

lastName.value = 'Smith';
console.log(fullName.value);  // "Jane Smith"
```

---

## Seidr utilities

### wrapSeidr()

Ensures a value is wrapped in a [`Seidr`](#seidr-class) observable. If the value is already a [`Seidr`](#seidr-class) instance, it is returned as-is. If it is a raw value, a new [`Seidr`](#seidr-class) instance is created with that value.

**Generic Type:** `T` - The type of value being stored

**Parameters:**
- `v` - The value to wrap: `T | Seidr<T>`

**Returns:** `Seidr<T>`

```typescript
import { wrapSeidr, Seidr } from '@fimbul-works/seidr';

const s1 = wrapSeidr(10); // Returns new Seidr with value 10
const s2 = wrapSeidr(s1); // Returns s1 directly
```

---

### unwrapSeidr()

Utility to safely extract the value from a [`Seidr`](#seidr-class) observable or return non-[`Seidr`](#seidr-class) values as-is.

**Generic Type:** `T` - Type of value to unwrap

**Parameters:**
- `value` - A [`Seidr`](#seidr-class) observable or a plain value

**Returns:** The unwrapped value of type `T`

This utility is particularly useful when working with functions that accept both [`Seidr`](#seidr-class) observables and plain values, and you need to access the underlying value without checking types manually.

```typescript
import { unwrapSeidr, Seidr } from '@fimbul-works/seidr';

// Unwrap a Seidr observable
const count = new Seidr(5);
console.log(unwrapSeidr(count)); // 5

// Unwrap a plain value
const name = "Alice";
console.log(unwrapSeidr(name)); // "Alice"
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
