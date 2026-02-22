# DOM Elements API

## $() - Create DOM elements

Create DOM elements with reactive props support.

**Parameters:**
- `tag` - HTML tag name
- `props` - Object with element properties (can include [`Seidr`](../seidr/README.md#seidr-class) observables)
- `children` - Array of child elements, strings, functions, or [`SeidrComponents`](../component/README.md#seidrcomponent-type)

**Returns:** [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)

```typescript
import { $, Seidr } from '@fimbul-works/seidr';

const disabled = new Seidr(false);

const button = $('button', {
  disabled,
  textContent: 'Click me'
}, []);

document.body.appendChild(button);
```

---

## $factory()

Create reusable element creator functions with optional default props.

**Parameters:**
- `tag` - HTML tag name
- `props` - Object with element properties (can include Seidr observables)
- `initialProps` - Default properties to apply to all created elements (can include [`Seidr`](../seidr/README.md#seidr-class) observables)

**Returns:** [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)

```typescript
import { $factory } from '@fimbul-works/seidr';

// Without default props
const $card = $factory('article');

const card = $card({ className: 'card' }, [
  'Content goes here'
]);

// With default props
const $checkbox = $factory('input', { type: 'checkbox' });
const $primaryButton = $factory('button', { className: 'btn btn-primary' });

// Use them
const agreeCheckbox = $checkbox({ id: 'agree', checked: true });
const submitButton = $primaryButton({ textContent: 'Submit' });
```

---

## Predefined Element Creators

All HTML elements available with [`$()`](#create-dom-elements) prefix:

**Parameters:**
- `props` - Object with element properties (can include [`Seidr`](../seidr/README.md#seidr-class) observables)
- `children` - Array of child elements or functions that return elements

**Returns:** [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement)

```typescript
// Structure
$div, $span, $p, $section, $article, $header, $footer, $main, $aside, $nav

// Headings
$h1, $h2, $h3, $h4, $h5, $h6

// Text
$a, $strong, $em, $small, $mark, $abbr, $code, $pre

// Forms
$form, $input, $textarea, $button, $select, $option, $label, $fieldset

// Lists
$ul, $ol, $li, $dl, $dt, $dd

// Tables
$table, $thead, $tbody, $tfoot, $tr, $td, $th, $caption

// Media
$img, $video, $audio, $canvas, $svg

// And many more...
```

**Usage:**
```typescript
import { $div, $button, $span } from '@fimbul-works/seidr';

const app = $div({ className: 'app' }, [
  $button({ textContent: 'Click me' }),
  $span({ textContent: 'Hello' })
]);
```

---

## DOM Query Utilities

Type-safe DOM query utilities.

---

### $getById()

Shorthand for [`document.getElementById()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById).

**Generic Type:** `T` extends `HTMLElement`

**Parameters:**
- `id` - The ID of the element to locate

**Returns:** `<T>` or `null`

```typescript
import { $getById } from '@fimbul-works/seidr';

// Get by ID
const element = $getById('my-id');
```

---

### $query()

Shorthand for [`el.querySelctor()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector).

**Generic Type:** `T` extends `HTMLElement`

**Parameters:**
- `query` - The CSS selector string to query for
- `el` - The element to query within (defaults to `document.body`)

**Returns:** `T` or `null`

```typescript
import { $query } from '@fimbul-works/seidr';

// Query first match
const button = $query('button.submit');

// With custom root
const button = $query('button', customContainer);
```

---

### $queryAll()

Shorthand for [`el.querySelctorAll()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll).

**Generic Type:** `T` extends `HTMLElement`

**Parameters:**
- `query` - The CSS selector string to query for
- `el` - The element to query within (defaults to `document.body`)

**Returns:** `T[]` Array of matching DOM elements

```typescript
import { $queryAll } from '@fimbul-works/seidr';

// Query all matches
const items = $queryAll('.item');

// With custom root
const items = $queryAll('.item', customContainer);
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
