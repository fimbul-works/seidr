<img src="../public/seidr-logo.svg" alt="@fimbul-works/seidr" style="height:200px;margin-bottom:-1rem;"/>

# DOM Elements API

Seidr provides a functional, lightweight DOM element creation and query API with reactive binding support for [`Value`](Value.md) observables.

---

## `$()` — Create DOM Elements

Creates a DOM element with reactive props, attributes, event handlers, and child nodes. Props are optional—children can be passed directly as the second argument.

**Overloaded Signatures:**
- `$(tag, children?)` — Create element directly with children (omitting props).
- `$(tag, props?, children?)` — Create element with props and children.

**Parameters:**
- `tag: string` — HTML tag name (e.g. `'div'`, `'button'`, `'input'`).
- `props?: ElementProps | null` — Object with element properties, attributes, and event handlers (can include [`Value`](Value.md) observables).
- `children?: SeidrChild | SeidrChild[]` — Array or single child element, string, number, reactive [`Value`](Value.md) observable, or [`SeidrComponent`](components.md).

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

// Shorthand: omitting props when only children are needed
const container = $('div', [
  $('h1', 'Title'),
  $('p', 'Paragraph content without explicit props object')
]);
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

## Element References (`useRef`)

The `useRef()` hook provides a streamlined way to capture and interact with underlying DOM element instances. It enables imperative access to DOM nodes created via [`$()`](#--create-dom-elements) or predefined element creators when declarative bindings are insufficient (e.g., drawing on `<canvas>`, managing focus on `<input>`, or integrating third-party imperative DOM libraries).

### `useRef()`

Creates a typed `Ref<T>` reference object.

**Generic Type:**
- `T extends Element = Element` — The specific DOM element type (e.g. `HTMLCanvasElement`, `HTMLInputElement`).

**Returns:** `Ref<T>` — A decorated [`Value<T | null>`](Value.md) observable.

```typescript
import { createComponent, onMounted, useRef } from '@fimbul-works/seidr';
import { $button, $canvas, $div } from '@fimbul-works/seidr/html';

const CanvasViewer = createComponent(() => {
  const canvasRef = useRef<HTMLCanvasElement>();

  // The element reference is reliably available inside onMounted
  onMounted(() => {
    const canvas = canvasRef();
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(20, 20, 160, 100);
      }
    }
  });

  return $div([
    $canvas({ id: 'viewer-canvas', width: 300, height: 200, ref: canvasRef }),
    $button({
      textContent: 'Clear',
      onclick: () => {
        const canvas = canvasRef();
        const ctx = canvas?.getContext('2d');
        ctx?.clearRect(0, 0, 300, 200);
      }
    })
  ]);
}, 'CanvasViewer');
```

### The `ref` Prop

Pass the `Ref` instance into the `ref` prop of any element created with [`$()`](#--create-dom-elements) or HTML helper functions:

```typescript
const inputRef = useRef<HTMLInputElement>();
const input = $('input', { type: 'text', ref: inputRef });
```

### Lifecycle & Timing: Using with `onMounted()`

> **IMPORTANT**
>
> A `Ref` starts initialized to `null`. When passed to an element via the `ref` prop, Seidr assigns the element instance to the ref and automatically resets it back to `null` when unmounted.
>
> However, the referenced element is **only guaranteed to be attached to the active DOM document once the component mounts**. Therefore, querying layout geometry, setting focus, or accessing rendering contexts should always be performed inside the [`onMounted()`](components.md#onmounted) lifecycle hook.

### Reactive Nature (`Ref<T>`)

A `Ref<T>` is a decorated [`Value<T | null>`](Value.md) with SSR hydration disabled (`hydrate: false`). It supports standard `Value` semantics:

- **Getter**: `ref()` returns `T | null`.
- **Setter**: `ref(newElement)` or `ref(null)` manually updates the reference (accepts `HTMLElement` or `null`, throws `SeidrError` otherwise).
- **Observable methods**: Supports `.watch()`, `.bind()`, and `.destroy()` just like standard `Value` instances.

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

## Low-Level Node & Document Utilities

### `$text()`

Creates a DOM `Text` node. In SSR mode, the text node is registered in the component creation index. During client-side hydration, it is claimed from the existing server DOM.

**Parameters:**
- `text: string` — Text content.

**Returns:** `Text`

```typescript
import { $text } from '@fimbul-works/seidr';

const textNode = $text('Hello world');
```

---

### `$comment()`

Creates a DOM `Comment` node. Used by Seidr components and reactive bindings for marker comments, and available for custom structural markers.

**Parameters:**
- `text: string` — Comment string.

**Returns:** `Comment`

```typescript
import { $comment } from '@fimbul-works/seidr';

const marker = $comment('custom-boundary');
```

---

### `getDocument()`

Retrieves the active `Document` instance. Returns the global `window.document` in browser environments, or the per-request SSR DOM document during server-side rendering.

**Returns:** `Document`

```typescript
import { getDocument } from '@fimbul-works/seidr';

const doc = getDocument();
const element = doc.createElement('div');
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)

