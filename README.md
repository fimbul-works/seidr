![Seidr](seidr-logo.svg)

**Batteries-included** reactivity in a **kilobyte-sized** package. Seidr brings type-safe components, routing, and SSR to vanilla JavaScript/TypeScript with **build step optional**.

**Seiðr** - Old Norse for *"magic of influence and causality."*

[![npm version](https://badge.fury.io/js/%40fimbul-works%2Fseidr.svg)](https://www.npmjs.com/package/@fimbul-works/seidr)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/microsoft/TypeScript)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@fimbul-works/seidr)](https://bundlephobia.com/package/@fimbul-works/seidr)

## Table of Contents

- [Features](#-features)
- [When to Use Seidr](#-when-to-use-seidr)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Conceptual Overview](#-conceptual-overview)
- [Core Concepts](#-core-concepts)
- [API Reference](#-api-reference)
- [Server-Side Rendering](#-server-side-rendering-experimental)
- [Animation](#-animation)
- [Performance](#-performance)
- [Browser Support](#-browser-support)

## ✨ Features

- 🔋 **Batteries Included** - Built-in Router, SSR engine, and Global State
- 🪄 **Reactive Bindings** - Observable to DOM attribute binding
- 🎯 **Type-Safe Props** - TypeScript magic for reactive HTML attributes
- 🔧 **Functional API** - Simple, composable functions for DOM creation
- 📦 **Tiny Footprint**
  - Hello World: **2.7KB**
  - Full Stack (Router + SSR): **7.5KB**
  - Tree-shakable: Import only what you need
- ⚡ **Zero Dependencies** - Pure TypeScript, build step optional
- 🏗️ **Ready for SSR** - Automatic state capture and hydration

## 🎯 When to Use Seidr

Seidr is designed for developers who value **control, correctness, and deliberate engineering**. It's not the right tool for every project.

### ✅ Ideal Use Cases

**Small to Medium-Sized Applications**
- SPAs where bundle size matters
- Interactive widgets and components
- Browser extensions with size constraints
- Progressive enhancement of server-rendered pages

**Projects That Benefit From**
- Direct DOM manipulation without virtual DOM overhead
- Explicit lifecycle management (no hidden re-renders)
- Type-safe reactive bindings
- Build step optional (or minimal build setup)
- Full TypeScript support with advanced type inference

**Teams That Prefer**
- Functional programming patterns over class hierarchies
- Explicit over implicit (no magic, just functions)
- Understanding how their tools work internally
- Control over performance characteristics

### ❌ Consider Alternatives When

**You Need**
- A rich ecosystem of pre-built components (use React, Vue)
- Complex routing and state management out of the box (use Next.js, SvelteKit)
- Learning resources for junior developers (use more mainstream frameworks)
- Built-in dev tools and debugging experiences (use React DevTools, Vue DevTools)

**Your Team**
- Is primarily focused on rapid prototyping over long-term maintainability
- Prefers convention over configuration
- Doesn't want to think about cleanup and memory management
- Needs extensive community support and third-party integrations

### 🎨 The Philosophy

Seidr embraces **fact-based tradeoffs**:

- **No virtual DOM** → Faster updates, more predictable performance, but manual DOM management
- **One class only** → Simpler mental model, but you must understand observables deeply
- **Explicit over Implicit** → You control the reactivity graph manually if needed

This is infrastructure for developers who want a "batteries included" framework (Router, SSR, Global State) without the bloat of a Virtual DOM or build-step requirement.

## 📦 Installation

```bash
npm install @fimbul-works/seidr
```

Or using your preferred package manager:

```bash
yarn add @fimbul-works/seidr
pnpm install @fimbul-works/seidr
```

## 🚀 Quick Start

```typescript
import { useScope, mount, Seidr, $div, $button, $span } from '@fimbul-works/seidr';

const Counter = () => {
  const scope = useScope();
  const count = new Seidr(0);
  const disabled = count.as(value => value >= 10);

  return $div({
    className: 'counter',
    style: 'padding: 20px; border: 1px solid #ccc;'
  }, [
    $span({ textContent: count }), // Automatic reactive binding
    $button({
      textContent: 'Increment',
      disabled, // Reactive boolean binding
      onclick: () => count.value++
    }),
    $button({
      textContent: 'Reset',
      onclick: () => count.value = 0
    })
  ]);
};

mount(Counter, document.body);
```

## 🧠 Conceptual Overview

Before diving into the details, it helps to understand Seidr's mental model. This section walks through the complete flow from state to reactivity to cleanup.

### The Three Pillars

**1. Observables (`Seidr<T>`)**
- The only class in Seidr
- Holds a value and notifies listeners when it changes
- Think "reactive variable" not "state management system"

**2. Bindings**
- Connect observables to DOM properties
- Automatically update when the observable changes
- No manual DOM manipulation needed

**3. Cleanup**
- Every binding returns a cleanup function
- Components track their bindings and clean up automatically
- No memory leaks when components are destroyed

### A Complete Flow: From State to UI to Cleanup

Let's build a simple search filter step by step:

#### Step 1: Create State
```typescript
import { Seidr } from '@fimbul-works/seidr';

// Create observables with initial values
const searchQuery = new Seidr('');
const items = new Seidr([
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' }
]);
```

#### Step 2: Derive Filtered Results
```typescript
// Create derived observable that filters based on search
const filteredItems = Seidr.computed(() => {
  const query = searchQuery.value.toLowerCase();
  return query
    ? items.filter(item => item.name.toLowerCase().includes(query))
    : items;
}, [items, searchQuery]);
```

**What happens:** `filteredItems` is now a reactive value that automatically updates whenever:
- `items` changes (if you add/remove items)
- `searchQuery` changes (when user types)

#### Step 3: Bind to DOM
```typescript
import { $input, bindInput } from '@fimbul-works/seidr';

// Create input bound to search query
const searchInput = $input({
  type: 'text',
  placeholder: 'Search...',
  // Two-way binding: observable -> DOM -> observable
  ...bindInput(searchQuery),
});
```

**What happens:**
- Initial render: input shows `searchQuery.value` (empty string)
- User types "app": `oninput` fires → `searchQuery.value` becomes "app"
- `filteredItems` automatically recomputes → `[{ id: 1, name: 'Apple' }]`

#### Step 4: Create Component with List Rendering
```typescript
import { Seidr, $input, bindInput, $div, $ul, List, $li } from '@fimbul-works/seidr';

const SearchApp = () => {
  const searchQuery = new Seidr('');
  const items = new Seidr([
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' }
  ]);

  const filteredItems = Seidr.computed(() => {
    const query = searchQuery.value.toLowerCase();
    return query
      ? items.filter(item => item.name.toLowerCase().includes(query))
      : items;
  }, [items, searchQuery]);

  const searchInput = $input({
    type: 'text',
    placeholder: 'Search...',
    ...bindInput(searchQuery),
  });

  return $div({}, [
    searchInput,
    $ul({}, [
      // List component with key-based diffing
      List(
        filteredItems,
        (item) => item.id,
        (item) => $li({ textContent: item.name })
      )
    ])
  ]);
};
```

**What happens:**
- `List` component tracks `filteredItems` observable
- When `filteredItems` changes:
  - Diff algorithm finds changed/added/removed items
  - Updates only affected DOM elements
  - No full re-render

#### Step 5: Mount and Automatic Cleanup
```typescript
import { mount } from '@fimbul-works/seidr';

const cleanup = mount(SearchApp, document.body);

// SearchApp is now interactive
// - User types → searchQuery updates → filteredItems recomputes → list updates
// - All reactive bindings work automatically

// When done, cleanup everything:
cleanup();
// - All reactive bindings disconnected
// - All event listeners removed
// - All DOM elements removed
// - No memory leaks
```

### The Mental Model

**Think in Graphs, Not Trees**

```
searchQuery (root)
    ↓
items (root) → filteredItems (derived) → list rendering
```

- **Root observables** (`searchQuery`, `items`) hold actual data
- **Derived observables** (`filteredItems`) transform data
- **Bindings** connect observables to DOM

**The Flow:**
1. User action changes root observable
2. Change propagates through derived observables
3. Bindings update DOM elements directly
4. No virtual DOM, no diffing entire component trees

### The Execution Model

Seidr follows a "Push-Based" reactive model. Unlike React (which pulls updates by re-rendering) or Svelte (which compiles reactivity into statements), Seidr pushes updates directly to the specific DOM properties that need them.

```text
[ User Action ]
      │
      ▼
[ Root Observable (Seidr) ] ──▶ [ Cleanup Tracking (Scope) ]
      │
      ▼
[ Derived Observables (Seidr.computed or instance.as) ]
      │
      ▼
[ DOM Bindings ($props) ] ──▶ [ Real DOM Updates ]
```

**What this means for you:**
- **Zero re-renders:** A component function only ever runs *once*.
- **O(1) updates:** Changing a value updates only the specific bound nodes, regardless of tree size.
- **Predictable memory:** You decide when things are created and destroyed via scopes.

**Benefits:**
- **Predictable:** You know exactly what updates when
- **Efficient:** Only changed DOM elements update
- **Simple:** One-way data flow, no cycles
- **Type-safe:** TypeScript tracks observable types through derivations

### Key Takeaways

1. **Seidr instances are the source of truth** - all state flows from them
2. **Derived values are automatic** - no manual recomputation needed
3. **Cleanup is automatic** - components track and clean up their bindings
4. **Direct DOM manipulation** - no virtual DOM means predictable performance

This model gives you **control** without **complexity**. You understand exactly what's happening, but you don't have to manage the details manually.

## 🎯 Core Concepts

Seidr is built around `Seidr<T>` - a reactive observable that manages state and automatically updates bound DOM elements. All other features are composable utility functions.

### Reactive State

State is stored in `Seidr<T>` observables. Create them, pass them to element props, and Seidr handles the rest.

```typescript
import { Seidr, $input } from '@fimbul-works/seidr';

const disabled = new Seidr(false);
const input = $input({ disabled });

disabled.value = true; // Input instantly becomes disabled
```

**Learn more:** [`Seidr`](API.md#seidrt)

### Derived Values

Transform observables with `.as()` and `.computed()` for derived values that update automatically.

```typescript
const count = new Seidr(0);
const doubled = count.as(n => n * 2);
const message = count.as(n => n > 5 ? 'Many!' : `Count: ${n}`);
```

**Learn more:** [`instance.as()`](API.md#seidr-as) | [`Seidr.computed()`](API.md#seidr-computed)

### Components

Seidr components are simple functions that return UI elements. They are lightweight, easy to test, and have full access to Seidr's reactivity and lifecycle management.

```typescript
import { useScope, Seidr, $div, $span, $button } from '@fimbul-works/seidr';

const UserProfile = ({ name, initialAge = 30 }) => {
  const scope = useScope(); // Access component lifecycle
  const age = new Seidr(initialAge);

  // Track custom cleanup logic
  scope.track(() => console.log('Profile destroyed'));

  return $div({ className: 'user-profile' }, [
    $span({ textContent: name }),
    $span({ textContent: age.as(a => `Age: ${a}`) }),
    $button({
      textContent: 'Birthday',
      onclick: () => age.value++
    })
  ]);
};
```

> **The Magic:** When you mount a function using `mount()`, `List()`, `Conditional()`, or `Switch()`, Seidr automatically provides a reactive scope. This means `useScope()` and automatic cleanup work perfectly in plain functions!

#### Creating Reusable Factories with `component()`

If you need to create a reusable component factory that can be passed around as a single unit, or if you need to manually instantiate a component instance, you can use the `component()` wrapper:

```typescript
import { component } from '@fimbul-works/seidr';

// Returns a factory function
const CounterFactory = component(({ start = 0 }) => {
  const count = new Seidr(start);
  return $button({
    textContent: count,
    onclick: () => count.value++
  });
});

// Usage
const counter1 = CounterFactory({ start: 10 }); // Returns a SeidrComponent instance
mount(counter1, container);
```

#### Components with Props

Components accept parameters for configuration and initial state through plain function arguments:

```typescript
const Counter = ({ initialCount = 0, step = 1 } = {}) => {
  const count = new Seidr(initialCount);
  const disabled = count.as(value => value >= 10);

  return $div({ className: 'counter' }, [
    $span({ textContent: count.as(n => `Count: ${n}`) }),
    $button({
      textContent: `+${step}`,
      disabled,
      onclick: () => count.value += step
    })
  ]);
};

// Usage
mount(Counter, document.body);
```

**Key Points:**
- Props are passed when creating the component (not when mounting)
- Each component instance has its own isolated state
- Props can include initial values, configuration, or callbacks
- Destructuring with defaults (`= {}`) makes props optional

**Learn more:** [component()](API.md#component) | [Manual bindings](API.md#seidrbind)

### Memory Management

Seidr automatically cleans up reactive bindings created within a component. However, for external resources like intervals, event listeners, or network connections, you should use the `useScope()` hook to track cleanup and avoid memory leaks.

```typescript
// ❌ WRONG: Leaks memory when component is destroyed
const BadComponent = () => {
  const count = new Seidr(0);

  // This interval keeps running even after component is unmounted!
  setInterval(() => count.value++, 1000);

  return $div({ textContent: count });
};

// ✅ CORRECT: Cleanup tracked automatically
const GoodComponent = () => {
  const scope = useScope();
  const count = new Seidr(0);

  const interval = setInterval(() => count.value++, 1000);
  scope.track(() => clearInterval(interval));

  return $div({ textContent: count });
};
```

### Mounting

Mount components to DOM or use them as children in other components.

```typescript
// For direct DOM mounting (top-level)
mount(MyComponent, document.body);

// Conditional rendering as a child
$div({}, [
  Conditional(isVisible, DetailsPanel)
]);

// List rendering as a child with key-based diffing
$ul({}, [
  List(todos, item => item.id, item => TodoItem({ item }))
]);

// Switch between components as a child
$div({}, [
  Switch(viewMode, {
    list: ListView,
    grid: GridView
  })
]);
```

**Shorthand utilities for direct DOM mounting:**
```typescript
// Mount directly to DOM (equivalent to mount(Conditional(...), container))
mountConditional(isVisible, () => DetailsPanel(), container);

// Mount directly to DOM (equivalent to mount(List(...), container))
mountList(todos, item => item.id, item => TodoItem({ item }), container);

// Mount directly to DOM (equivalent to mount(Switch(...), container))
mountSwitch(viewMode, { list: ListView, grid: GridView }, container);
```

**Learn more:** [Mounting](API.md#mounting--declarative-components)

### Two-Way Form Binding

Bind form inputs to observables with automatic synchronization:

```typescript
import { Seidr, $input, $span, $div, bindInput } from '@fimbul-works/seidr';

const searchText = new Seidr('');

const searchComponent = $div({}, [
  $input({
    type: 'text',
    placeholder: 'Search...',
    ...bindInput(searchText)
  }),
  $span({ textContent: searchText.as(t => `Searching: ${t}`) })
]);
```

### Persistent State

Automatically persist observables to localStorage/sessionStorage:

```typescript
import { withStorage, Seidr } from '@fimbul-works/seidr';

// Create observable that persists to localStorage
const todos = withStorage(
  'todo-list',
  new Seidr<TodoItem[]>([])
);

// Automatically saved to localStorage
todos.value = [{ id: 1, text: 'Learn Seidr', completed: true }];

// On page reload, value is restored from localStorage
```

**Learn more:** [withStorage()](API.md#withstorage)

### Global State Management
Seidr provides a simple, type-safe global state management system via the `useState()` hook.

> ⚠️ **Crucial Difference from React:** Unlike React's `useState` which is local to a specific component instance, Seidr's `useState` is **Global**. It uses a singleton pattern: every call with the same key returns the exact same observable instance, effectively acting as "Shared State" across your entire application.

```typescript
import { useState, $button, $span } from '@fimbul-works/seidr';

// 1. Use the hook with a unique key
const Counter = () => {
  const [userCount, setUserCount] = useState<number>('user-count');

  // 2. Initialize if needed (or let it be undefined)
  if (userCount.value === undefined) {
      setUserCount(0);
  }

  // 3. Bind and update
  return $button({
    textContent: userCount.as(n => `Users: ${n}`),
    onclick: () => setUserCount(userCount.value! + 1)
  });
};
```

**SSR Best Practice:** The `useState` hook is safe for SSR because it resolves the state context lazily when called, ensuring that state is isolated per-request during server rendering.

**Learn more:** [useState()](API.md#usestate)

### Custom Element Factories

Create reusable element creators with default props:

```typescript
import { $factory } from '@fimbul-works/seidr';

// Create custom factories
const $primaryButton = $factory('button', { className: 'btn btn-primary' });
const submitButton = $primaryButton({ textContent: 'Submit' });
```

**Learn more:** [$factory()](API.md#factory---create-custom-element-creators)

## 📚 API Reference

For complete API documentation with all methods, parameters, and examples, see **[API.md](API.md)**.

Quick links:

- **Core:** [Seidr<T>](API.md#seidrt-class) | [.as()](API.md#seidr-as) | [.observe()](API.md#seidr-observe) | [.bind()](API.md#seidr-bind) | [Seidr.computed()](API.md#seidr-computed)
- **Components:** [useScope()](API.md#components-functions) | [component()](API.md#component) | [Safe()](API.md#safe) | [bindInput()](API.md#bindinput)
- **Mounting:** [mount()](API.md#mount) | [Conditional()](API.md#conditional) | [List()](API.md#list) | [Switch()](API.md#switch)
- **DOM:** [$()](API.md#---create-dom-elements) | [$factory()](API.md#factory---create-custom-element-creators) | [Predefined Elements](API.md#predefined-element-creators)
- **Routing:** [Router()](API.md#router) | [Route()](API.md#route) | [Link()](API.md#link) | [navigate()](API.md#navigate)
- **Utilities:** [random()](API.md#random) | [cn()](API.md#cn) | [withStorage()](API.md#withstorage) | [Type Guards](API.md#type-guards)
- **State:** [useState()](API.md#usestate) | [setState()](API.md#setstate) | [getState()](API.md#getstate) | [createStateKey()](API.md#createstatekey)
- **Environment:** [inClient() / inServer()](API.md#environment-utilities)

---

## 🌐 Server-Side Rendering (Experimental)

> ⚠️ **Experimental** - While the SSR API is stable and likely to remain unchanged, the server-side DOM implementation is currently experimental and doesn't support all `HTMLElement` functionality. It is suitable for most UI rendering but may require environment-specific guards (`inClient`, `inServer`) for complex DOM manipulations.

Seidr provides SSR support with automatic state capture and client-side hydration. This allows you to render your Seidr applications on the server and make them interactive on the client.

**Key Features:**
- 🖥️ Server-side HTML rendering with `renderToString()`
- 💾 Automatic state capture and dependency graph traversal
- 🔄 Client-side hydration with `hydrate()`
- 📦 Compact numeric ID-based hydration data
- 🔒 Render context isolation using AsyncLocalStorage (Node.js)

**Quick Start:**

```typescript
// Server-side (Node.js)
import { useScope, $, Seidr, renderToString } from '@fimbul-works/seidr';

const App = () => {
  const count = new Seidr(0);

  return $('div', {}, [
    $('p', { textContent: count.as(n => `Count: ${n}`) }),
    $('button', {
      textContent: 'Increment',
      onclick: () => count.value++
    })
  ]);
};

// In your server route (must be async for AsyncLocalStorage context!)
app.get('/', async (req, res) => {
  const { html, hydrationData } = await renderToString(App);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <script>window.__HYDRATION_DATA__ = ${JSON.stringify(hydrationData)}</script>
      </head>
      <body>
        <div id="app">${html}</div>
        <script type="module" src="/client.js"></script>
      </body>
    </html>
  `);
});
```

```typescript
// Client-side
import { hydrate } from '@fimbul-works/seidr';
import { App } from './app.js';

const hydrationData = window.__HYDRATION_DATA__;
hydrate(App, document.getElementById('app'), hydrationData);
```

**Learn more:** **[SSR.md](SSR.md)** - Complete SSR documentation with examples, best practices, and gotchas.

## 🌊 Animation

For high-performance animations, I recommend **[flaedi](https://www.npmjs.com/package/@fimbul-works/flaedi)**, my sub-1KB promise-based animation engine. It is designed to work seamlessly with Seidr observables.

```bash
npm install @fimbul-works/flaedi
```

```typescript
import { Seidr } from '@fimbul-works/seidr';
import { tween, easeOutExpo } from '@fimbul-works/flaedi';

const opacity = new Seidr(0);

// Smoothly animate observable value from 0 to 1
await tween(opacity, 'value', 1, 500, easeOutExpo);
```

**[Read the full documentation](https://www.npmjs.com/package/@fimbul-works/flaedi)**

## ⚡ Performance

Seidr's direct DOM manipulation approach offers several performance advantages:

### Surgical Updates
Only changed elements are updated with no virtual DOM diffing overhead.

```typescript
const count = new Seidr(0);
const display = $span({ textContent: count });

// Only the span's textContent is updated, nothing else
count.value++;
```

### No Reconciliation
Unlike React/Vue, Seidr doesn't need to diff component trees. Updates go straight to the DOM.

### Minimal Bundle Impact
- **React counter app**: ~42KB (React + ReactDOM)
- **Vue counter app**: ~35KB (Vue runtime)
- **Seidr counter app**: ~2.9KB (minified + gzipped)

> **Note on Tree-Shaking:** The ~7.5KB footprint includes the entire library (Router, SSR engine, etc.). If your project only uses core reactivity and elements, your baseline bundle will be significantly smaller.

### Efficient List Rendering
Key-based diffing ensures minimal DOM operations:

```typescript
// Only removes 1 element, doesn't re-render entire list
todos.value = todos.value.filter(t => t.id !== 3);
```

### Memory Safety
Automatic cleanup prevents memory leaks from abandoned subscriptions:

```typescript
const comp = MyComponent();
comp.unmount(); // All bindings cleaned up automatically
```

## 🌐 Browser Support

Seidr works in all modern browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

**Requires:**
- ES6 Class support
- ES6 Map/Set support

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
