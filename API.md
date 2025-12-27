# Seidr API Reference

## Table of Contents

- [Core Reactive](#core-reactive)
  - [`Seidr<T>` class](#seidrt-class)
  - [`withStorage()`](#withstorage)
- [DOM Elements](#dom-elements)
  - [`SeidrElement` type](#seidrelement-type)
  - [`$` - Create DOM elements](#---create-dom-elements)
  - [`$factory()` - Create custom element creators](#factory---create-custom-element-creators)
  - [Predefined Element Creators](#predefined-element-creators)
- [Components](#components)
  - [`component()`](#component)
  - [`createScope()`](#createscope)
- [Mounting](#mounting)
  - [`mount()`](#mount)
  - [`mountConditional()`](#mountconditional)
  - [`mountList()`](#mountlist)
  - [`mountSwitch()`](#mountswitch)
- [State Management](#state-management)
  - [`State<T>` class](#statet-class)
  - [`createStateKey()`](#createstatekey)
  - [`hasState()`](#hasstate)
  - [`setState()`](#setstate)
  - [`getState()`](#getstate)
- [Utilities](#utilities)
  - [`elementClassToggle()`](#elementclasstoggle)
  - [`uid()`](#uid)
  - [`uidTime()`](#uidtime)
  - [`cn()`](#cn)
  - [`debounce()`](#debounce)
  - [Query Functions`](#query-functions)
- [Type Guards](#type-guards)
  - [`isUndef`](#isundef)
  - [`isBool`](#isbool)
  - [`isNum`](#isnum)
  - [`isStr`](#isstr)
  - [`isFn`](#isFn)
  - [`isObj`](#isObj)
  - [`isSeidr`](#isseidr)

---

## Core Reactive

### `Seidr<T>` class

Creates a reactive observable that automatically updates bound DOM elements.

```typescript
import { Seidr } from '@fimbul-works/seidr';

const count = new Seidr(0);
const name = new Seidr('Alice');
const isActive = new Seidr(false);
```

**Generic Type:** `T` - The type of value being stored

#### Fields
- `value` - Get or set the current value. Setting triggers all bindings.

```typescript
const count = new Seidr(0);

count.value = 5;          // Set value
console.log(count.value); // Get value: 5

```

#### Methods

- `as<U>():` - Create a derived observable that transforms the source value.

  **Generic Type:** `U` - The type of the transformed/derived value

  **Parameters:**
  - `transform` - Tranforming function (signature `(value: T) => Seidr<U>`)

  **Returns**: Derived [`Seidr<U>`](#seidrt-class) instance

```typescript
const count = new Seidr(0);

const doubled = count.as(n => n * 2);         // Seidr<number>
const isEven = count.as(n => n % 2 === 0);    // Seidr<boolean>
const message = count.as(n => `Count: ${n}`); // Seidr<string>

count.value = 5;
console.log(doubled.value);  // 10
console.log(message.value);  // "Count: 5"
```

- `observe():` - Register a callback that runs when the value changes

  **Parameters:**
  - `handler` - Callback function (signature `(value: T) => void`)

  **Returns:** Cleanup function

```typescript
const count = new Seidr(0);

const cleanup = count.observe((value) => {
  console.log(`Count changed to: ${value}`);
});

count.value = 5;  // Logs: "Count changed to: 5"

// When done:
cleanup();
```

- `bind<E>():` - Manually bind an observable to an object with custom update logic. Returns cleanup function.

  **Generic Type:** `E` - The type being bound to

  **Parameters:**
  - `target` - Target value to apply changes to
  - `handler` - Callback function (signature `(value: T, target: E) => void`)

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
You can use `Seidr<T>` instances as props on [`SaidrElement`](#seidrelement-type) to update element properties automatically.

```typescript
import { $ } from '@fimbul-works/seidr';

const textContent = new Seidr('');

const div = $('div', { textContent });
textContent.value = 'Hello!';
// div.textContnt is now "Hello!"
```

- `destroy():` - Cleanup all observers and derived computations.

#### Static Methods

- `Seidr.computed<C>()` - Create a computed observable that depends on multiple sources.

  **Generic Type:** `C` - The type of the transformed/derived value

  **Parameters:**
  - `computation` - Function that computes the value (signature `(value: T) => U`)
  - `dependencies` - Array of Seidr observables this computation depends on

  **Returns**: Derived [`Saidr<C>`](#seidrt-class) instance

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

---

### withStorage()

Bind a [`Seidr<T>`](#seidrt-class) observable to localStorage/sessionStorage with automatic persistence.

**Parameters:**
- `key` - Storage key
- `seidr` - The observable to bind
- `storage` - Optiona Storage object (defaults to `localStorage`)

**Returns:** The same [`Seidr<T>`](#seidrt-class) observable

```typescript
const sessionData = withStorage(
  'session-key',
  new Seidr('value'),
  sessionStorage
);
```

---
## DOM Elements

### `SeidrElement` type

An extendd `HTMLElement` with reactive props support. Use [`$`](#---create-dom-elements) to create any HTML element.

**Returned element has additional methods:**
- `on<E>(event, handler)` - Add event listener, returns cleanup
- `clear()` - Remove all child elements
- `destroy()` - Remove element and cleanup bindings

### `$` - Create DOM elements

Create DOM elements with reactive props support. Use `$` to create any HTML element.

**Parameters:**
- `tag` - HTML tag name
- `props` - Object with element properties (can include [`Seidr<T>`](#seidt-class) observables)
- `children` - Array of child elements or functions that return elements

**Returns:** [`SeidrElement`](#seidrelement-type)

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

### `$factory()` - Create custom element creators

Create reusable element creator functions with optional default props.

**Parameters:**
- `tag` - HTML tag name
- `props` - Object with element properties (can include Seidr observables)
- `initialProps` - Default properties to apply to all created elements (can include [`Seidr<T>`](#seidt-class) observables)

**Returns:** [`SeidrElement`](#seidrelement-type)

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

### Predefined Element Creators

All HTML elements available with `$` prefix:

**Parameters:**
- `props` - Object with element properties (can include [`Seidr<T>`](#seidt-class) observables)
- `children` - Array of child elements or functions that return elements

**Returns:** [`SeidrElement`](#seidrelement-type)

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

## Components

### component()

Create a component with automatic cleanup. Function receives a [`scope`](#createscope) object.

**Parameters:**
- `factory` - Factory function (signature `(scope) => SeidrElement`)

**Returns:**

`SeidrComponent` type

```typescript
{
  readonly isRootComponent; // Is this the root component
  element: HTMLElement;     // The root element
  destroy: () => void;      // Cleanup function
}
```

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

---

### createScope()

Creates a cleanup scope for tracking resources.

**Returns** New `scope` object

**Scope methods:**
- `scope.track(cleanupFn)` - Register a cleanup function
- `scope.child(component)` - Register a child [component](#component)
- `scope.destroy()` - Run all cleanup functions

```typescript
import { createScope } from '@fimbul-works/seidr';

const scope = createScope();

// Track cleanup functions
scope.track(() => console.log('Cleaning up resource 1'));
scope.track(() => console.log('Cleaning up resource 2'));

// When done:
scope.destroy(); // Cleans up all tracked resources and children
```

---

## Mounting

### mount()

Mount a component to a DOM container.

**Generic Type:** `C` extends [`SeidrElement`](#seidrelement-type) - Type returned by `componentFactory`

**Parameters:**
- `component` - [`SeidrComponent`](#component) to mount
- `container` - DOM element

**Returns:** Fnction that unmounts the component when called

```typescript
import { mount, component, $div } from '@fimbul-works/seidr';

function Counter() {
  return component(() => $div({ textContent: 'Hello' }));
}

const unmount = mount(Counter(), document.body);

// Unmount
unmount();
```

---

### mountConditional()

Conditionally mount/unmount a component based on observable value.

**Generic Type:** `C` extends [`SeidrElement`](#seidrelement-type) - Type returned by `componentFactory`

**Parameters:**
- `condition` - [`Seidr<boolean>`](#seidrt-class)
- `componentFactory` - Function that returns [`component`](#component)
- `container` - DOM element

**Returns:** Function that unmounts the component when called

```typescript
import { mountConditional, Seidr, component, $div, $button } from '@fimbul-works/seidr';

const isVisible = new Seidr(false);

function DetailsPanel() {
  return component(() => $div({ textContent: 'User Details' }));
}

// Conditionally mounted panel
const unmount = mountConditional(
  isVisible,
  () => DetailsPanel(),
  document.body
);

isVisible = true; // DetailsPanel is created

// Unmount
unmount();
```

---

### mountList()

Render lists from observable arrays with key-based diffing.

**Generic Types:**
- `T` - The type of list items
- `I` - The type of unique item keys (`string` or `number`)
- `C` - The type of [`SeidrElement`](#seidrelement-type) returned by `componentFactory`

**Parameters:**
- `observable` - [`Seidr<T[]>`](#seidrt-class) observable containing the list data
- `getKey` - Function that extracts a key from array element (signature `(T) => I`)
- `componentFactory` - Function that returns [`component`](#component)
- `container` - DOM element

**Returns:** Function that unmounts the components when called

```typescript
import { mountList, Seidr, component, $div, $span, $button, uid } from '@fimbul-works/seidr';

const todos = new Seidr([
  { id: uid(), text: 'Learn Seidr', completed: false },
  { id: uid(), text: 'Build amazing apps', completed: false }
]);

function TodoItem({ todo }) {
  return component(() => $div({ textContent: todo.text }));
}

const unmount = mountList(
  todos,
  (item) => item.id,                  // Key function
  (item) => TodoItem({ todo: item }), // Component factory
  document.body
);

// Updates efficiently handle additions, removals, and reordering
todos.value = [...todos.value, { id: uid(), text: 'Master reactive programming', completed: false }];
todos.value = todos.value.filter(todo => todo.id !== '1'); // Remove item

// Unmount
unmount();
```

---

### mountSwitch()

Switch between different components based on observable value with automatic cleanup.

**Generic Types:**
- `T` - The key type for switching (typically string literals)
- `C` - The type of [`SeidrElement`](#seidrelement-type) returned by `componentFactory`

**Parameters:**
- `observable` - [`Seidr<T>`](#seidrt-class) observable containing the current switch key
- `componentMap` - Object mapping keys to [`component`](#component) factory functions
- `container` - DOM element

**Returns:** Function that unmounts the component when called

```typescript
import { mountSwitch, Seidr, component, $div } from '@fimbul-works/seidr';

type ViewMode = 'list' | 'grid' | 'table';
const viewMode = new Seidr<ViewMode>('list');

const ListView = () => component(() => $div({ textContent: '📋 List View' }));
const GridView = () => component(() => $div({ textContent: '📊 Grid View' }));
const TableView = () => component(() => $div({ textContent: '📈 Table View' }));

// Automatically switches components with full cleanup
const unmount = mountSwitch(
  viewMode,
  {
    list: ListView,
    grid: GridView,
    table: TableView
  },
  document.body
);

viewMode.value = 'grid'; // Switches to grid view, destroys list view

// Unmount
unmount();
```

---
## State Management

### State Class

Type-safe container for storing application state values.

**Generic Type:** `T` - Type of value being stored

**Fields:**
- `value` - Get the stored value

```typescript
import { State } from '@fimbul-works/seidr';

const counterState = new State(0);
console.log(counterState.value); // 0

// Works with complex types
const userState = new State({
  name: 'Alice',
  age: new Seidr(30),
});

// use InferStateType to extract the type
type UserType =  InferStateType<typeof userState>;

const user = userState.value;
console.log(user.name);      // 'Alice'
console.log(user.age.value); // 30
```

---

### createStateKey()

Create a type-safe state key for application-level state storage.

```typescript
import { createStateKey, setState, getState } from '@fimbul-works/seidr';

const THEME = createStateKey<string>('theme');
const USER_ID = createStateKey<number>('userId');
const SETTINGS = createStateKey<{ theme: string }>('settings');
```

**Generic Type:** `T` - The type of value that will be stored

**Returns:** A unique `symbol` that carries type information

---
### hasState()

Check if application state exists for a given key.

**Generic Types:** `T` - Type of value stored in `key`

**Parameters:**
- `key` - The state key (from `createStateKey()`)

**Returns:** `true` if state exists, `false` otherwise

```typescript
import { createStateKey, setState, hasState, getState } from '@fimbul-works/seidr';

const SETTINGS = createStateKey<object>('settings');

console.log(hasState(SETTINGS)); // false

setState(SETTINGS, { theme: 'dark' });
console.log(hasState(SETTINGS)); // true

if (hasState(SETTINGS)) {
  const settings = getState(SETTINGS);
  console.log(settings.theme);   // 'dark'
}
```

---

### setState()

Store application state for a given key. State is isolated by render context for SSR.

**Generic Types:** `T` - Type of value stored in `key`

**Parameters:**
- `key` - The state key (from `createStateKey()`)
- `value` - The value to store

```typescript
import { createStateKey, setState } from '@fimbul-works/seidr';

const COUNTER = createStateKey<number>('counter');

setState(COUNTER, 42);
setState(COUNTER, 100); // Overwrites previous value
```

---

### getState()

Retrieve application state for a given key. Throws if state doesn't exist.

**Generic Types:** `T` - Type of value stored in `key`

**Parameters:**
- `key` - The state key (from `createStateKey()`)

**Returns:** The stored value

**Throws:** Error if state doesn't exist for the key

```typescript
import { createStateKey, setState, getState } from '@fimbul-works/seidr';

const COUNTER = createStateKey<number>('counter');

setState(COUNTER, 42);
const counter = getState(COUNTER); // Type: number

console.log(counter); // 42
```

---

## Utilities

### elementClassToggle()

Reactively toggle a CSS class on an element based on a boolean observable.

**Parameters:**
- `element` - The DOM element to toggle the class on
- `className` - The CSS class name to toggle
- `active` - Boolean [Seidr](#seidrt-class) that controls the class

```typescript
import { elementClassToggle, Seidr, $button } from '@fimbul-works/seidr';

const isActive = new Seidr(false);
const button = $button({ textContent: 'Click me' });

elementClassToggle(button, 'active', isActive);

isActive.value = true;  // Adds 'active' class
isActive.value = false; // Removes 'active' class
```

---

### uid()

Generate a unique identifier (UID).

**Returns** Time sorted, URL-safe ~20 characters long (UID) tring.

```typescript
import { uid } from '@fimbul-works/seidr';

const id = uid(); // "v67JXa8-2Mj-Ukd7o93r"
```

---

### uidTime()

Extract the creation timestamp from a [(UID)](#uid) as milliseconds since epoch.

**Parameters:**
- `uid` - [UID](#uid) string

**Returns:** Timestamp as milliseconds since epoc

```typescript
import { uid, uidTime } from '@fimbul-works/seidr';

const id = uid();
const createdAt = uidTime(id); // number (milliseconds)
console.log(new Date(createdAt).toISOString()); // "2024-12-22T..."
```

---

### cn()

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

### debounce()

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

### Query Functions

Type-safe DOM query utilities.

#### `$getById<T>`

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

#### `$query<T>`

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

#### `$queryAll<T>`

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

## Type Guards

Utility functions to check types at runtime with proper TypeScript type narrowing.

### isUndef()

Check if a value is `undefined`.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `undefined`

```typescript
import { isUndef } from '@fimbul-works/seidr';

let maybeUndefined: string | undefined;

maybeUndefined = undefined;
if (isUndef(maybeUndefined)) {
  // TypeScript knows: maybeUndefined is undefined
}

maybeUndefined = 'defined';
console.log(isUndef(maybeUndefined)); // false
```

---

### isBool()

Check if a value is a boolean primitive.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `boolean`

**Note:** Returns `false` for `Boolean` objects (use primitive booleans)

```typescript
import { isBool } from '@fimbul-works/seidr';

console.log(isBool(true));  // true
console.log(isBool(false)); // true
console.log(isBool(1));     // false
console.log(isBool('true')); // false
```

---

### isNum()

Check if a value is a number.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `number`

**Note:** Returns `false` for `Number` objects (use primitive numbers)

```typescript
import { isNum } from '@fimbul-works/seidr';

console.log(isNum(42));       // true
console.log(isNum(-3.14));    // true
console.log(isNum(Infinity)); // true
console.log(isNum(NaN));      // true (NaN is number type)
console.log(isNum('42'));     // false
```

---

### isStr()

Check if a value is a string.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `string`

**Note:** Returns `false` for `String` objects (use primitive strings)

```typescript
import { isStr } from '@fimbul-works/seidr';

console.log(isStr('hello'));  // true
console.log(isStr(''));       // true
console.log(isStr('123'));    // true
console.log(isStr(123));      // false
```

---

### isFn()

Check if a value is a function.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `Function`

```typescript
import { isFn } from '@fimbul-works/seidr';

const fn = () => {};
const asyncFn = async () => {};

console.log(isFn(fn));       // true
console.log(isFn(asyncFn));  // true
console.log(isFn(class {})); // true (class constructors)
console.log(isFn({}));       // false
```

---

### isObj()

Check if a value is a plain object (not array, not null, not function).

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `object`

```typescript
import { isObj } from '@fimbul-works/seidr';

console.log(isObj({}));           // true
console.log(isObj({ a: 1 }));     // true
console.log(isObj([]));           // false (arrays)
console.log(isObj(null));         // false (null)
console.log(isObj(() => {}));     // false (functions)
```

---

### isSeidr()

Check if a value is a [Seidr](#seidrt-class) instance.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `Seidr<any>`

```typescript
import { isSeidr, Seidr } from '@fimbul-works/seidr';

const count = new Seidr(0);
const derived = count.as(n => n * 2);
const plainObj = { value: 0 };

console.log(isSeidr(count));    // true
console.log(isSeidr(derived));  // true
console.log(isSeidr(plainObj)); // false
console.log(isSeidr(42));       // false
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](README.md)
