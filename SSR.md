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

## Architecture

### Conditional Exports

Seidr uses **conditional exports** in [`package.json`](package.json) to provide the correct build based on the environment:

**For Browser:**
- Uses `dist/browser/index.js` (ESM) or `dist/browser/index.cjs` (CommonJS)
- Simple render context (no AsyncLocalStorage overhead)

**For Node.js:**
- Uses `dist/node/index.js` (ESM) or `dist/node/index.cjs` (CommonJS)
- Includes SSR utilities ([`renderToString`](#rendertostring), [`hydrate`](#hydrate), [`runWithRenderContext`](#runwithrendercontext))
- AsyncLocalStorage-based render context for SSR

**The split happens at bundling time** - both environments can use the same imports:

```typescript
// This works in both browser and Node!
import { $, component, Seidr } from '@fimbul-works/seidr';

// Node.js also gets SSR utilities:
import { renderToString, runWithRenderContext } from '@fimbul-works/seidr';
```

### Two Methods of State Synchronization

Seidr provides **two complementary methods** for state synchronization between server and client:

#### 1. Graph Traversal (Derived Computations)

Automatically handles any derived state computed from other [`Seidr`](API.md#seidrt) instances with [`.as()`](API.md#seidras) and [`Seidr.computed()`](API.md#seidrcomputed).

**How it works:**
- Dependency graph captures relationships during SSR
- Client traverses graph to find root values
- Derived observables recreate themselves from roots

#### 2. Global Application State (External Data)

For data coming from **outside** the [`renderToString()`](#rendertostring) function:
- Database queries
- API responses
- User input from request params
- Configuration data

**How it works:**
```typescript
export async function render(_url, todos = []) {
  await runWithRenderContext(async () => {
    // State comes from OUTSIDE (function parameter)
    // Can be a Seidr observable or plain value
    const state = new Seidr(todos);

    [setState()](API.md#setstate)([createStateKey()](API.md#createstatekey)("todos"), state);
    return await [renderToString()](#rendertostring)(TodoApp);
  });
}
```

**Simplified version (no manual Seidr creation):**
```typescript
export async function render(_url, todos = []) {
  await runWithRenderContext(async () => {
    // Just pass the plain value - restoreGlobalState will wrap it in Seidr
    [setState()](API.md#setstate)([createStateKey()](API.md#createstatekey)("todos"), new Seidr(todos));
    return await [renderToString()](#rendertostring)(TodoApp);
  });
}
```

### Graph Traversal-Based Hydration

Seidr uses a unique **dependency graph traversal** approach for hydration that, as far as we know, is completely novel in the frontend framework space.

#### How It Works

**1. During SSR**: When derived observables are created, they register their parent dependencies **in order**:

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
  "path": [2, 3]         // "To get value, follow parents: parent[2] → parent[3]"
}
```

**3. Client-Side Hydration**: When an element has a binding to a derived observable:
- Start at the bound [`Seidr`](API.md#seidrt) instance
- Follow the `path` array to traverse the dependency graph
- Each index points to a parent [`Seidr`](API.md#seidrt)
- Continue until reaching a root [`Seidr`](API.md#seidrt) (no parents)
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

### Server-Side Rendering

```typescript
import { renderToString } from '@fimbul-works/seidr/node';
import { $, component, Seidr } from '@fimbul-works/seidr/node';

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

// In your server route handler
app.get('/', async (req, res) => {
  // Just call renderToString - runWithRenderContext is automatic!
  const { html, hydrationData } = await renderToString(App);

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
import { hydrate } from '@fimbul-works/seidr/node';
import { $, component, Seidr } from '@fimbul-works/seidr';

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

// Hydrate the app
const container = document.getElementById('app');
const hydrationData = window.__SEIDR_HYDRATION_DATA__;

hydrate(App, container, hydrationData);
// App is now interactive!
```

## API Reference

### renderToString()

Render a Seidr component to an HTML string with hydration data capture.

**This function automatically wraps the rendering in an AsyncLocalStorage context**, so you don't need to manually call [`runWithRenderContext()`](#runwithrendercontext).

```typescript
import { renderToString } from '@fimbul-works/seidr/node';

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
import { hydrate } from '@fimbul-works/seidr/node';

const component = hydrate(App, container, hydrationData);
```

**Parameters:**
- `componentFactory` - Function that returns a Seidr component
- `container` - HTMLElement to mount the component
- `hydrationData` - Hydration data from server

**Returns:** The hydrated Seidr component

---

### runWithRenderContext()

**Advanced usage only.** Most users should use [`renderToString()`](#rendertostring) directly.

Wrap a function in an AsyncLocalStorage render context. Used for advanced scenarios where you need manual control over the render context.

```typescript
import { runWithRenderContext } from '@fimbul-works/seidr/node';

const result = await runWithRenderContext(async () => {
  // Your SSR code here
  return someValue;
});
```

**Also available as synchronous version:** [`runWithRenderContextSync()`](#runwithrendercontextsync)

---

### runWithRenderContextSync()

Synchronous version of [`runWithRenderContext()`](#runwithrendercontext). Used in tests and scenarios where async context is not needed.

```typescript
import { runWithRenderContextSync } from '@fimbul-works/seidr/node';

const result = runWithRenderContextSync(() => {
  // Your SSR code here
  return someValue;
});
```

---

### SSRScope

**Advanced usage only.** Low-level SSR scope management for complex scenarios.

```typescript
import { SSRScope, setActiveSSRScope } from '@fimbul-works/seidr/node';

const scope = new SSRScope();
setActiveSSRScope(scope);

// ... create elements

const hydrationData = scope.captureHydrationData();
```

**Methods:**
- `captureHydrationData()` - Capture all SSR state for hydration

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

✅ **ALSO CORRECT - Global state in async render function:**
```typescript
export async function render(_url, todos = []) {
  const state = new Seidr(todos);

  const result = await renderToString(() => {
    setState(createStateKey("todos"), state);
    return TodoApp();
  });

  clearHydrationContext();
  return result;
}
```

### State Initialization Best Practices

State can be created:
- ✅ Inside component render functions (recommended for component-local state)
- ✅ Inside async render functions (recommended for global/state shared across components)

❌ **Avoid state outside any render context:**
```typescript
// Will miss SSR registration!
const globalState = new Seidr(0);
```

### Component Hierarchy in SSR

When using nested components in SSR, child components are automatically tracked and will be properly destroyed during cleanup. This works the same way as in client-side rendering:

```typescript
import { component, $ } from '@fimbul-works/seidr/node';

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
- Each derived observable registers its parents in order
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

**Testing utilities:**

```typescript
import { runWithRenderContextSync } from 'render-context.node';

it("should render with SSR", () => {
  runWithRenderContextSync(() => {
    // Test code here runs with proper AsyncLocalStorage context
    const scope = new SSRScope();
    // ... SSR test code
  });
});
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

**Cause:** State was created outside the component/async function.

**Solution:** Move Seidr state initialization inside the component function or async render function.

### Elements Not Interactive After Hydration

**Cause:** Seidr instances weren't hydrated correctly (wrong order or missing bindings).

**Solution:** Ensure state is created properly and check hydration data format.

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
