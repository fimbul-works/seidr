# Seidr

Build reactive user interfaces with **zero build step** and **kilobyte scale footprint**. Seidr brings reactive bindings, lifecycle management, and type-safe components to vanilla JavaScript/TypeScript.

**Seiðr** - Old Norse for "magic of influence and causality"

[![npm version](https://badge.fury.io/js/%40fimbul-works%2Fseidr.svg)](https://www.npmjs.com/package/@fimbul-works/seidr)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/microsoft/TypeScript)

## Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Core Concepts](#-core-concepts)
- [Advanced Patterns](#-advanced-patterns)
- [API Reference](#-api-reference)
- [Server-Side Rendering](#-server-side-rendering-experimental)
- [Performance](#-performance)
- [Browser Support](#-browser-support)

## ✨ Features

- 🪄 **Reactive Bindings** - Observable to DOM attribute binding
- 🎯 **Type-Safe Props** - TypeScript magic for reactive HTML attributes
- 🏗️ **Component System** - Lifecycle management with automatic cleanup
- 📦 **Tiny Footprint** - 2.1KB core, 4.2KB full bundle (minified + gzipped)
- 🔧 **Functional API** - Simple, composable functions for DOM creation
- ⚡ **Zero Dependencies** - Pure TypeScript, build step optional
- 🌲 **Tree-Shakable** - Import only what you need

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
import { component, mount, Seidr, $div, $button, $span } from '@fimbul-works/seidr';

function Counter() {
  return component((scope) => {
    const count = new Seidr(0);
    const disabled = count.as(value => value >= 10);

    return $div({
      className: 'counter',
      style: 'padding: 20px; border: 1px solid #ccc;'
    }, [
      $span({ textContent: count }), // Automatic reactive binding!
      $button({
        textContent: 'Increment',
        disabled, // Reactive boolean binding!
        onclick: () => count.value++
      }),
      $button({
        textContent: 'Reset',
        onclick: () => count.value = 0
      })
    ]);
  });
}

// Mount component
mount(Counter(), document.body);
```

## 🎯 Core Concepts

Seidr has a simple philosophy: **one class**, everything else is *utility functions*. The only class is `Seidr<T>` - a reactive observable that manages state and automatically updates bound DOM elements.

### Reactive State

State is stored in `Seidr<T>` observables. Create them, pass them to element props, and Seidr handles the rest.

```typescript
import { Seidr, $input } from '@fimbul-works/seidr';

const disabled = new Seidr(false);
const input = $input({ disabled }); // That's it!

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
function UserProfile() {
  return component((scope) => {
    const name = new Seidr('Alice');

    // scope.track() registers cleanup functions
    scope.track(name.bind(element, (value) => {
      element.textContent = value;
    }));

    return $div({ textContent: name });
  });
}
```

**Learn more:** [component()](API.md#component) | [Manual bindings](API.md#seidrbind)

### Mounting

Mount components conditionally, as lists, or switch between them.

```typescript
// Conditional rendering
mountConditional(isVisible, () => DetailsPanel(), container);

// List rendering with key-based diffing
mountList(todos, item => item.id, item => TodoItem({ item }), container);

// Switch between components
mountSwitch(viewMode, { list: ListView, grid: GridView }, container);
```

**Learn more:** [Mounting](API.md#mounting)

### Two-Way Form Binding

Bind form inputs to observables with automatic synchronization:

```typescript
import { Seidr, $input, $span, $div } from '@fimbul-works/seidr';

// Helper for two-way binding
function bindInput(observable: Seidr<string>) {
  return {
    value: observable.value,
    oninput: (e: Event) => {
      observable.value = (e.target as HTMLInputElement).value;
    }
  };
}

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
import { renderToString } from '@fimbul-works/seidr/node';
import { component, $, Seidr } from '@fimbul-works/seidr/node';

function App() {
  return component((scope) => {
    const count = new Seidr(0);

    return $('div', {}, [
      $('p', { textContent: count.as(n => `Count: ${n}`) }),
      $('button', {
        textContent: 'Increment',
        onclick: () => count.value++
      })
    ]);
  });
}

// In your server route (must be async!)
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
- **Seidr counter app**: ~1.5KB (minified + gzipped)

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

### Browser Bundles

Pre-built ESM bundles are available for direct browser use:

```html
<!-- Use the full bundle (recommended) -->
<script type="module">
  import { Seidr, $div, $button } from './dist/seidr.js';

  // Your code here
  const count = new Seidr(0);
  const div = $div({ textContent: count.as((count) => `Count: ${count}`) }, [
    $button({ textContent: 'OK' })
  ]);
</script>

<!-- Or use the core bundle (without predefined element creators or SSR hydration) -->
<script type="module">
  import { Seidr, $ } from './dist/seidr.core.js';

  // Your code here
  const count = new Seidr(0);
  const div = $d('div', { textContent: count.as((count) => `Count: ${count}`) }, [
    $('button', { textContent: 'OK' })
  ]);
</script>
```

**Bundle sizes (minified):**
- `seidr.js` - 10.1KB (4.2KB gzipped)
- `seidr.core.js` - 4.7KB (2.0KB gzipped)

For library consumers, use the package through npm and let your bundler handle the imports.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
