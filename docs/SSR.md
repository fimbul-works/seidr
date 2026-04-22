# Seidr SSR Documentation

Seidr provides Server-Side Rendering with automatic state capture and client-side hydration. It is designed to be *"Dual-Mode"*, allowing your components to run on the server to generate HTML and on the client to become interactive without code duplication.

## Key Features

- 🖥️ Server-side HTML rendering with `renderToString()`
- 🔄 Client-side hydration with `hydrate()`
- 💾 Automatic state capture and dependency graph traversal
- 🏗️ Component Tree Serialization for deterministic hydration
- 📦 Compact hydration payload with numeric IDs and structure maps
- 🔒 Render context isolation using AsyncLocalStorage for AppState

## 🚀 Quick Start

### Server-Side (Node.js)

```typescript
import { Seidr, List } from '@fimbul-works/seidr';
import { $div, $ul, $li } from '@fimbul-works/seidr/html';
import { renderToString } from '@fimbul-works/seidr/ssr';

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

// Component works on both server and client - can be a plain function!
export const TodoApp = (initialTodos: Todo[] = []) => {
  /**
   * Use a stable ID to share state.
   * Seidr instances are singletons within their AppState; creating
   * a Seidr with the same ID will return the existing instance.
   */
  const todos = new Seidr(initialTodos, { id: 'todos' });

  return $div({ className: 'todo-app' }, [
    $ul({}, [
      List<Todo>(todos, (item) => item.id, (item) => $li({ textContent: item.text }))
    ])
  ]);
};

// Server route handler
app.get('/', async (req, res) => {
  // Fetch data from database
  const todos = await db.query('SELECT * FROM todos');

  // Render component with server data
  const { html, hydrationData } = await renderToString(() => TodoApp(todos));

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
import { hydrate } from '@fimbul-works/seidr/ssr';
import { TodoApp } from './TodoApp.js';

// Hydrate - component retrieves from hydration data
const container = document.getElementById('app');
const hydrationData = window.__SEIDR_HYDRATION_DATA__;

const unmount = hydrate(TodoApp, container, hydrationData);
// App is now interactive!
```

---

## 🗂️ Architecture: Runtime Tree Reconstruction

Seidr uses a **Runtime Tree Reconstruction** strategy (also known as "Lock-step Hydration"). Unlike traditional frameworks that hydrate the entire component tree at once, Seidr reconstructs the UI by re-executing components and having them "claim" pre-rendered DOM nodes in the exact order they were created on the server.

### How It Works

**1. During SSR** - Seidr tracks the creation of both observables and component/element structures. The component hierarchy is encoded into a minimal array structure called a *Structure Map*.

**2. Minimal Payload** - The server sends the initial state values and the structure map for each mounted component.

```json
{
  "ctxID": 1,
  "data": {
    "state": {
      "todos": [
        {
          "id": "1",
          "text": "Learn Seidr",
          "completed": false
        },
        {
          "id": "2",
          "text": "Build an app",
          "completed": false
        }
      ]
    }
  },
  "components": {
    "$:Root-Ixz91": [
      ["$List-1sm4Jn"],
      ["ul", 0],
      ["div", 1]
    ],
    "0:List-1sm4Jn": [
      ["$ListItem-2WcrRo"],
      ["$ListItem-3WN2eW"]
    ],
    "1:ListItem-2WcrRo": [
      ["li"]
    ],
    "1:ListItem-3WN2eW": [
      ["li"]
    ]
  }
}
```

**3. Lock-step Hydration** - When `hydrate()` is called on the client:
- The root component is re-executed.
- As the component creates elements (e.g., via `$div()`), Seidr uses the **Structure Map** to find and "claim" the corresponding physical DOM node from the server-rendered HTML.
- **Deterministic IDs**: Seidr instances created within components automatically receive IDs based on their component's ID and creation order (e.g., `App-0`), ensuring they perfectly match the server's state.
- **Incremental Restoration**: Reactive bindings are re-attached to the newly claimed DOM nodes immediately, making the UI interactive as it is being reconstructed.

## SSR API Reference

### renderToString()

Render a component to HTML with hydration data capture.

**Parameters:**
- `factory` - Function that returns a Seidr component

**Returns:**
- `html` - Rendered HTML string
- `hydrationData` - Data for client-side restoration

```typescript
// Basic usage
const { html, hydrationData } = await renderToString(App);

// With factory arguments
const { html, hydrationData } = await renderToString(() => App(props));
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
