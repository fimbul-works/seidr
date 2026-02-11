# Utilities API

## bindInput()

Create two-way binding props for form input elements. Automatically syncs input changes with a [`Seidr<string>`](Seidr.md#seidr-class) observable.

**Parameters:**
- `observable` - [`Seidr<string>`](Seidr.md#seidr-class) to bind to the input

**Returns:** Object with `value` and `oninput` props to spread onto input elements

```typescript
import { bindInput, Seidr, $input, $div, $span } from '@fimbul-works/seidr';

const searchText = new Seidr('');

const searchComponent = $div({}, [
  $input({
    type: 'text',
    placeholder: 'Search...',
    ...bindInput(searchText)
  }),
  $span({ textContent: searchText.as(t => `Searching: ${t}`) })
]);

// searchText.value updates automatically as user types
```

**How it works:**
- Sets the input's `value` to the observable (reactive binding)
- Adds an `oninput` handler that updates the observable when user types
- Spreads the props onto the input element for clean syntax

---

## elementClassToggle()

Reactively toggle a CSS class on an element based on a [`Seidr<boolean>`](Seidr.md#seidr-class).

**Parameters:**
- `element` - The DOM element to toggle the class on
- `className` - The CSS class name to toggle
- `active` - [`Seidr<boolean>`](Seidr.md#seidr-class) that controls the class

```typescript
import { elementClassToggle, Seidr, $button } from '@fimbul-works/seidr';

const isActive = new Seidr(false);
const button = $button({ textContent: 'Click me' });

elementClassToggle(button, 'active', isActive);

isActive.value = true;  // Adds 'active' class
isActive.value = false; // Removes 'active' class
```

---

## cn()

Utility for conditional class names with reactive support.

**Signature:** `(...args) => string`

**Supported parameters:**
- Strings: `'base-class'`
- Functions: `() => 'dynamic-class'`
- Observables: `seidr.as(v => v && 'conditional-class')`
- Arrays: `['class1', 'class2']`
- Objects: `{ 'class-name': truthy }`

```typescript
import { cn, Seidr } from '@fimbul-works/seidr';

const isActive = new Seidr(false);
const size = new Seidr('large');
const hasError = new Seidr(false);

// Conditional classes
const className = cn(
  'base-component',
  isActive.as(active => active && 'active'),
  size.as(s => `size-${s}`),
  hasError.as(error => error && 'has-error')
);

const element = $div({ className });
```

---

## debounce()

Type-safe debouncing with proper timeout management.

**Parameters:**
- `callback` - The function to debounce
- `waitMs` - The delay in milliseconds before executing the callback

**Returns:** Debounced function

```typescript
import { debounce } from '@fimbul-works/seidr';

const handleInput = debounce((value: string) => {
  console.log('Searching for:', value);
}, 300);

handleInput('test');
handleInput('testing'); // Only this executes after 300ms
```

---

## uid()

Generate a unique time-sortable identifier (UID).

**Returns:** Time sorted, URL-safe ~20 characters long (UID) string.

```typescript
import { uid } from '@fimbul-works/seidr';

const id = uid(); // "v67JXa8-2Mj-Ukd7o93r"
```

---

## uidTime()

Extract the creation timestamp from a [(UID)](#uid) as milliseconds since epoch.

**Parameters:**
- `uid` - [UID](#uid) string.

**Returns:** Timestamp as milliseconds since epoch.

**Throws:** `Error` if the UID is invalid.

```typescript
import { uid, uidTime } from '@fimbul-works/seidr';

const id = uid();
const createdAt = uidTime(id); // number (milliseconds)
console.log(new Date(createdAt).toISOString()); // "2024-12-22T..."
```

---

## random()

Deterministic random number generator based on the Alea algorithm. When used within a Seidr component (on both server and client), it uses the internal rendering context to ensure that a sequence of random numbers generated on the server is identical to the sequence generated during client-side hydration.

**Returns:** A pseudo-random float between 0 (inclusive) and 1 (exclusive).

```typescript
import { random } from '@fimbul-works/seidr';

// This value will be the same on server and client during hydration
const initialRotation = random() * 360;
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
