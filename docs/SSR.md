# Server-Side Rendering (SSR) & Hydration

Seidr provides Server-Side Rendering with automatic state capture and deterministic client-side hydration. Components run in a *"Dual-Mode"* fashion, generating accessible static HTML on the server and seamless interactive functionality on the client without code duplication.

---

## Key Features

- 🖥️ **HTML String Rendering:** Fast server-side HTML rendering with `renderToString()`.
- 🔄 **Deterministic Lock-Step Hydration:** Client-side hydration with `hydrate()` matching server-rendered DOM nodes via Structure Maps.
- 💾 **Automatic State Capture:** Reactive `Value` states are automatically tracked and serialized during SSR.
- 🔒 **Context Isolation:** State isolation per request using `AsyncLocalStorage` in Node.js environments.
- ⚡ **Asynchronous Data Fetching:** `inServer()` automatically pauses rendering until async data promises resolve.

---

## 🚀 Quick Start

### Server-Side (Node.js)

```typescript
import { createValue, List } from '@fimbul-works/seidr';
import { $div, $ul, $li } from '@fimbul-works/seidr/html';
import { renderToString } from '@fimbul-works/seidr/ssr';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// Dual-mode component working seamlessly on both server and client
export const TodoApp = (initialTodos: Todo[] = []) => {
  const todos = createValue(initialTodos, { id: 'todos' });

  return $div({ className: 'todo-app' }, [
    $ul({}, [
      List<Todo, string>(
        todos,
        (item) => item.id,
        (itemValue) => $li({ textContent: itemValue.as((t) => t.text) })
      )
    ])
  ]);
};

// Server route handler (e.g. Express, Fastify, Hono, Node http)
app.get('/', async (req, res) => {
  const todos = await db.query('SELECT * FROM todos');

  // Render component to HTML and capture hydration payload
  const { html, hydrationData } = await renderToString(() => TodoApp(todos));

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Seidr SSR App</title>
      </head>
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

### Client-Side Hydration

```typescript
import { hydrate } from '@fimbul-works/seidr';
import { TodoApp } from './TodoApp.js';

const container = document.getElementById('app')!;
const hydrationData = window.__SEIDR_HYDRATION_DATA__;

// Hydrate server markup and bind reactive event handlers
const unmount = hydrate(TodoApp, container, hydrationData);
```

---

## 🗂️ Architecture: Lock-step Hydration

Seidr uses a **Runtime Tree Reconstruction** strategy:

1. **During SSR:** Seidr tracks component and DOM node execution sequences, serializing them into a compact Structure Map and capturing all registered `Value` states.
2. **On the Client:** During `hydrate()`, components re-execute in lock-step. Instead of recreating DOM nodes, Seidr claims the corresponding existing physical DOM nodes from the server-rendered container and attaches reactive event handlers and observers.
3. **Deterministic Value IDs:** Values created within components receive deterministic IDs based on component hierarchy and creation order, guaranteeing state alignment between server and client.

---

## SSR API Reference

### `renderToString()`

Renders a component tree to an HTML string and captures the hydration payload.

**Parameters:**
- `factory: SeidrComponent | Function` — Root component or factory function.

**Returns:** `Promise<SSRRenderResult>`
- `html: string` — Rendered HTML string.
- `hydrationData: HydrationData` — Captured state and structure map payload.

```typescript
import { renderToString } from '@fimbul-works/seidr/ssr';

const { html, hydrationData } = await renderToString(() => App(initialProps));
```

---

### `hydrate()`

Hydrates server-rendered markup in the browser using the captured SSR hydration payload.

**Parameters:**
- `factory: SeidrComponent | Function` — Root component or factory function.
- `container: HTMLElement` — Target DOM container containing server HTML.
- `hydrationData: HydrationData` — Hydration data payload from the server.

**Returns:** `CleanupFunction` (`() => void`) to unmount and destroy the hydrated tree.

```typescript
import { hydrate } from '@fimbul-works/seidr';

const unmount = hydrate(App, document.getElementById('app')!, window.__SEIDR_HYDRATION_DATA__);
```

---

### `isClient()`

Returns `true` if executing in the browser environment.

```typescript
import { isClient } from '@fimbul-works/seidr';

if (isClient()) {
  console.log('Running in browser');
}
```

---

### `isServer()`

Returns `true` if executing on the server (SSR / Node.js).

```typescript
import { isServer } from '@fimbul-works/seidr';

if (isServer()) {
  console.log('Running in SSR server');
}
```

---

### `inClient()`

Executes a callback only when running in the browser. Useful for accessing browser-only APIs like `window`, `document`, or `localStorage`.

**Parameters:**
- `fn: () => T` — Callback function.

**Returns:** `T | undefined`

```typescript
import { inClient } from '@fimbul-works/seidr';

inClient(() => {
  const width = window.innerWidth;
  console.log('Viewport width:', width);
});
```

---

### `inServer()`

Executes a callback only when running on the server. If the callback returns a `Promise`, `renderToString()` automatically waits for the promise to resolve before finalizing the rendered HTML.

**Parameters:**
- `fn: () => T | Promise<T>` — Server callback or async data-fetching function.

**Returns:** `T | Promise<T> | undefined`

```typescript
import { createValue, inServer } from '@fimbul-works/seidr';
import { $div, $p } from '@fimbul-works/seidr/html';

const AsyncProfile = () => {
  const profileData = createValue<any>(null);

  inServer(async () => {
    const res = await fetch('https://api.example.com/profile');
    profileData(await res.json());
    // renderToString awaits this async function before rendering HTML!
  });

  return $div({}, [
    $p({ textContent: profileData.as((p) => p ? `Welcome, ${p.name}` : 'Loading...') })
  ]);
};
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
