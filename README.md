![Seidr](seidr-logo.svg)

Build reactive user interfaces with **build step optional** and **kilobyte scale footprint**. Seidr brings reactive bindings, lifecycle management, and type-safe components to vanilla JavaScript/TypeScript.

**Seiðr** - Old Norse for "magic of influence and causality"

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
- [Performance](#-performance)
- [Browser Support](#-browser-support)

## ✨ Features

- 🪄 **Reactive Bindings** - Observable to DOM attribute binding
- 🎯 **Type-Safe Props** - TypeScript magic for reactive HTML attributes
- 🏗️ **Component System** - Lifecycle management with automatic cleanup
- 📦 **Tiny Footprint** - 5.6KB (minified + gzipped)
- 🔧 **Functional API** - Simple, composable functions for DOM creation
- ⚡ **Zero Dependencies** - Pure TypeScript, build step optional
- 🌲 **Tree-Shakable** - Import only what you need

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

Seidr embraces **tradeoffs explicitly**:

- **No virtual DOM** → Faster updates, more predictable performance, but manual DOM management
- **One class only** → Simpler mental model, but you must understand observables deeply
- **Functional API** → Composable and testable, but requires functional programming thinking
- **Explicit cleanup** → No memory leaks, but requires understanding lifecycle

This is infrastructure for developers who have felt the pain of framework abstractions and want something that gets out of the way.

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
import { component, useScope, mount, Seidr, $div, $button, $span } from '@fimbul-works/seidr';

const Counter = component(() => {
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
});

// Mount component
mount(Counter(), document.body);
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

// Create an observable with initial value
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
const filteredItems = items.as(items => {
  const query = searchQuery.value.toLowerCase();
  return query
    ? items.filter(item => item.name.toLowerCase().includes(query))
    : items;
});
```

**What happens:** `filteredItems` is now a reactive value that automatically updates whenever:
- `items` changes (if you add/remove items)
- `searchQuery` changes (when user types)

#### Step 3: Bind to DOM
```typescript
import { $input, $ul, $li } from '@fimbul-works/seidr';

// Create input bound to search query
const searchInput = $input({
  type: 'text',
  placeholder: 'Search...',
  // Two-way binding: observable -> DOM and DOM -> observable
  value: searchQuery.value,
  oninput: (e) => searchQuery.value = e.target.value
});
```

**What happens:**
- Initial render: input shows `searchQuery.value` (empty string)
- User types "App": `oninput` fires → `searchQuery.value` becomes "App"
- `filteredItems` automatically recomputes → `[{ id: 1, name: 'Apple' }]`

#### Step 4: Create Component with List Rendering
```typescript
import { component, useScope, List } from '@fimbul-works/seidr';

const SearchApp = component(() => {
  const scope = useScope();
  // All state created inside component
  const searchQuery = new Seidr('');
  const items = new Seidr([
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' }
  ]);

  const filteredItems = items.as(items => {
    const query = searchQuery.value.toLowerCase();
    return query
      ? items.filter(item => item.name.toLowerCase().includes(query))
      : items;
  });

  const searchInput = $input({
    type: 'text',
    placeholder: 'Search...',
    value: searchQuery.value,
    oninput: (e) => searchQuery.value = e.target.value
  });

  return $div({}, [
    searchInput,
    // List component with key-based diffing
    $ul({}, [
      List(
        filteredItems,
        (item) => item.id,
        (item) => $li({ textContent: item.name })
      )
    ])
  ]);
});
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

const app = SearchApp();
const cleanup = mount(app, document.body);

// App is now interactive
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

**Learn more:** [Seidr<T>](API.md#seidrt)

### Derived Values

Transform observables with `.as()` for computed values that update automatically.

```typescript
const count = new Seidr(0);
const doubled = count.as(n => n * 2);
const message = count.as(n => n > 5 ? 'Many!' : `Count: ${n}`);
```

**Learn more:** [seidr.as()](API.md#seidras) | [Seidr.computed()](API.md#seidrcomputed)

### Components

Components are functions, not classes. Use `component()` for automatic cleanup of reactive bindings.

```typescript
const UserProfile = component(() => {
  const scope = useScope();
  const name = new Seidr('Alice');

  // scope.track() registers cleanup functions
  scope.track(name.bind(element, (value) => {
    element.textContent = value;
  }));

  return $div({ textContent: name });
});
```

#### Components with Props

Components accept parameters for configuration and initial state:

```typescript
const Counter = component(({ initialCount = 0, step = 1 } = {}) => {
  const scope = useScope();
  const count = new Seidr(initialCount);
  const disabled = count.as(value => value >= 10);

  return $div({ className: 'counter' }, [
    $span({ textContent: count.as(n => `Count: ${n}`) }),
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

// Usage: Create component instances with different props
const counter1 = Counter({ initialCount: 5, step: 2 });
const counter2 = Counter({ initialCount: 0 });  // Uses defaults

mount(counter1, document.body);
```

**Key Points:**
- Props are passed when creating the component (not when mounting)
- Each component instance has its own isolated state
- Props can include initial values, configuration, or callbacks
- Destructuring with defaults (`= {}`) makes props optional

**Learn more:** [component()](API.md#component) | [Manual bindings](API.md#seidrbind)

### Mounting

Mount components to DOM or use them as children in other components.

```typescript
// For direct DOM mounting (top-level)
mount(MyComponent(), document.body);

// Conditional rendering as a child
$div({}, [
  Conditional(isVisible, () => DetailsPanel())
]);

// List rendering as a child with key-based diffing
$ul({}, [
  List(todos, item => item.id, item => TodoItem({ item }))
]);

// Switch between components as a child
$div({}, [
  Switch(viewMode, {
    list: () => ListView(),
    grid: () => GridView()
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

- **Core:** [Seidr<T>](API.md#seidrt) | [.as()](API.md#seidras) | [.observe()](API.md#seidrobserve) | [.bind()](API.md#seidrbind) | [Seidr.computed()](API.md#seidrcomputed)
- **Components:** [component()](API.md#component) | [createScope()](API.md#createscope)
- **Mounting:** [mount()](API.md#mount) | [mountConditional()](API.md#mountconditional) | [mountList()](API.md#mountlist) | [mountSwitch()](API.md#mountswitch)
- **DOM:** [$()](API.md#---create-dom-elements) | [$factory()](API.md#factory---create-custom-element-creators) | [Predefined elements](API.md#predefined-element-creators)
- **Utilities:** [uid()](API.md#uid) | [uidTime()](API.md#uidtime) | [cn()](API.md#cn) | [elementClassToggle()](API.md#elementclasstoggle) | [debounce()](API.md#debounce)
- **Persistence:** [withStorage()](API.md#withstorage)

---

## 🌐 Server-Side Rendering (Experimental)

> ⚠️ **Experimental** - Server-Side Rendering support is currently experimental and may change in future versions.

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
import { component, useScope, $, Seidr, renderToString } from '@fimbul-works/seidr';

const App = component(() => {
  const scope = useScope();
  const count = new Seidr(0);

  return $('div', {}, [
    $('p', { textContent: count.as(n => `Count: ${n}`) }),
    $('button', {
      textContent: 'Increment',
      onclick: () => count.value++
    })
  ]);
});

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
- **Seidr counter app**: ~1.7KB (minified + gzipped)

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
comp.destroy(); // All bindings cleaned up automatically
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
- ES Modules support

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
