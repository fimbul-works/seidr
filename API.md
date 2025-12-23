# Seidr API Reference

## Table of Contents

- [Core Reactive](#core-reactive)
  - [Seidr\<T\>](#seidrt)
  - [seidr.value](#seidrvalue)
  - [seidr.as()](#seidras)
  - [seidr.observe()](#seidroobserve)
  - [seidr.bind()](#seidrbind)
  - [seidr.destroy()](#seidrdestroy)
  - [Seidr.computed()](#seidrcomputed)
- [Components](#components)
  - [component()](#component)
  - [createScope()](#createscope)
- [Mounting](#mounting)
  - [mount()](#mount)
  - [mountConditional()](#mountconditional)
  - [mountList()](#mountlist)
  - [mountSwitch()](#mountswitch)
- [DOM Elements](#dom-elements)
  - [`$` - Create DOM elements](#---create-dom-elements)
  - [`$factory()` - Create custom element creators](#-factory----create-custom-element-creators)
  - [Predefined Element Creators](#predefined-element-creators)
- [Utilities](#utilities)
  - [uid()](#uid)
  - [uidTime()](#uidtime)
  - [cn()](#cn)
  - [elementClassToggle()](#elementclasstoggle)
  - [debounce()](#debounce)
  - [Query Functions](#query-functions)
- [Persistence](#persistence)
  - [withStorage()](#withstorage)

---

## Core Reactive

### Seidr\<T\>

Creates a reactive observable that automatically updates bound DOM elements.

```typescript
import { Seidr } from '@fimbul-works/seidr';

const count = new Seidr(0);
const name = new Seidr('Alice');
const isActive = new Seidr(false);
```

**Generic Types:**
- `<T>` - The type of value being stored

---

### seidr.value

Get or set the current value. Setting triggers all bindings.

```typescript
const count = new Seidr(0);

count.value = 5;          // Set value
console.log(count.value); // Get value: 5
```

---

### seidr.as()

Create a derived observable that transforms the source value.

```typescript
const count = new Seidr(0);

const doubled = count.as(n => n * 2);         // Seidr<number>
const isEven = count.as(n => n % 2 === 0);    // Seidr<boolean>
const message = count.as(n => `Count: ${n}`); // Seidr<string>

count.value = 5;
console.log(doubled.value);  // 10
console.log(message.value);  // "Count: 5"
```

---

### seidr.observe()

Register a callback that runs when the value changes. Returns a cleanup function.

```typescript
const count = new Seidr(0);

const cleanup = count.observe((value) => {
  console.log(`Count changed to: ${value}`);
});

count.value = 5;  // Logs: "Count changed to: 5"

// When done:
cleanup();
```

---

### seidr.bind()

Manually bind an observable to an object with custom update logic. Returns cleanup function.

```typescript
const count = new Seidr(0);
const display = document.createElement('span');

// Custom transformation function
const cleanup = count.bind(display, (value, el) => {
  el.textContent = value > 5 ? 'Many clicks!' : `Count: ${value}`;
  el.style.color = value > 5 ? 'red' : 'black';
});

count.value = 3;  // display shows "Count: 3" in black
count.value = 7;  // display shows "Many clicks!" in red

// When done:
cleanup();
```

**When to use manual binding:**
- Complex DOM updates (multiple properties, style changes)
- Conditional transformations (different outputs for different values)
- Performance optimization (batch multiple updates)
- Non-standard property updates

---

### seidr.destroy()

Cleanup all observers and derived computations.

```typescript
const count = new Seidr(0);
const doubled = count.as(n => n * 2);

// When done:
count.destroy();

// All observers are cleared, derived values stop updating
```

---

### Seidr.computed()

Create a computed observable that depends on multiple sources.

```typescript
const firstName = new Seidr('John');
const lastName = new Seidr('Doe');

// Computed full name updates when either name changes
const fullName = Seidr.computed(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);

console.log(fullName.value);  // "John Doe"

firstName.value = 'Jane';
console.log(fullName.value);  // "Jane Doe"

lastName.value = 'Smith';
console.log(fullName.value);  // "Jane Smith"
```

**Parameters:**
- `computation` - Function that computes the value
- `dependencies` - Array of Seidr observables this computation depends on

---

## Components

### component()

Create a component with automatic cleanup. Function receives a `scope` object.

```typescript
import { component, Seidr, $div, $span, $button } from '@fimbul-works/seidr';

function UserProfile() {
  return component((scope) => {
    const name = new Seidr('Alice');
    const age = new Seidr(30);

    scope.track(age.bind(ageSpan, (value) => {
      ageSpan.textContent = `Age: ${value}`;
    }));

    return $div({ className: 'user-profile' }, [
      $span({ textContent: name }),
      ageSpan,
      $button({
        textContent: 'Birthday',
        onclick: () => age.value++
      })
    ]);
  });
}

const profile = UserProfile();
document.body.appendChild(profile.element);

// When done:
profile.destroy(); // Cleans up all reactive bindings automatically
```

**Return value:**
```typescript
{
  element: HTMLElement;  // The root element
  destroy: () => void;   // Cleanup function
}
```

---

### createScope()

Creates a cleanup scope for tracking resources.

```typescript
import { createScope } from '@fimbul-works/seidr';

const scope = createScope();

// Track cleanup functions
scope.track(() => console.log('Cleaning up resource 1'));
scope.track(() => console.log('Cleaning up resource 2'));

// When done:
scope.destroy(); // Cleans up all tracked resources and children
```

**Scope methods:**
- `scope.track(cleanupFn)` - Register a cleanup function
- `scope.child()` - Register a child component
- `scope.destroy()` - Run all cleanup functions

---

## Mounting

### mount()

Mount a component to a DOM container.

```typescript
import { mount, component, $div } from '@fimbul-works/seidr';

function Counter() {
  return component(() => $div({ textContent: 'Hello' }));
}

const comp = Counter();
mount(comp, document.body);

// Returns cleanup function
```

---

### mountConditional()

Conditionally mount/unmount a component based on observable value.

```typescript
import { mountConditional, Seidr, component, $div, $button } from '@fimbul-works/seidr';

const isVisible = new Seidr(false);

function DetailsPanel() {
  return component(() => $div({ textContent: 'User Details' }));
}

// Toggle button
document.body.appendChild(
  $button({
    textContent: 'Toggle Details',
    onclick: () => isVisible.value = !isVisible.value
  })
);

// Conditionally mounted panel
mountConditional(
  isVisible,
  () => DetailsPanel(),
  document.body
);

// Component automatically mounts/unmounts with full cleanup
```

---

### mountList()

Efficiently render lists from observable arrays with key-based diffing.

```typescript
import { mountList, Seidr, component, $div, $span, $button, uid } from '@fimbul-works/seidr';

const todos = new Seidr([
  { id: uid(), text: 'Learn Seidr', completed: false },
  { id: uid(), text: 'Build amazing apps', completed: false }
]);

function TodoItem({ todo }) {
  return component(() => $div({ textContent: todo.text }));
}

mountList(
  todos,
  (item) => item.id,                  // Key function
  (item) => TodoItem({ todo: item }), // Component factory
  document.body
);

// Updates efficiently handle additions, removals, and reordering
todos.value = [...todos.value, { id: uid(), text: 'Master reactive programming', completed: false }];
todos.value = todos.value.filter(todo => todo.id !== '1'); // Remove item
```

---

### mountSwitch()

Switch between different components based on observable value with automatic cleanup.

```typescript
import { mountSwitch, Seidr, component, $div } from '@fimbul-works/seidr';

type ViewMode = 'list' | 'grid' | 'table';
const viewMode = new Seidr<ViewMode>('list');

const ListView = () => component(() => $div({ textContent: '📋 List View' }));
const GridView = () => component(() => $div({ textContent: '📊 Grid View' }));
const TableView = () => component(() => $div({ textContent: '📈 Table View' }));

// Automatically switches components with full cleanup
mountSwitch(
  viewMode,
  {
    list: ListView,
    grid: GridView,
    table: TableView
  },
  document.body
);

viewMode.value = 'grid'; // Switches to grid view, destroys list view
```

---

## DOM Elements

### `$` - Create DOM elements

Create DOM elements with reactive props support. Use `$` to create any HTML element.

```typescript
import { $, Seidr } from '@fimbul-works/seidr';

const disabled = new Seidr(false);

const button = $('button', {
  disabled,
  textContent: 'Click me'
}, []);

document.body.appendChild(button);
```

**Parameters:**
- `tag` - HTML tag name
- `props` - Object with element properties (can include Seidr observables)
- `children` - Array of child elements or functions that return elements

**Returned element has additional methods:**
- `element.on<E>(event, handler)` - Add event listener, returns cleanup
- `element.destroy()` - Remove element and cleanup bindings

---

### `$factory()` - Create custom element creators

Create reusable element creator functions with optional default props.

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

**Parameters:**
- `tag` - HTML tag name
- `initialProps` - Default properties to apply to all created elements

**Returns:** A specialized element creator function

---

### Predefined Element Creators

All HTML elements available with `$` prefix:

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

// And 40+ more...
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

## Utilities

### uid()

Generate a unique, time-sorted identifier (UID).

```typescript
import { uid } from '@fimbul-works/seidr';

const id = uid(); // "v67JXa8-2Mj-Ukd7o93r"
const todo = { id, text: 'Learn Seidr' };
```

**Features:**
- ✅ Time-sorted: IDs can be sorted chronologically
- ✅ URL-safe: Only contains alphanumeric characters and hyphens
- ✅ Collision-resistant: Timestamp + process ID + random components
- ✅ Compact: Approximately 20 characters

**Use cases:**
- List item keys for `mountList()`
- Temporary record identifiers
- Client-side entity tracking
- Session identifiers

---

### uidTime()

Extract the creation timestamp from a UID as milliseconds since epoch.

```typescript
import { uid, uidTime } from '@fimbul-works/seidr';

const id = uid();
const createdAt = uidTime(id); // number (milliseconds)
console.log(new Date(createdAt).toISOString()); // "2024-12-22T..."
```

**Examples:**

Sorting by creation time:
```typescript
const items = [
  { id: uid(), text: 'First' },
  { id: uid(), text: 'Second' }
];

// Sort by creation time
items.sort((a, b) => uidTime(a.id) - uidTime(b.id));
```

Filtering by time range:
```typescript
const now = Date.now();
const oneHourAgo = now - 3600000;

// Filter items created in the last hour
const recentItems = items.filter(
  (item) => uidTime(item.id) >= oneHourAgo
);
```

Calculating age:
```typescript
const age = Date.now() - uidTime(item.id);
console.log(`Item is ${age}ms old`);
```

---

### cn()

Utility for conditional class names with reactive support.

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

**Supported formats:**
- Strings: `'base-class'`
- Functions: `() => 'dynamic-class'`
- Observables: `seidr.as(v => v && 'conditional-class')`
- Arrays: `['class1', 'class2']`
- Objects: `{ 'class-name': true/false }`

---

### elementClassToggle()

Reactively toggle a CSS class on an element based on a boolean observable.

```typescript
import { elementClassToggle, Seidr, $button } from '@fimbul-works/seidr';

const isActive = new Seidr(false);
const button = $button({ textContent: 'Click me' });

elementClassToggle(button, 'active', isActive);

isActive.value = true; // Adds 'active' class
isActive.value = false; // Removes 'active' class
```

**Parameters:**
- `element` - The DOM element to toggle the class on
- `className` - The CSS class name to toggle
- `active` - Boolean Seidr that controls the class

---

### debounce()

Type-safe debouncing with proper timeout management.

```typescript
import { debounce } from '@fimbul-works/seidr';

const handleInput = debounce((value: string) => {
  console.log('Searching for:', value);
}, 300);

handleInput('test');
handleInput('testing'); // Only this executes after 300ms
```

---

### Query Functions

Type-safe DOM query utilities.

```typescript
import { $getById, $query, $queryAll } from '@fimbul-works/seidr';

// Get by ID
const element = $getById('my-id');

// Query first match
const button = $query('button.submit');

// Query all matches
const items = $queryAll('.item');

// With custom root
const button = $query('button', customContainer);
const items = $queryAll('.item', customContainer);
```

---

## Persistence

### withStorage()

Bind a Seidr observable to localStorage/sessionStorage with automatic persistence.

```typescript
import { withStorage, Seidr } from '@fimbul-works/seidr';

// Create observable that persists to localStorage
const todos = withStorage(
  'todo-list',
  new Seidr<TodoItem[]>([])
);

// Automatically saved to localStorage
todos.value = [
  { id: 1, text: 'Learn Seidr', completed: true }
];

// On page reload, value is restored from localStorage
```

**Parameters:**
- `key` - Storage key
- `seidr` - The observable to bind
- `storage` - Storage object (defaults to `localStorage`)

**Using sessionStorage:**
```typescript
const sessionData = withStorage(
  'session-key',
  new Seidr('value'),
  sessionStorage
);
```

---

## Documentation-Test Guarantee

All examples in this API documentation are tested automatically. Changes to examples must update tests, preventing documentation drift.

**Test files:**
- `src/seidr.test.ts` - Core reactive tests with documentation examples
- `src/util/*.test.ts` - Utility tests with documentation examples
- `src/dom/*.test.ts` - DOM and component tests with documentation examples

Every example you see here is verified to work correctly ✅
