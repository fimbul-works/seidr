# Seidr SSR Documentation

Seidr provides Server-Side Rendering (SSR) support with automatic state capture and client-side hydration. This allows you to render your Seidr applications on the server and make them interactive on the client.

> ⚠️ **Experimental** - Server-Side Rendering support is currently experimental and may change in future versions.

**Key Features:**
- 🖥️ Server-side HTML rendering
- 💾 Automatic state capture
- 🔄 Client-side hydration
- 📦 Numeric ID-based hydration data (compact and efficient)
- 🌳 Dependency graph support for derived observables
- 🔒 Render context isolation (using AsyncLocalStorage on Node.js)
- 🎯 **Graph traversal-based hydration** - A novel approach for minimal payloads!

> **Note on Terminology:** We use "parents" to refer to **dependencies** or **source observables** in the dependency graph. If A depends on B (A is derived from B), then B is the "parent" of A.

## Architecture

### Conditional Exports

Seidr uses **conditional exports** in [`package.json`](package.json) to provide the correct build based on the environment:

**For Browser:**
- Uses `dist/seidr.js` (ESM) or `dist/seidr.cjs` (CommonJS)
- Simple render context (no AsyncLocalStorage overhead)
- Includes SSR [`hydrate`](#hydrate) function

**For Node.js:**
- Uses `dist/seidr.node.js` (ESM) or `dist/seidr.node.cjs` (CommonJS)
- Includes SSR [`renderToString`](#rendertostring) function
- AsyncLocalStorage-based render context for SSR

**The split happens at bundling time** - both environments can use the same imports:

```typescript
// This works in both browser and Node!
import { $, component, Seidr } from '@fimbul-works/seidr';

// Node.js also gets SSR utilities:
import { renderToString } from '@fimbul-works/seidr';
```

### Two Methods of State Synchronization

Seidr provides **two complementary methods** for state synchronization between server and client:

#### 1. Graph Traversal (Derived Computations)

Automatically handles any derived state computed from other [`Seidr`](API.md#seidrt) instances with [`.as()`](API.md#seidras) and [`Seidr.computed()`](API.md#seidrcomputed).

**How it works:**
- Dependency graph captures relationships during SSR
- Client traverses graph to find root values
- Derived observables recreate themselves from roots

#### 2. Passing Seidr Instances as Props (Server Data)

For data coming from **outside** the component, such as:
- Database queries
- API responses
- User input from request params
- Configuration data

**The recommended pattern** is to create Seidr instances in your server entry point and pass them as props to your components:

```typescript
import { createStateKey, setState, getState, isUndefined } from '@fimbul-works/seidr';

// Create type-capturing symbolic key for state
const todosKey = createStateKey<Seidr<Todo[]>>("todos");

// ✅ RECOMMENDED: Create Seidr outside, pass as prop
export async function render(_url: string, todos: Todo[] = []) {
  // Create Seidr instance with server data
  const state = new Seidr(todos);

  // Pass to component as prop
  return await renderToString(TodoApp, state);
}

// Component receives Seidr as prop (server) or undefined (client)
export function TodoApp(todos: Seidr<Todo[]>) {
  return component(() => {
    // DUAL-MODE: Server sets state, client gets state from hydration
    if (!isUndefined(todos)) {
      // Server-side: Store the prop in global state
      setState(todosKey, todos);
    } else {
      // Client-side: Retrieve from hydration data
      todos = getState(todosKey);
    }

    // Use the Seidr - lazy state registration happens automatically!
    return $ul({}, [
      List(todos, (item) => item.id, TodoItem)
    ]);
  });
}
```

**How the dual-mode pattern works:**

1. **Server-side rendering:**
   - Seidr prop is passed from server entry point
   - `isUndefined(todos)` is `false`
   - `setState()` stores the Seidr in global state with its ID
   - Seidr gets registered when `List` observes it
   - Hydration data captures the Seidr's value

2. **Client-side hydration:**
   - Component is called WITHOUT props
   - `isUndefined(todos)` is `true`
   - `getState()` retrieves the Seidr from hydration data using the same ID
   - Hydration system populates the Seidr with server values
   - Component becomes interactive with correct initial state

**Why this is brilliant:**
- ✅ Single component works for both SSR and client
- ✅ No code duplication between server and client
- ✅ Type-safe: TypeScript ensures `todos` is always `Seidr<Todo[]>` after the check
- ✅ Hydration automatically populates the Seidr with server data
- ✅ Clean separation: server fetches data, component consumes it

**Alternative pattern** (create Seidr inside render function):

```typescript
// ✅ ALSO VALID: Create Seidr inside renderToString
export async function render(_url: string, todos: Todo[] = []) {
  return await renderToString(() => {
    const state = new Seidr(todos);

    setState(createStateKey("todos"), state);
    return TodoApp();
  });
}
```

Use this pattern when you need to create multiple Seidr instances or perform complex initialization logic before rendering.

### Understanding the Dual-Mode Pattern

The **dual-mode pattern** is the key to making components work seamlessly on both server and client with a single codebase:

```typescript
export function MyComponent(data: Seidr<MyData>) {
  return component(() => {
    // The magic isUndefined() check
    if (!isUndefined(data)) {
      // SERVER: Props provided → store in global state
      setState(dataKey, data);
    } else {
      // CLIENT: No props → retrieve from hydration
      data = getState(dataKey);
    }

    // Now 'data' is guaranteed to be a Seidr instance!
    return $('div', { textContent: data.as(d => d.title) });
  });
}
```

**How it works step by step:**

**Server-side:**
```typescript
// 1. Create Seidr with server data
const serverData = new Seidr({ title: 'Hello from Server', count: 42 });

// 2. Pass to component
await renderToString(() => MyComponent(serverData));

// 3. Component's isUndefined() check fails (data is provided)
// 4. setState() stores the Seidr instance with its unique ID
// 5. Lazy registration happens when component observes it
// 6. Hydration data captures: { "observables": { "0": { title: "...", count: 42 } } }
```

**Client-side:**
```typescript
// 1. Call hydrate WITHOUT props
hydrate(MyComponent, container, hydrationData);

// 2. Component's isUndefined() check succeeds (data is undefined)
// 3. getState() looks up the Seidr using the same ID from server
// 4. Hydration system populates the Seidr with server values
// 5. Component renders with correct initial state
// 6. App becomes interactive!
```

**Why the isUndefined() check is critical:**

❌ **Without the check:**
```typescript
export function MyComponent(data: Seidr<MyData>) {
  return component(() => {
    setState(dataKey, data);  // ⚠️ Overwrites server data with undefined!
    //...
  });
}
```

✅ **With the check:**
```typescript
export function MyComponent(data: Seidr<MyData>) {
  return component(() => {
    if (!isUndefined(data)) {
      setState(dataKey, data);  // ✅ Only set if provided
    } else {
      data = getState(dataKey);  // ✅ Retrieve from hydration
    }
    //...
  });
}
```

**TypeScript flow understanding:**

After the `if/else` block, TypeScript knows that `data` is definitely `Seidr<MyData>`:
- If `!isUndefined(data)` → `data` was already `Seidr<MyData>`
- If `isUndefined(data)` → `data = getState()` returns `Seidr<MyData>`

So the rest of the component can safely use `data` without null checks!

### Graph Traversal-Based Hydration

Seidr uses a unique **dependency graph traversal** approach for hydration that, as far as we know, is completely novel in the frontend framework space.

#### How It Works

**1. During SSR**: When derived observables are created, they register their **dependencies** (or "parents") **in order**:

```typescript
// Using .as() for simple derivation
const count = new Seidr(0);
const doubled = count.as(n => n * 2);

// Using Seidr.computed() for multiple dependencies
const firstName = new Seidr("John");
const lastName = new Seidr("Doe");
const fullName = Seidr.computed(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]  // ALWAYS stored in this order!
);

// Dependency graph stores:
// doubled -> [count (index 0)]
// fullName -> [firstName (index 2), lastName (index 3)]
```

**2. Path-Based Restoration**: Each element binding stores a `path` array that indicates which parent dependencies to traverse:

```json
{
  "elementId": 5,        // The element's data-seidr-id attribute value
  "seidrId": 4,          // Numeric ID of the bound Seidr instance
  "prop": "textContent",
  "path": [2, 3]         // "To get value, follow dependencies: dep[2] → dep[3]"
}
```

**3. Client-Side Hydration**: When an element has a binding to a derived observable:
- Start at the bound [`Seidr`](API.md#seidrt) instance
- Follow the `path` array to traverse the dependency graph
- Each index points to a dependency (parent) [`Seidr`](API.md#seidrt)
- Continue until reaching a root [`Seidr`](API.md#seidrt) (no dependencies)
- Set the root's value from the hydration data
- The entire derived chain updates automatically!

#### Why This Is Brilliant

- **Minimal Payload**: Only store root observable values in hydration data
- **No Code Duplication**: Derived observables are recreated on client with same logic
- **Type-Safe**: TypeScript ensures graph structure matches creation order
- **Efficient**: Single traversal per binding, not recursive re-computation
- **Predictable**: Same dependency order = same graph structure

#### Comparison to Other Frameworks

- **React**: Must serialize entire component tree state
- **Vue**: Requires component state snapshots
- **Seidr**: Just root values + dependency paths 🎯

## Quick Start

### Server-Side Rendering with Props Pattern

The recommended way to share server data with your components is to create Seidr instances in your server entry point and pass them as props:

```typescript
import { renderToString, Seidr } from '@fimbul-works/seidr';
import { $, component, List } from '@fimbul-works/seidr';

// Server entry point (e.g., entry-server.ts)
export async function render(url: string, todos: Todo[] = []) {
  // Create Seidr with server data
  const state = new Seidr(todos);

  // Pass to component as prop
  const { html, hydrationData } = await renderToString(TodoApp, state);

  return { html, hydrationData };
}

// Component receives Seidr as prop (server) or undefined (client)
export function TodoApp(todos: Seidr<Todo[]>) {
  return component(() => {
    // DUAL-MODE: Server sets state, client gets state from hydration
    if (!isUndefined(todos)) {
      // Server-side: Store the prop in global state
      setState(todosKey, todos);
    } else {
      // Client-side: Retrieve from hydration data
      todos = getState(todosKey);
    }

    // Use the Seidr - lazy registration happens automatically!
    return $div({ className: 'todo-app' }, [
      $h1({ textContent: 'My Todos' }),
      $ul({ className: 'todo-list' }, [
        List(
          todos,
          (item) => item.id,
          (item) => $li({ textContent: item.text })
        )
      ])
    ]);
  });
}

// In your server route handler
app.get('/', async (req, res) => {
  // Fetch data from database
  const todos = await db.query('SELECT * FROM todos');

  // Render with server data
  const { html, hydrationData } = await render(req.url, todos);

  // Send both HTML and hydration data to client
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__SEIDR_HYDRATION_DATA__ = ${JSON.stringify(hydrationData)};
        </script>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
});
```

### Client-Side Hydration

```typescript
import { hydrate } from '@fimbul-works/seidr';
import { $, component, Seidr } from '@fimbul-works/seidr';

// Same component definition as server - receives prop as optional parameter
export function TodoApp(todos: Seidr<Todo[]>) {
  return component(() => {
    // DUAL-MODE: Server sets state, client gets state from hydration
    if (!isUndefined(todos)) {
      setState(todosKey, todos);
    } else {
      todos = getState(todosKey);
    }

    return $div({ className: 'todo-app' }, [
      $ul({ className: 'todo-list' }, [
        List(todos, (item) => item.id, TodoItem)
      ])
    ]);
  });
}

// Hydrate the app WITHOUT props
// The component will retrieve todos from hydration data
const container = document.getElementById('app');
const hydrationData = window.__SEIDR_HYDRATION_DATA__;

hydrate(TodoApp, container, hydrationData);
// App is now interactive with server data!
```

**Key points:**
- Client calls `hydrate()` WITHOUT props
- Component's `isUndefined()` check detects missing prop
- `getState()` retrieves Seidr from hydration data
- Hydration populates the Seidr with server values automatically

## API Reference

### renderToString()

Render a Seidr component to an HTML string with hydration data capture.

**This function automatically wraps the rendering in an AsyncLocalStorage context**, so you don't need to manually call [`runWithRenderContext()`](#runwithrendercontext).

```typescript
import { renderToString } from '@fimbul-works/seidr';

const { html, hydrationData } = await renderToString(App);
```

**Parameters:**
- `componentFactory` - Function that returns a Seidr component

**Returns:**
- `html` - Rendered HTML string
- `hydrationData` - Hydration data for client-side restoration

**Async Function Required:** This function must be called inside an async function for AsyncLocalStorage to work properly.

---

### hydrate()

Hydrate a server-rendered component on the client.

```typescript
import { hydrate } from '@fimbul-works/seidr';

const component = hydrate(App, container, hydrationData);
```

**Parameters:**
- `componentFactory` - Function that returns a Seidr component
- `container` - HTMLElement to mount the component
- `hydrationData` - Hydration data from server

**Returns:** The hydrated Seidr component

---

## Hydration Data Format

The hydration data structure captured during SSR:

```typescript
interface HydrationData {
  renderContextID: number;                    // Server render context ID
  observables: Record<string, any>;           // Root observable values (numeric ID -> value)
  bindings: Record<string, ElementBinding[]>; // element ID (data-seidr-id) -> bindings
  graph: DependencyGraph;                     // Derived observable dependency graph
  state?: Record<string, any>;                // Optional State values (uses $/ prefix for Seidr)
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
  "bindings": {
    "0": [
      { "seidrId": "0", "prop": "textContent", "path": [] },
      { "seidrId": "1", "prop": "className", "path": [] }
    ]
  },
  "graph": {
    "nodes": [
      { "id": 0, "parents": [] },
      { "id": 1, "parents": [] }
    ],
    "rootIds": [0, 1]
  },
  "state": {
    "$/0": "Alice",
    "1": { "theme": "dark" }
  }
}
```

**State Field Format:**
- `$/0` - Seidr observable (prefix with `$/`, use numeric ID)
- `1` - Plain value (just numeric ID)

## Best Practices

### ⚠️ CRITICAL: Async Function Required

**`renderToString()` MUST be called inside an async function!**

AsyncLocalStorage only works within async functions. If you call it synchronously, it won't create the proper context isolation.

❌ **WRONG:**
```typescript
const result = renderToString(App);  // Won't work! No AsyncLocalStorage context!
```

✅ **CORRECT:**
```typescript
app.get('/', async (req, res) => {
  const { html, hydrationData } = await renderToString(App);
  res.send(html);
});
```

### State Initialization Patterns

#### Pattern 1: Server Data via Props with Dual-Mode (Recommended)

**Best for:** External data (databases, APIs, request params)

This is the **recommended pattern** for sharing server data with components:

```typescript
// ✅ SERVER: Create Seidr and pass as prop
export async function render(_url: string, todos: Todo[] = []) {
  const state = new Seidr(todos);
  return await renderToString(TodoApp, state);
}

// ✅ COMPONENT: Dual-mode - works on both server and client
export function TodoApp(todos: Seidr<Todo[]>) {
  return component(() => {
    // DUAL-MODE: Server sets, client gets from hydration
    if (!isUndefined(todos)) {
      setState(todosKey, todos);      // Server: store prop
    } else {
      todos = getState(todosKey);     // Client: retrieve from hydration
    }

    // Use todos (guaranteed to be Seidr<Todo[]>)
    return $ul({}, [
      List(todos, (item) => item.id, TodoItem)
    ]);
  });
}

// ✅ CLIENT: Hydrate WITHOUT props
hydrate(TodoApp, container, hydrationData);
```

**Why this is recommended:**
- ✅ Single component works for both SSR and client
- ✅ Clean separation of data fetching and component logic
- ✅ Easy to test components with different data
- ✅ Type-safe with TypeScript's flow analysis
- ✅ Lazy registration ensures proper SSR tracking
- ✅ Hydration automatically populates with server values

#### Pattern 2: Create Inside renderToString

**Best for:** Multiple Seidr instances or complex initialization

```typescript
// ✅ Create Seidr inside renderToString callback
export async function render(_url: string, todos: Todo[] = []) {
  return await renderToString(() => {
    const state = new Seidr(todos);
    setState(createStateKey("todos"), state);
    return TodoApp();
  });
}
```

#### Pattern 3: Component-Local State

**Best for:** State specific to a component instance

```typescript
// ✅ Create Seidr inside component function
export function Counter() {
  return component(() => {
    const count = new Seidr(0);
    return $('div', { textContent: count.as(n => `Count: ${n}`) });
  });
}
```

#### ❌ Anti-Pattern to Avoid

**Don't create Seidr outside and use `.as()` directly:**

```typescript
// ❌ AVOID: Creating Seidr outside and deriving in component
const count = new Seidr(42);  // Created in wrong context!

const App = () => component(() => {
  // This creates a derived Seidr whose parent isn't properly registered
  return $('div', { textContent: count.as(n => n * 2) });
});
```

**Why this fails:**
- The Seidr is created before `renderToString` establishes the render context
- Derived Seidr (`.as()`) depends on parent, but parent has wrong ID
- Dependency graph can't find the parent during hydration

**Correct approach:**
```typescript
// ✅ Pass Seidr as prop instead
const count = new Seidr(42);

const App = (count: Seidr<number>) => component(() => {
  // Component observes the Seidr, triggering proper registration
  return $('div', { textContent: count.as(n => n * 2) });
});

await renderToString(() => App(count));
```

### Lazy Registration

Seidr uses **lazy registration** - instances are automatically registered with the SSR scope when they are first:

- Observed via `.observe()`
- Bound via `.bind()`
- Used in reactive components (`List`, Conditional, etc.)
- Passed to element properties (`textContent`, `className`, etc.)

This means:
- ✅ You can create Seidr instances anywhere (server entry point, component, etc.)
- ✅ They'll be registered automatically when used
- ✅ No manual registration needed

### Component Hierarchy in SSR

When using nested components in SSR, child components are automatically tracked and will be properly destroyed during cleanup. This works the same way as in client-side rendering:

```typescript
import { component, $ } from '@fimbul-works/seidr';

function Header() {
  return component(() => {
    return $('header', { textContent: 'My App' });
  });
}

function MainContent() {
  return component((scope) => {
    const count = new Seidr(0);

    return $('main', {}, [
      $('p', { textContent: count.as(n => `Count: ${n}`) })
    ]);
  });
}

function App() {
  return component((scope) => {
    // Child components are automatically tracked
    const header = Header();
    const main = MainContent();

    return $('div', {}, [
      header.element,
      main.element
    ]);
  });
}

// SSR automatically tracks all components
const { html, hydrationData } = await renderToString(App);
```

**Key Points:**
- Child components created during parent rendering are automatically tracked
- All components are properly cleaned up after SSR rendering
- The same automatic tracking works on the client during hydration
- No manual `scope.child()` calls needed (it's automatic!)

### No Window/Document Access

Server code must not access browser APIs like `window` or `document`.

### JSON-Serializable Values

Only JSON-serializable values can be included in hydration data. Functions, Symbols, and complex objects cannot be transferred.

### Derived Observables

Derived/computed observables are recreated on the client from root values - they don't need to be in the hydration data.

## Graph Traversal Deep Dive

### Complex Graph Example

```typescript
// Layer 1: Root observables
const a = new Seidr(1);
const b = new Seidr(2);
const c = new Seidr(3);

// Layer 2: Simple derivations
const ab = Seidr.computed(() => a.value + b.value, [a, b]);
const bc = Seidr.computed(() => b.value + c.value, [b, c]);
const abc = Seidr.computed(() => a.value + b.value + c.value, [a, b, c]);

// Layer 3: Derivation from derivations
const sumOfSums = Seidr.computed(() => ab.value + bc.value, [ab, bc]);
```

**Dependency Graph:**
```
a (0) ──┐
         ├─> ab (3) ──┐
b (1) ──┘            │
         ├─> abc (5) ──> sumOfSums (6)
         │            │
c (2) ──┴─> bc (4) ──┘
```

**During SSR:**
- Each derived observable registers its dependencies (parents) in order
- Graph captures these relationships
- Only root values (a, b, c) are stored in hydration data

**During Client Hydration:**
- `sumOfSums` has path `[5, 3]` → goes to `abc` → then `ab` → then roots `a` and `b`
- All values restored from minimal hydration data!

## Limitations & Gotchas

### No Streaming SSR

Currently, SSR renders the entire application at once. Streaming SSR is not yet supported.

### State Serialization

Only JSON-serializable values can be included in hydration data. Functions, Symbols, and complex objects cannot be transferred.

## Testing SSR

```bash
# Run SSR-specific tests
npm test -- ssr

# Run specific SSR test file
npm test -- src/ssr/integration.test.ts
```

## Migration Guide

### From Client-Side Only

1. **Update imports** - Use Node.js entry point for server code:

```typescript
// Before
import { $, component, Seidr } from '@fimbul-works/seidr';

// After (server-side)
import { $, component, Seidr, renderToString } from '@fimbul-works/seidr';
```

2. **Move state initialization** - Ensure Seidr state is created inside components or async render functions

3. **Add SSR render** - Use [`renderToString()`](#rendertostring) in your server route (must be async!)

4. **Add client hydration** - Use [`hydrate()`](#hydrate) on the client with the hydration data

## Examples

See the `examples/` directory for complete SSR examples:
- `examples/counter.ts` - Simple counter with SSR
- `examples/todo.ts` - Todo app with SSR

## Performance Considerations

- Numeric IDs keep hydration data compact
- Dependency graph enables efficient derived observable recreation
- AsyncLocalStorage provides zero-allocation context isolation
- No virtual DOM means direct rendering to HTML string

## Future Improvements

- [ ] Make SSRScope RenderContext-aware for concurrent request safety
- [ ] Streaming SSR support
- [ ] Performance benchmarks with real-world applications
- [ ] Progressive hydration strategies

## Troubleshooting

### "No render context available" Error

**Cause:** [`renderToString()`](#rendertostring) was called synchronously (not in an async function).

**Solution:** Ensure you call it in an async function (server route handler, etc.).

### Hydration Not Working

**Cause:** Seidr instances created outside component but used incorrectly.

**Solution:**
- ✅ **Pass Seidr as props** - Create Seidr in server entry, pass to component
- ✅ **Create inside component** - Use for component-local state
- ❌ **Avoid**: Creating Seidr outside and using `.as()` directly in component

### "Parent Seidr instance not found in registered observables" Error

**Cause:** Derived Seidr (from `.as()` or `Seidr.computed()`) depends on a parent that wasn't registered.

**Solution:**
- If parent is created outside, pass it as a prop to the component
- Don't create derived Seidr from parents that exist in a different render context
- See the [Anti-Pattern section](#-anti-pattern-to-avoid) for details

### Elements Not Interactive After Hydration

**Cause:** Seidr instances weren't hydrated correctly (wrong order or missing bindings).

**Solution:** Ensure state is created properly and check hydration data format.

### Wrong Values Displayed After Hydration

**Cause:** Creating Seidr with different initial values on server vs client.

**Solution:**
- Server creates Seidr with actual data
- Client creates Seidr with default/empty value
- Hydration overwrites client value with server value
- Both must use the same state key!

**Example:**
```typescript
// Server
const state = new Seidr(todos);  // Actual data from database
await renderToString(() => TodoApp(state));

// Client
hydrate(() => {
  // Seidr created with empty array, will be overwritten by hydration
  const state = new Seidr<Todo[]>([]);
  return TodoApp(state);
}, container, hydrationData);
```

### Marker Nodes and Fragments

Seidr uses **Marker Nodes** (HTML Comments) for declarative components that manage multiple or conditional child nodes, such as `Conditional`, `Switch`, and `List`.

This approach provides **Fragment-like support** without adding extra wrapper elements (like `<div>`) to the DOM, keeping the tree minimalist and the styling predictable.

**How it works in SSR:**
1. The server renders an HTML comment (e.g., `<!--seidr-conditional-->`) as a placeholder.
2. The component's active children (if any) are rendered immediately before or after the marker.
3. During hydration, the client finds the marker and attaches reactive logic to manage its siblings.

**Example output:**
```html
<div class="parent">
  <span>Visible Content</span>
  <!--seidr-conditional-->
</div>
```

## Resources

- [Main README](README.md)
- [API Reference](./API.md)
