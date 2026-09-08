# DOM Elements API

Seidr provides a functional, lightweight DOM element creation and query API with reactive binding support for [`Value`](Value.md) observables.

---

## `$()` — Create DOM Elements

Creates a DOM element with reactive props, attributes, event handlers, and child nodes.

**Parameters:**
- `tag: string` — HTML tag name (e.g. `'div'`, `'button'`, `'input'`).
- `props?: ElementProps` — Object with element properties, attributes, and event handlers (can include [`Value`](Value.md) observables).
- `children?: SeidrChild | SeidrChild[]` — Array of child elements, strings, numbers, reactive [`Value`](Value.md) observables, or [`SeidrComponents`](components.md).

**Returns:** [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)

```typescript
import { $, createValue } from '@fimbul-works/seidr';

const isDisabled = createValue(false);

const button = $('button', {
  className: 'btn btn-primary',
  disabled: isDisabled, // Reactive boolean attribute binding
  textContent: 'Click me',
  onclick: () => console.log('Button clicked!')
}, []);

document.body.appendChild(button);
```

---

## `$factory()`

Creates a reusable element factory function with optional predefined default properties.

**Parameters:**
- `tag: string` — HTML tag name.
- `defaultProps?: ElementProps` — Default properties to apply to all created elements.

**Returns:** `(props?: ElementProps, children?: SeidrChild | SeidrChild[]) => HTMLElement`

```typescript
import { $factory } from '@fimbul-works/seidr';

// Factory without default props
const $card = $factory('article');
const card = $card({ className: 'card' }, [
  'Content goes here'
]);

// Factory with default props
const $checkbox = $factory('input', { type: 'checkbox' });
const $primaryButton = $factory('button', { className: 'btn btn-primary' });

// Use them
const agreeCheckbox = $checkbox({ id: 'agree', checked: true });
const submitButton = $primaryButton({ textContent: 'Submit' });
```

---

## Predefined Element Creators (`@fimbul-works/seidr/html`)

For convenience, Seidr provides ready-to-use element creator functions for all standard HTML elements via `@fimbul-works/seidr/html`.

> [!NOTE]
> Importing from `@fimbul-works/seidr/html` provides access to 100+ tag-specific creators prefixed with `$`. If you only need a few, you can also use [`$()`](#--create-dom-elements) or [`$factory()`](#factory) directly.

**Parameters:**
- `props?: ElementProps` — Element properties, attributes, event handlers, and [`Value`](Value.md) observables.
- `children?: SeidrChild | SeidrChild[]` — Child elements, strings, numbers, or reactive Values.

**Returns:** [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)

```typescript
import { createValue } from '@fimbul-works/seidr';
import { $div, $button, $span } from '@fimbul-works/seidr/html';

const count = createValue(0);

const counter = $div({ className: 'counter-container' }, [
  $span({ textContent: count.as((c) => `Count: ${c}`) }),
  $button({
    textContent: '+1',
    onclick: () => count((c) => c + 1)
  })
]);
```

### Standard Element Categories

- **Structure & Layout:** `$div`, `$span`, `$p`, `$section`, `$article`, `$header`, `$footer`, `$main`, `$aside`, `$nav`
- **Headings:** `$h1`, `$h2`, `$h3`, `$h4`, `$h5`, `$h6`
- **Typography:** `$a`, `$strong`, `$em`, `$small`, `$mark`, `$abbr`, `$code`, `$pre`
- **Forms & Inputs:** `$form`, `$input`, `$textarea`, `$button`, `$select`, `$option`, `$label`, `$fieldset`
- **Lists:** `$ul`, `$ol`, `$li`, `$dl`, `$dt`, `$dd`
- **Tables:** `$table`, `$thead`, `$tbody`, `$tfoot`, `$tr`, `$td`, `$th`, `$caption`
- **Media & Canvas:** `$img`, `$video`, `$audio`, `$canvas`, `$svg`

---

## DOM Query Utilities

Type-safe utility wrappers around standard browser query methods.

### `$getById()`

Shorthand for [`document.getElementById()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById).

**Generic Type:** `T extends HTMLElement`

**Parameters:**
- `id: string` — Element ID to locate.

**Returns:** `T | null`

```typescript
import { $getById } from '@fimbul-works/seidr';

const app = $getById<HTMLDivElement>('app');
```

---

### `$query()`

Shorthand for [`querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector).

**Generic Type:** `T extends HTMLElement`

**Parameters:**
- `selector: string` — CSS selector string.
- `root?: Element` (default: `document.body`) — Root element to search within.

**Returns:** `T | null`

```typescript
import { $query } from '@fimbul-works/seidr';

const submitBtn = $query<HTMLButtonElement>('button.btn-primary');
const headerTitle = $query<HTMLHeadingElement>('h1', headerContainer);
```

---

### `$queryAll()`

Shorthand for [`querySelectorAll()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll).

**Generic Type:** `T extends HTMLElement`

**Parameters:**
- `selector: string` — CSS selector string.
- `root?: Element` (default: `document.body`) — Root element to search within.

**Returns:** `T[]` — Array of matching DOM elements.

```typescript
import { $queryAll } from '@fimbul-works/seidr';

const allItems = $queryAll<HTMLLIElement>('li.todo-item');
const formInputs = $queryAll<HTMLInputElement>('input', formElement);
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
