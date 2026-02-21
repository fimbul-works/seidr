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
