# Seidr SSR Documentation

Seidr provides Server-Side Rendering with automatic state capture and client-side hydration. It is designed to be "Dual-Mode," allowing your components to run on the server to generate HTML and on the client to become interactive without code duplication.

> ⚠️ **Experimental** — SSR support is a work-in-progress and may change in future versions.

## Key Features

- 🖥️ Server-side HTML rendering with `renderToString()`
- 💾 Automatic state capture and dependency graph traversal
- 🔄 Client-side hydration with `hydrate()`
- 📦 Compact numeric ID-based hydration data
- 🔒 Render context isolation using AsyncLocalStorage (Node.js)

## 🚀 Quick Start

### Server-Side (Node.js)

```typescript
import { renderToString, Seidr } from '@fimbul-works/seidr';
import { component, $div, $ul, $li, List, setState, getState, createStateKey, isUndefined } from '@fimbul-works/seidr';

// Create state key
const todosKey = createStateKey<Seidr<Todo[]>>('todos');

// Component works on both server and client - can be a plain function!
export const TodoApp = (todos?: Seidr<Todo[]>) => {
  // Dual-mode: server sets, client retrieves from hydration
  if (!isUndefined(todos)) {
    setState(todosKey, todos);
  } else {
    todos = getState(todosKey);
  }

  return $div({ className: 'todo-app' }, [
    $ul({}, [
      List(todos, (item) => item.id, (item) => $li({ textContent: item.text }))
    ])
  ]);
};

// Server route handler
app.get('/', async (req, res) => {
  // Fetch data from database
  const todos = await db.query('SELECT * FROM todos');

  // Create Seidr with server data and render
  const todosState = new Seidr(todos);
  const { html, hydrationData } = await renderToString(TodoApp, todosState);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>My App</title></head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__SEIDR_HYDRATION_DATA__ = ${JSON.stringify(hydrationData)};
        </script>
        <script type="module" src="/client.js"></script>
      </body>
    </html>
  `);
});
```

### Client-Side

```typescript
import { hydrate } from '@fimbul-works/seidr';
import { TodoApp } from './TodoApp.js';

// Hydrate WITHOUT props - component retrieves from hydration data
const container = document.getElementById('app');
const hydrationData = window.__SEIDR_HYDRATION_DATA__;

hydrate(TodoApp, container, hydrationData);
// App is now interactive!
```

---

## 🗂️ Architecture: Runtime Graph Reconstruction

Seidr uses a unique **Runtime Graph Reconstruction** strategy (also known as "State-First Hydration") that fundamentally differs from how React, Vue, or Svelte handle server-side rendering.

Instead of serializing and re-hydrating the **Component Tree**, Seidr hydrates the **Dependency Graph**.

### How It Works

**1. During SSR** - Seidr tracks the creation order of observables ("sources of truth"):

```typescript
const count = new Seidr(0);           // ID: 0 (Source)
const doubled = count.as(n => n * 2); // ID: 1 (Derived)
```

**2. Minimal Payload** - The server sends **only the root source values**. Derived values, component props, and binding logic are **not** sent.

```json
{
  "observables": {
    "0": 0  // Only this single number is sent!
  }
}
```

**3. Implicit Reconstruction** - As the client executes your component functions, the dependency graph **rebuilds itself**:
- `new Seidr(0)` is called -> Seidr checks the hydration payload for ID `0`, finds the value `0`.
- `.as(...)` is called -> Seidr re-establishes the derivation logic.
- The derived value `doubled` automatically re-computes itself from the hydrated source.
- DOM bindings automatically re-attach to these new instances.

## SSR API Reference

### renderToString()

Render a component to HTML with hydration data capture.

**Parameters:**
- `factory` - Function that returns a Seidr component
- `props?` - Optional props to pass to the component
- `options?` - Options object or legacy SSRScope parameter:
  - `initialPath?` - Initial URL path for routing (defaults to "/")
  - `scope?` - Optional existing SSR scope (creates new one if not provided)

**Returns:**
- `html` - Rendered HTML string
- `hydrationData` - Data for client-side restoration

```typescript
// Basic usage
const { html, hydrationData } = await renderToString(App);

// With props
const state = new Seidr(todos);
const { html, hydrationData } = await renderToString(App, state);

// With initial path for routing
const { html, hydrationData } = await renderToString(App, null, {
  initialPath: req.path
});
```

---

### hydrate()

Hydrate server-rendered HTML on the client.

**Parameters:**
- `factory` - Function that returns a Seidr component
- `container` - DOM element to mount into
- `hydrationData` - Hydration data from server

**Returns:** The hydrated component

```typescript
hydrate(App, document.getElementById('app'), window.__SEIDR_HYDRATION_DATA__);
```

---

### isClient()

Returns `true` if the code is running in the browser environment.

```typescript
import { isClient } from '@fimbul-works/seidr';

if (isClient()) {
  console.log('Running in the browser');
}
```

---

### isServer()

Returns `true` if the code is running in the server (SSR) environment.

```typescript
import { isServer } from '@fimbul-works/seidr';

if (isServer()) {
  console.log('Running on Node.js');
}
```

---

### inClient()

Executes a function only in the browser environment. Useful for client-side side effects like DOM APIs, `localStorage`, or third-party libraries. Return value is `undefined` on the server.

**Parameters:**
- `fn` - Function to execute: `() => T`

**Returns:** The result of `fn()`, or `undefined` on the server.

```typescript
import { inClient } from '@fimbul-works/seidr';

inClient(() => {
  const width = window.innerWidth;
  console.log('Window width:', width);
});
```

---

### inServer()

Executes a function only in the server (SSR) environment.

**Async Support:** If the function returns a `Promise`, [`renderToString`](#rendertostring) will automatically await it before generating the final HTML. This is the recommended way to perform data fetching during SSR.

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

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
