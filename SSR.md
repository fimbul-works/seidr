# Seidr SSR Documentation

Seidr provides Server-Side Rendering with automatic state capture and client-side hydration. It is designed to be "Dual-Mode," allowing your components to run on the server to generate HTML and on the client to become interactive without code duplication.

> ⚠️ **Experimental** — SSR support is currently experimental and may change in future versions.

---

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

## 🌓 The Dual-Mode Pattern

The **Dual-Mode Pattern** allows a single component to work on both server and client:

**Server:** Receives data as props → stores with [`setState()`](./API.md#setstate) → renders HTML

**Client:** Receives no props → retrieves data with [`getState()`](./API.md#getstate) → becomes interactive

```typescript
export const MyComponent = (data?: Seidr<MyData>) => {
  if (!isUndefined(data)) {
    // SERVER: Props provided, store in global state
    setState(dataKey, data);
  } else {
    // CLIENT: No props, retrieve from hydration
    data = getState(dataKey);
  }

  // Now 'data' is guaranteed to be Seidr<MyData>
  return $div({ textContent: data.as(d => d.title) });
};
```

**Why the check is critical:**

Without it, the client would try to `setState(dataKey, undefined)`, overwriting the server data!

### Environment-Specific Code

Use `inServer()` and `inBrowser()` for code that should only run in one environment:

```typescript
import { inServer, inBrowser, Seidr } from '@fimbul-works/seidr';

const products = new Seidr<Product[]>([]);

// Server: Fetch from database (async is automatically awaited)
inServer(async () => {
  const data = await db.query('SELECT * FROM products');
  products.value = data;
});

// Client: Fetch from API
inBrowser(async () => {
  const response = await fetch('/api/products');
  products.value = await response.json();
});
```

**Note:** `inServer()` with async functions is automatically awaited by `renderToString()`. This allows you to perform data fetching directly inside your component factories while maintaining the simplicity of the single-pass render.

```typescript
export const UserList = () => {
  const users = new Seidr<User[]>([]);

  // renderToString will wait for this!
  inServer(async () => {
    users.value = await db.users.findMany();
  });

  return $ul({}, [
    List(users, u => u.id, u => $li({ textContent: u.name }))
  ]);
};
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
*   `new Seidr(0)` is called -> Seidr checks the hydration payload for ID `0`, finds the value `0`.
*   `.as(...)` is called -> Seidr re-establishes the derivation logic.
*   The derived value `doubled` automatically re-computes itself from the hydrated source.
*   DOM bindings automatically re-attach to these new instances.

### Why This Is Innovation

Most frameworks pay a "hydration tax" proportional to the depth of your component tree.

*   **Component-Bound Hydration (React/Vue/Svelte):** "Component A passes props to Component B passes props to Component C..." -> All those props must be serialized.
*   **Graph Hydration (Seidr):** "State X drives the entire UI." -> Only State X is serialized. The UI rebuilds itself from that seed.

**Result:** You can have a deeply nested UI with thousands of components, but if they are driven by a single piece of state, your hydration payload is effectively **zero overhead**.

### Comparison

| Strategy | Frameworks | Payload Content | Scaling Factor |
|----------|------------|-----------------|----------------|
| **Component-Bound** | React, Vue, Svelte | Component Props + State | Component Tree Depth |
| **Graph Reconstruction** | **Seidr** | Root State Sources | **Data Complexity** |

---

### Deterministic ID Matching

To achieve this magic without shipping a complex graph map, Seidr relies on **Deterministic Creation Order**. Since JavaScript execution is deterministic, Seidr assigns IDs (0, 1, 2...) to observables in the exact same order on both server and client.

---

## 🛠️ State Initialization Strategies

### ✅ Pattern 1: Server Data via Props (Recommended)

**Best for:** External data (databases, APIs, request params)

Create Seidr in server entry, pass as prop:

```typescript
// Server
const state = new Seidr(await fetchData());
await renderToString(MyApp, state);

// Component
export const MyApp = (data?: Seidr<Data>) => {
  if (!isUndefined(data)) {
    setState(dataKey, data);
  } else {
    data = getState(dataKey);
  }
  // Use data...
};

// Client
hydrate(MyApp, container, hydrationData);
```

**Benefits:** Clean separation, type-safe, works seamlessly on both server and client

### ✅ Pattern 2: Component-Local State

**Best for:** UI state (toggles, form inputs, etc.)

```typescript
export const Counter = () => {
  const count = new Seidr(0);
  return $div({ textContent: count.as(n => `Count: ${n}`) });
};
```

### ✅ Pattern 3: Global Accessors with `getSetState`

**Best for:** Shared application state

Seidr's `getSetState` creates a global accessor function. While the *definition* of this accessor can be global (outside components), the *execution* of it must happen **inside** components or async server functions.

This is safe because `getSetState` resolves the state context lazily when called, ensuring that state is isolated per-request during SSR.

```typescript
// Defined globally - SAFE
const globalCounter = getSetState<number>('global-count');

export const App = () => {
  // Accessed/Initialized locally - SAFE
  if (globalCounter() === undefined) globalCounter(0);

  return $div({ textContent: globalCounter() });
};
```

### ❌ Anti-Pattern: Global Scope Observables

**Never create Seidr instances OR call getSetState accessors in global module scope:**

```typescript
// ❌ THIS WILL FAIL
const count = new Seidr(0);

export const App = () => {
  return $div({ textContent: count.as(String) });
};
```

**Why it fails:**
- Created before `renderToString` establishes render context
- IDs will be non-deterministic or mismatch between requests
- Hydration fails with mismatched values

**Fix:** Pass as prop or create inside component

### How Registration Works

Seidr uses **lazy registration** - instances are registered automatically when:
- Observed (`.observe()`)
- Bound (`.bind()`)
- Derived (`.as()` or `Seidr.computed()`)

No manual registration needed!

---

## 📖 API Reference

### `renderToString(factory, props?, options?)`

Render a component to HTML with hydration data capture.

**Must be called inside an async function** for AsyncLocalStorage isolation.

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

// With custom SSR scope
const scope = new SSRScope();
const { html, hydrationData } = await renderToString(App, null, { scope });
```

**Parameters:**
- `factory` - Function that returns a Seidr component
- `props?` - Optional props to pass to the component
- `options?` - Options object or legacy SSRScope parameter:
  - `initialPath?` - Initial URL path for routing (defaults to "/")
  - `scope?` - Optional existing SSR scope (creates new one if not provided)

**Returns:**
- `html` - Rendered HTML string
- `hydrationData` - Data for client-side restoration

---

### Routing with SSR

When using the Router component in SSR, you must pass the current request path to `renderToString`:

```typescript
import { renderToString } from '@fimbul-works/seidr/node';
import { Router, createRoute } from '@fimbul-works/seidr/node';

const HomePage = () => $div({ textContent: 'Home' });
const AboutPage = () => $div({ textContent: 'About' });
const NotFoundPage = () => $div({ textContent: '404 - Not Found' });

const App = Router({
  routes: [
    createRoute('/', HomePage),
    createRoute('/about', AboutPage),
  ],
  fallback: () => NotFoundPage
});

// Server route handler
app.get('*', async (req, res) => {
  const { html, hydrationData } = await renderToString(
    () => App,
    null,
    {
      initialPath: req.path  // Pass request URL path for routing
    }
  );

  res.send(html);
});
```

**How it works:**
- Each SSR request gets its own isolated path state via `AsyncLocalStorage`
- The `initialPath` is stored in the `RenderContext` for that request
- Route components read from the context to determine which page to render
- Path state is automatically cleaned up after rendering

**Important:** SSR is a **single-pass render**, meaning:
- The component renders once based on `initialPath`
- Calling `navigate()` during SSR updates the path but doesn't cause re-renders
- For redirects during SSR, check conditions BEFORE rendering and set the appropriate `initialPath`

---

### `hydrate(factory, container, hydrationData)`

Hydrate server-rendered HTML on the client.

```typescript
hydrate(App, document.getElementById('app'), window.__SEIDR_HYDRATION_DATA__);
```

**Parameters:**
- `factory` - Function that returns a Seidr component
- `container` - DOM element to mount into
- `hydrationData` - Hydration data from server

**Returns:** The hydrated component

---

### `inServer(fn)` / `inBrowser(fn)`

Execute code only in specific environment.

```typescript
inServer(async () => {
  // Database queries, server logging
  data.value = await db.query('...');
});

inBrowser(() => {
  // Browser APIs, localStorage, analytics
  console.log('Client initialized');
});
```

**Async support:** `inServer()` with async functions is automatically awaited by `renderToString()`.

---

## 📦 Hydration Data Format

```typescript
interface HydrationData {
  renderContextID?: number;
  observables: Record<number, any>; // Root values by numeric ID
  state?: Record<string, any>;      // Global state
}
```

**Example:**

```json
{
  "renderContextID": 0,
  "observables": {
    "0": 42,
    "1": "hello"
  },
  "state": {
    "$/0": { "name": "Alice" }
  }
}
```

**State field format:**
- `$/0` - Seidr observable (prefix `$/`, numeric ID)
- `1` - Plain value (numeric ID only)

---

## ⚠️ Best Practices & Gotchas

### Critical: Async Function Required

`renderToString()` **must** be called inside an async function:

```typescript
// ❌ WRONG
const result = renderToString(App);

// ✅ CORRECT
app.get('/', async (req, res) => {
  const { html, hydrationData } = await renderToString(App);
});
```

### JSON-Serializable Values Only

Only JSON-serializable values survive the server → client transfer:
- ✅ Primitives, arrays, plain objects
- ❌ Functions, Symbols, Classes, DOM nodes

### Marker Nodes (HTML Comments)

Seidr uses HTML comments for `List`, `Conditional`, and `Switch`:

```html
<div class="parent">
  <span>Content</span>
  <!--seidr-conditional-->
</div>
```

**⚠️ Do NOT use HTML minifiers that strip comments** - they'll break hydration!

### No Browser APIs on Server

Wrap any `window` or `document` access in `inBrowser()` to prevent errors during server-side rendering:

```typescript
inBrowser(() => {
  window.addEventListener('resize', handler);
});
```

### Hydration Mismatches & Idempotency

Hydration relies on the server and client generating the **exact same DOM structure** for a given set of data. If the structures differ, Seidr will fail to match markers or bindings to the correct elements.

#### Avoid Non-Deterministic Data
Don't use data that changes between server and client in the initial render:

```typescript
// ❌ WRONG: Math.random() will be different on client
const id = new Seidr(Math.random());

// ✅ CORRECT: Pass the ID as a prop or state so it's captured in hydration
const id = new Seidr(capturedIdFromSSR);
```

#### Time and Dates
`new Date()` or `Date.now()` are dangerous because time passes between SSR and hydration:

```typescript
// ❌ WRONG: Can cause mismatch if a second passes
const now = new Seidr(new Date().toLocaleTimeString());

// ✅ CORRECT: Use state that is captured on server
const now = inBrowser(() => new Seidr(new Date())) || new Seidr(serverTime);
```

#### Component Logic
Ensure your component logic doesn't branch based on `typeof window` in a way that affects the DOM structure before hydration is complete:

```typescript
// ❌ WRONG: Structure differs between environments
return inServer() ? $div() : $span();

// ✅ CORRECT: Keep structure identical, change content reactively
const tag = new Seidr(inServer() ? 'Server' : 'Client');
return $div({ textContent: tag });
```

---

## 🔧 Troubleshooting

### "No render context available"

**Cause:** `renderToString()` called synchronously

**Fix:** Use `async` function:

```typescript
app.get('/', async (req, res) => {
  await renderToString(App); // ✅
});
```

---

### "Parent Seidr instance not found in registered observables"

**Cause:** Derived observable's parent wasn't registered (created in global scope)

**Fix:** Pass Seidr as component prop or create inside component:

```typescript
// ❌ Global scope
const count = new Seidr(0);
const doubled = count.as(n => n * 2); // Parent not in render context!

// ✅ Pass as prop
const count = new Seidr(0);
await renderToString(App, count);
```

---

### Elements Not Interactive After Hydration

**Cause:** State not properly restored

**Check:**
1. Same state keys used on server and client
2. Component uses dual-mode pattern correctly
3. Hydration data injected into HTML template
4. Client calls `hydrate()` with correct data

---

### Wrong Values Displayed

**Cause:** Different initial values on server vs client

**Fix:** Use dual-mode pattern - client retrieves server values from hydration:

```typescript
// Server
const todos = new Seidr(await db.getTodos());

// Client (automatic via hydration)
const todos = getState(todosKey); // Gets server values
```

---

## 🔄 Migration Guide

### From Client-Only to SSR

**1. Update imports:**

```typescript
// Server
import { renderToString } from '@fimbul-works/seidr';

// Client
import { hydrate } from '@fimbul-works/seidr';
```

**2. Add dual-mode pattern to components:**

```typescript
// Before
export const App = () => {
  const data = new Seidr(initialData);
  return ...;
};

// After
export const App = (data?: Seidr<Data>) => {
  if (!isUndefined(data)) {
    setState(dataKey, data);
  } else {
    data = getState(dataKey);
  }
  // ...
};
```

**3. Add server rendering:**

```typescript
app.get('/', async (req, res) => {
  const data = new Seidr(await fetchData());
  const { html, hydrationData } = await renderToString(App, data);

  res.send(renderTemplate(html, hydrationData));
});
```

**4. Add client hydration:**

```typescript
hydrate(App, container, window.__SEIDR_HYDRATION_DATA__);
```

---

## 🚀 Performance Considerations

- **Compact payloads:** Numeric IDs + dependency paths only
- **Efficient restoration:** Single traversal per binding
- **Zero allocation:** AsyncLocalStorage context isolation
- **No virtual DOM:** Direct HTML string rendering

---

## Resources

- [Main README](README.md)
- [API Reference](API.md)
