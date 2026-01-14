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
  - [`Safe()`](#safe)
- [Mounting & Declarative Components](#mounting--declarative-components)
  - [`mount()`](#mount)
  - [`Conditional()`](#conditional)
  - [`List()`](#list)
  - [`Switch()`](#switch)
  - [Shorthand Mounting Utilities](#shorthand-mounting-utilities)
- [Routing](#routing)
  - [`initRouter()`](#initrouter)
  - [`navigate()`](#navigate)
  - [`Route()`](#route)
  - [`Router()`](#router)
  - [`createRoute()`](#createroute)
  - [`Link()`](#link)
  - [`parseRouteParams()`](#parserouteparams)
- [State Management](#state-management)
  - [`createStateKey()`](#createstatekey)
  - [`hasState()`](#hasstate)
  - [`setState()`](#setstate)
  - [`getState()`](#getstate)
- [Utilities](#utilities)
  - [`elementClassToggle()`](#elementclasstoggle)
  - [`bindInput()`](#bindinput)
  - [`uid()`](#uid)
  - [`uidTime()`](#uidtime)
  - [`cn()`](#cn)
  - [`debounce()`](#debounce)
  - [`unwrapSeidr()`](#unwrapseidr)
  - [Query Functions`](#query-functions)
- [Type Guards](#type-guards)
  - [`isUndefined`](#isUndefined)
  - [`isBool`](#isbool)
  - [`isNum`](#isnum)
  - [`isStr`](#isstr)
  - [`isFn`](#isFn)
  - [`isObj`](#isObj)
  - [`isSeidr`](#isseidr)
  - [`isSeidrComponent`](#isseidrcomponent)
  - [`isHTMLElement`](#ishtmlelement)
  - [`isSeidrElement`](#isseidrelement)

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

- `bind<E>():` - Manually bind an observable to an object with custom update logic.

  **Returns:** `CleanupFunction` (signature `() => void`)

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
You can use `Seidr<T>` instances as props on [`SeidrElement`](#seidrelement-type) to update element properties automatically.

```typescript
import { $ } from '@fimbul-works/seidr';

const textContent = new Seidr('');

const div = $('div', { textContent });
textContent.value = 'Hello!';
// div.textContent is now "Hello!"
```

- `destroy():` - Cleanup all observers and derived computations.

#### Static Methods

- `Seidr.computed<C>()` - Create a computed observable that depends on multiple sources.

  **Generic Type:** `C` - The type of the transformed/derived value

  **Parameters:**
  - `computation` - Function that computes the value (signature `(value: T) => U`)
  - `dependencies` - Array of Seidr observables this computation depends on

  **Returns**: Derived [`Seidr<C>`](#seidrt-class) instance

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

// withStorage handles parse errors gracefully by using initial value
// it also ignores quota exceeded errors
```

---
## DOM Elements

### `SeidrElement` type

An extended `HTMLElement` with reactive props support. Use [`$`](#---create-dom-elements) to create any HTML element.

**Returned element has additional methods:**
- `on<E>(event, handler)` - Add event listener, returns cleanup
- `clear()` - Remove all child elements
- `destroy()` - Remove element and cleanup bindings

### `$` - Create DOM elements

Create DOM elements with reactive props support. Use `$` to create any HTML element.

**Parameters:**
- `tag` - HTML tag name
- `props` - Object with element properties (can include [`Seidr<T>`](#seidrt-class) observables)
- `children` - Array of child elements, strings, functions, or [`SeidrComponents`](#component)

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
- `initialProps` - Default properties to apply to all created elements (can include [`Seidr<T>`](#seidrt-class) observables)

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
- `props` - Object with element properties (can include [`Seidr<T>`](#seidrt-class) observables)
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

Create a component with automatic cleanup and automatic child component tracking.

**Parameters:**
- `factory` - Factory function (signature `(props) => SeidrElement`)

**Returns:**

`SeidrComponent` type

```typescript
{
  element: HTMLElement | DocumentFragment; // The element or fragment
  destroy: () => void;                    // Cleanup function
}
```

**Automatic Child Tracking**: Child components created during parent component rendering are automatically tracked and destroyed when the parent is destroyed.

**Using `useScope()`:**

Inside the component factory, call `useScope()` to get the scope object for tracking cleanup:

```typescript
import { component, useScope, Seidr, $div, $span, $button } from '@fimbul-works/seidr';

const UserProfile = component(() => {
  const scope = useScope();
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

const profile = UserProfile();
document.body.appendChild(profile.element);

// When done:
profile.destroy(); // Cleans up all reactive bindings automatically
```

**Components with Props:**

Components can accept parameters for configuration and initial state. Props are passed when creating the component instance:

```typescript
import { component, useScope, Seidr, $div, $button, $span } from '@fimbul-works/seidr';

interface CounterProps {
  initialCount?: number;
  step?: number;
  label?: string;
}

const Counter = component(({ initialCount = 0, step = 1, label = 'Counter' }: CounterProps = {}) => {
  const scope = useScope();
  const count = new Seidr(initialCount);
  const disabled = count.as(value => value >= 10);

  return $div({ className: 'counter' }, [
    $span({ textContent: label }),
    $span({ textContent: count.as(n => `: ${n}`) }),
    $button({
      textContent: `+${step}`,
      disabled,
      onclick: () => count.value += step
    }),
    $button({
      textContent: 'Reset',
      onclick: () => count.value = 0
    })
  ]);
});

// Create multiple instances with different props
const counter1 = Counter({ initialCount: 5, step: 2, label: 'Steps' });
const counter2 = Counter({ initialCount: 0 });  // Uses defaults
const counter3 = Counter({ label: 'Simple' });

// Mount them
document.body.appendChild(counter1.element);
document.body.appendChild(counter2.element);
document.body.appendChild(counter3.element);
```

**Props Best Practices:**
- Destructure props with defaults for optional parameters: `{ prop = default } = {}`
- Use TypeScript interfaces for type safety on props
- Props are captured when the component is created (not when mounted)
- Each component instance has isolated state, even with the same props

**Component Hierarchy with Automatic Tracking**:

```typescript
import { component, $div, $header, $img } from '@fimbul-works/seidr';

const Header = component(() => {
  return $header({ textContent: 'User Profile' });
});

const Avatar = component(() => {
  return $img({ src: '/avatar.png', alt: 'User Avatar' });
});

const UserProfile = component(() => {
  // Child components are automatically tracked
  const header = Header();
  const avatar = Avatar();

  return $div({ className: 'profile' }, [
    header, // SeidrComponent passed directly!
    avatar  // Element automatically extracted
  ]);
});

const profile = UserProfile();

// Destroying profile automatically destroys header and avatar
profile.destroy();
```

---

### Safe()

Create a component with error boundary protection. `Safe` wraps a component factory with error handling. If the factory throws an error during initialization, the error boundary factory is called to create fallback UI.

**Parameters:**
- `factory` - Function that creates the component element: `() => Node`
- `errorBoundaryFactory` - Error handler that returns fallback UI: `(err: Error) => Node`

**Returns:** `SeidrComponent`

```typescript
import { Safe, useScope, $div, $h2, $p } from '@fimbul-works/seidr';

const UserProfile = Safe(
  () => {
    const scope = useScope();
    // Component initialization that might fail
    // Note: Safe() only catches synchronous errors!
    const data = JSON.parse('invalid json');
    return $div({ textContent: data.name });
  },
  (err) => {
    const scope = useScope();
    // Error boundary: return fallback UI
    return $div({ className: 'error' }, [
      $h2({ textContent: 'Error Occurred' }),
      $p({ textContent: err.message })
    ]);
  }
);
```

**Error Boundary Behavior**:

- **Scope Cleanup**: Original component scope is destroyed before error boundary is called
- **Fresh Scope**: Error boundary receives a new `ComponentScope` for tracking its own resources (via `useScope()`)
- **Root Components**: Errors in root components without `Safe` wrapper are logged to console
- **Resource Tracking**: Error boundary can track its own cleanup functions via `scope.track()`

```typescript
import { Safe, useScope, $div } from '@fimbul-works/seidr';

const SafeComponent = Safe(
  () => {
    const scope = useScope();
    // Track resources
    scope.track(() => console.log('Component cleanup'));

    throw new Error('Failed');
    return $div();
  },
  (err) => {
    const scope = useScope();
    // Error boundary gets its own scope for resource tracking
    scope.track(() => console.log('Error boundary cleanup'));

    return $div({ textContent: 'Fallback UI' });
  }
);

SafeComponent.destroy();
// Logs:
// - "Component cleanup" (from failed component)
// - "Error boundary cleanup" (from error boundary)
```

---

## Mounting & Declarative Components

Seidr provides declarative components for handling conditional logic and lists. These components use **Marker Nodes** (HTML comments) internally, allowing them to act like "Fragments" that don't introduce extra wrapper elements into the DOM.

### mount()

Mount a component to a DOM container.

**Parameters:**
- `component` - [`SeidrComponent`](#component) to mount
- `container` - DOM element

**Returns:** Function that unmounts and destroys the component when called.

```typescript
import { mount, component, $div } from '@fimbul-works/seidr';

const App = component(() => $div({ textContent: 'Hello Seidr' }));

const unmount = mount(App(), document.getElementById('app')!);

// Later
unmount();
```

---

### Conditional()

Conditionally renders a component based on a boolean observable.

**Parameters:**
- `condition` - [`Seidr<boolean>`](#seidrt-class) observable
- `factory` - Function that returns a [`SeidrComponent`](#component) or DOM Node

**Returns:** A [`SeidrComponent`](#component) rooted in a Comment node.

**Example:**
```typescript
import { Conditional, Seidr, component, $div } from '@fimbul-works/seidr';

const isVisible = new Seidr(false);
const MyComp = component(() => $div({ textContent: 'I am here' }));

const view = component(() => {
  return $div({ className: 'container' }, [
    Conditional(isVisible, MyComp)
  ]);
});

// Behavior:
isVisible.value = true;
// container contains: <div>I am here</div><!--seidr-conditional:...-->
```

---

### List()

Renders a dynamic list of components from an observable array with optimized key-based diffing.

**Parameters:**
- `observable` - [`Seidr<T[]>`](#seidrt-class) array observable
- `getKey` - Function to extract unique key: `(item: T) => string | number`
- `factory` - Function to create components: `(item: T) => SeidrComponent`

**Returns:** A [`SeidrComponent`](#component) rooted in a Comment node.

**Example:**
```typescript
import { List, Seidr, component, $li, $ul, uid } from '@fimbul-works/seidr';

const items = new Seidr([{ id: uid(), text: 'Item 1' }]);
const Item = (data) => component(() => $li({ textContent: data.text }));

const list = component(() => {
  return $ul({}, [
    List(items, i => i.id, i => Item(i))
  ]);
});
```

---

### Switch()

Switches between different components based on an observable value.

**Parameters:**
- `observable` - [`Seidr<T>`](#seidrt-class) observable
- `cases` - Object or Map: `{ [key: string]: () => SeidrComponent }`
- `defaultCase?` - Optional fallback factory function

**Returns:** A [`SeidrComponent`](#component) rooted in a Comment node.

**Example:**
```typescript
import { Switch, Seidr, component, $div } from '@fimbul-works/seidr';

const mode = new Seidr('A');

const view = component(() => {
  return $div({}, [
    Switch(mode, {
      A: () => component(() => $div({ textContent: 'View A' })),
      B: () => component(() => $div({ textContent: 'View B' }))
    }, () => component(() => $div({ textContent: 'Default' })))
  ]);
});
```

---

### Shorthand Mounting Utilities

The following functions are shorthands that create the corresponding declarative component and call `mount()` immediately. Use these for top-level application mounting.

#### `mountConditional(condition, factory, container)`
Equivalent to `mount(Conditional(condition, factory), container)`.

#### `mountList(observable, getKey, factory, container)`
Equivalent to `mount(List(observable, getKey, factory), container)`.

#### `mountSwitch(observable, cases, container)`
Equivalent to `mount(Switch(observable, cases), container)`.

---

## Routing

Seidr provides a simple yet powerful client-side routing system that works seamlessly with SSR. The routing components react to URL changes and automatically render the matching route.

### initRouter()

Initialize the Seidr router and set up browser history listeners.

**Parameters:**
- `path` - Optional initial path (defaults to `window.location.pathname` on client)

**Returns:** Cleanup function that removes event listeners

```typescript
import { initRouter } from '@fimbul-works/seidr';

// Initialize with current URL
const cleanup = initRouter();

// Initialize with specific path (useful for SSR)
const cleanup = initRouter('/home');

// Later cleanup
cleanup();
```

**Important:** Always call `initRouter()` once when your application starts, typically after mounting your root component.

---

### navigate()

Navigate to a new path programmatically.

**Parameters:**
- `path` - The path to navigate to

```typescript
import { navigate } from '@fimbul-works/seidr';

// Navigate to a path
navigate('/about');
navigate('/user/123');

// Query strings and hashes are stripped automatically
navigate('/about?ref=twitter');  // Navigates to '/about'
```

**Note:** `navigate()` updates the browser's history using `pushState()`, so the back button works automatically.

---

### Route()

Conditionally render a component when the current URL path matches a pattern.

**Parameters:**
- `pattern` - Path pattern (string with `:params`) or RegExp
- `componentFactory` - Function that creates the component when matched
- `pathState` - Optional path state observable (defaults to global `currentPath`)

**Returns:** Conditional component that mounts when pattern matches

```typescript
import { Route, component, $div, initRouter } from '@fimbul-works/seidr';

initRouter();

// String pattern with parameters
const UserPage = (params?: Seidr<{id: string}>) => component(() =>
  $div({ textContent: params.as(p => `User ${p.id}`) })
);

Route('/user/:id', UserPage);

// RegExp pattern with named groups
const BlogPost = (params?: Seidr<{slug: string}>) => component(() =>
  $div({ textContent: params.as(p => `Post: ${p.slug}`) })
);

Route(/^\/blog\/(?<slug>[a-z0-9-]+)$/, BlogPost);
```

**Pattern Syntax:**
- `:param` - Matches any path segment (e.g., `/user/:id` matches `/user/123`)
- Trailing slashes are automatically normalized (`/about/` === `/about`)

---

### Router()

Collection of routes that renders the first matching pattern, with optional fallback.

**Parameters:**
- `routes` - Array of route definitions (use `createRoute()`)
- `fallback` - Optional component to render when no routes match

**Returns:** Router component (renders as a comment marker)

```typescript
import { Router, createRoute, component, $div, initRouter } from '@fimbul-works/seidr';

initRouter();

const Home = component(() => $div({ textContent: 'Home' }));
const About = component(() => $div({ textContent: 'About' }));
const NotFound = component(() => $div({ textContent: '404 - Not Found' }));

const App = Router({
  routes: [
    createRoute('/', Home),
    createRoute('/about', About),
    createRoute('/user/:id', UserPage),
  ],
  fallback: NotFound,
});
```

**Route Precedence:** Routes are evaluated in order. More specific routes should come before less specific ones:

```typescript
const App = Router({
  routes: [
    createRoute('/users/admin', AdminPanel),  // Must come first!
    createRoute('/users/:id', UserProfile),
    createRoute(/^\/users\/.+$/, UsersList),
  ],
});
```

---

### createRoute()

Helper function to create a route definition for `Router()`.

**Parameters:**
- `pattern` - Path pattern or RegExp
- `componentFactory` - Factory function that receives optional params observable

**Returns:** Route definition object

```typescript
import { createRoute, component, $div, Seidr } from '@fimbul-works/seidr';

const UserPage = (params?: Seidr<{id: string}>) => component(() =>
  $div({ textContent: params.as(p => `User ${p.id}`) })
);

createRoute('/user/:id', UserPage);
```

---

### Link()

Navigation link component that updates the URL reactively and can show active state.

**Props (extends ReactiveProps):**
- `to` - Target path (string or reactive Seidr observable)
- `tagName` - HTML tag name (defaults to `"a"`)
- `activeClass` - CSS class when active (defaults to `"active"`)
- `activeProp` - Property to set when active (defaults to `"className"`)
- `activeValue` - Value for activeProp (defaults to `activeClass`)
- All standard HTML element props

```typescript
import { Link, component, $div, $nav } from '@fimbul-works/seidr';

const Navigation = component(() => $nav({}, [
  Link({ to: '/' }, ['Home']),
  Link({ to: '/about' }, ['About']),
  Link({ to: '/contact' }, ['Contact']),
]));

// Custom active class
Link({ to: '/dashboard', activeClass: 'is-current' }, ['Dashboard']);

// Use aria-current for accessibility
Link({
  to: '/page',
  activeProp: 'aria-current',
  activeValue: 'page',
}, ['Page']);

// Reactive target path
const currentPath = new Seidr('/home');
Link({ to: currentPath }, ['Home']);
```

**Active State:** The link automatically shows the active class/prop when `currentPath` matches the `to` prop.

---

### parseRouteParams()

Parse route parameters from a path pattern (lower-level utility).

**Parameters:**
- `pattern` - Path pattern with `:param` syntax
- `path` - URL pathname to match

**Returns:** Parameter object or `false` if no match

```typescript
import { parseRouteParams } from '@fimbul-works/seidr';

const params = parseRouteParams('/user/:id/edit', '/user/123/edit');
// params === { id: '123' }

const noMatch = parseRouteParams('/user/:id', '/other');
// noMatch === false
```

---

## State Management

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

### bindInput()

Create two-way binding props for form input elements. Automatically syncs input changes with a [`Seidr<string>`](#seidrt-class) observable.

**Parameters:**
- `observable` - String [Seidr](#seidrt-class) to bind to the input

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

### unwrapSeidr()

Utility to safely extract the value from a Seidr observable or return non-Seidr values as-is.

**Generic Type:** `T` - Type of value to unwrap

**Parameters:**
- `value` - A Seidr observable or a plain value

**Returns:** The unwrapped value of type `T`

This utility is particularly useful when working with functions that accept both Seidr observables and plain values, and you need to access the underlying value without checking types manually.

```typescript
import { unwrapSeidr, Seidr } from '@fimbul-works/seidr';

// Unwrap a Seidr observable
const observable = new Seidr('test value');
const value = unwrapSeidr(observable); // 'test value'

// Return non-Seidr values as-is
const plainValue = unwrapSeidr('plain string'); // 'plain string'
const number = unwrapSeidr(42); // 42

// Works with null and undefined
const nullValue = unwrapSeidr(null); // null
const undefinedValue = unwrapSeidr(undefined); // undefined

// Useful in utilities that handle both reactive and static values
function logValue(value: Seidr<string> | string) {
  console.log(unwrapSeidr(value));
}

logValue(new Seidr('reactive')); // 'reactive'
logValue('static'); // 'static'
```

**Common use case:** Used internally by components like `Link` to normalize path comparisons when the `to` prop can be either a string or a Seidr observable.

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

### isUndefined()

Check if a value is `undefined`.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `undefined`

```typescript
import { isUndefined } from '@fimbul-works/seidr';

let maybeUndefined: string | undefined;

maybeUndefined = undefined;
if (isUndefined(maybeUndefined)) {
  // TypeScript knows: maybeUndefined is undefined
}

maybeUndefined = 'defined';
console.log(isUndefined(maybeUndefined)); // false
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

### isSeidrComponent()

Check if a value is a [SeidrComponent](#component) object.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `SeidrComponent`

```typescript
import { isSeidrComponent, component, $div } from '@fimbul-works/seidr';

const factory = component(() => $div());
const comp = factory();
const plainObj = { value: 0 };

console.log(isSeidrComponent(comp));     // true
console.log(isSeidrComponent(plainObj)); // false
console.log(isSeidrComponent(42));       // false
```

---

### isHTMLElement()

Check if a value is a `HTMLElement` or [`ServerHTMLElement`](SSR.md) instance.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `HTMLElement`

```typescript
import { isHTMLElement, $div } from '@fimbul-works/seidr';

const el = document.createElement('div');
const seidrEl = $div();
const plainObj = { value: 0 };

console.log(isHTMLElement(el));       // true
console.log(isHTMLElement(seidrEl));  // true
console.log(isHTMLElement(plainObj)); // false
console.log(isHTMLElement(42));       // false
```

---

### isSeidrElement()

Check if a value is a [`SeidrElement`](#seidrelement-type) instance.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `SeidrElement`

```typescript
import { isSeidrElement, $div } from '@fimbul-works/seidr';

const seidrEl = $div();
const el = document.createElement('div');
const plainObj = { value: 0 };

console.log(isHTMLElement(seidrEl));  // true
console.log(isHTMLElement(el));       // false
console.log(isHTMLElement(plainObj)); // false
console.log(isHTMLElement(42));       // false
```

---

## Environment Utilities

Utilities for managing code that runs in both browser and server (SSR) environments.

### inBrowser()

Executes a function only in the browser environment. Useful for client-side side effects like DOM APIs, `localStorage`, or third-party libraries. Return value is `undefined` on the server.

**Parameters:**
- `fn` - Function to execute: `() => T`

**Returns:** The result of `fn()`, or `undefined` on the server.

```typescript
import { inBrowser } from '@fimbul-works/seidr';

inBrowser(() => {
  const width = window.innerWidth;
  console.log('Window width:', width);
});
```

---

### inServer()

Executes a function only in the server (SSR) environment.

**Async Support:** If the function returns a `Promise`, `renderToString` will automatically await it before generating the final HTML. This is the recommended way to perform data fetching during SSR.

**Parameters:**
- `fn` - Function to execute: `() => T`

**Returns:** The result of `fn()`, or `undefined` in the browser.

```typescript
import { inServer, Seidr } from '@fimbul-works/seidr';

const data = new Seidr(null);

inServer(async () => {
  const response = await fetch('https://api.example.com/data');
  data.value = await response.json();
  // renderToString waits for this to complete!
});
```

---

### isServer() / isBrowser()

Functions that return a boolean indicating the current environment. These are dynamic and safe to use in tests.

```typescript
import { isServer, isBrowser } from '@fimbul-works/seidr';

if (isServer()) {
  console.log('Running on Node.js');
}

if (isBrowser()) {
  console.log('Running in the browser');
}
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](README.md)
