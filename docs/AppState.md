<img src="../public/seidr-logo.svg" alt="Seidr logo" style="height:150px;margin-bottom:-2.5em;"/>

# AppState API

`AppState` is Seidr's central execution context manager. It coordinates application-level data storage, component registry, DOM node indexing, deterministic ID generation, and pluggable state hydration strategies across the Server-Side Rendering (SSR) and client hydration boundary.

In the browser, a default singleton `AppState` is maintained throughout the application lifecycle. During SSR in Node.js, an isolated `AppState` instance is automatically created per request via `AsyncLocalStorage`, ensuring strict request isolation without cross-user state leaks.

---

## `getAppState()`

Retrieves the current active application state instance.

```typescript
import { getAppState } from '@fimbul-works/seidr';

const appState = getAppState();
console.log('Active request/context ID:', appState.ctxID);
```

**Returns:** [`AppState`](#appstate-interface)

---

## `AppState` Interface

```typescript
export interface AppState {
  ctxID: number;
  uniqID: number;
  components: Set<SeidrComponent>;
  nodeIndex: WeakMap<ChildNode, SeidrComponent>;
  markers: Map<string, [Comment, Comment]>;
  data: Map<string, any>;
  strategies: Map<string, DataStrategy>;

  hasData(key: string): boolean;
  getData<T>(key: string, defaultValue?: T): T | undefined;
  setData<T>(key: string, value: T): void;
  deleteData(key: string): boolean;

  defineDataStrategy<T, I>(key: string, captureFn: CaptureDataFn<T>, restoreFn: RestoreDataFn<I>): void;
  getDataStrategy<T>(key: string): DataStrategy<T> | undefined;

  destroy(): void;
}
```

### Application Data Store

`AppState` provides a scoped key-value store for features, singletons, and extensions:

- **`hasData(key: string): boolean`** — Checks if an entry exists for the given key.
- **`getData<T>(key: string, defaultValue?: T): T | undefined`** — Retrieves a stored value, or returns the optional default value if not found.
- **`setData<T>(key: string, value: T): void`** — Sets the value for a given key.
- **`deleteData(key: string): boolean`** — Removes a stored key from the application state.

```typescript
import { getAppState } from '@fimbul-works/seidr';

const appState = getAppState();

// Storing application-level service or state
appState.setData('apiClient', new ApiClient({ token: 'xyz' }));

// Retrieving stored data with type safety
const client = appState.getData<ApiClient>('apiClient');
```

---

## Pluggable Data Strategies for SSR & Hydration

A **Data Strategy** enables Seidr features, plugins, or user code to serialize custom state on the server during `renderToString()` and restore it seamlessly on the client during `hydrate()`.

### Defining a Data Strategy: `defineDataStrategy()`

```typescript
appState.defineDataStrategy<T, I>(
  key: string,
  captureFn: () => T,
  restoreFn: (data: I) => void
): void;
```

#### Parameters:
- `key: string` — Unique identifier for the serialized state slice.
- `captureFn: () => T` — Executed on the server at the end of SSR to extract serializable state.
- `restoreFn: (data: I) => void` — Executed on the client during `hydrate()` before components re-render.

```typescript
import { getAppState } from '@fimbul-works/seidr';

const DATA_KEY_PREFERENCES = 'app.preferences';

export function initPreferences(initialTheme = 'light') {
  const appState = getAppState();

  // Define strategy if not already registered
  if (!appState.getDataStrategy(DATA_KEY_PREFERENCES)) {
    appState.defineDataStrategy(
      DATA_KEY_PREFERENCES,
      // Server-side capture
      () => appState.getData('theme'),
      // Client-side restore
      (theme: string) => appState.setData('theme', theme)
    );
  }

  if (!appState.hasData('theme')) {
    appState.setData('theme', initialTheme);
  }
}
```

### Built-in Core Data Strategies

Seidr uses `AppState` data strategies internally to provide seamless SSR hydration for its core subsystems:

| Key | Subsystem | Description |
| :--- | :--- | :--- |
| `DATA_KEY_STATE` (`"seidr.state"`) | Reactive Values | Captures all registered `Value` instances created with `{ hydrate: true }` and restores them during hydration. |
| `DATA_KEY_ROUTER` (`"seidr.router"`) | Router | Captures the server request URL and restores it during client-side hydration so the router starts on the exact server-matched route. |
| `DATA_KEY_RANDOM` (`"seidr.random"`) | `random()` | Serializes the SplitMix32 PRNG seed and sequence per component so random numbers generated on the server match client hydration without markup mismatches. |

---

## SSR Isolation with `initialAppState`

When rendering server-side with `renderToString()`, you can pass initial data directly to the per-request `AppState`:

```typescript
import { renderToString } from '@fimbul-works/seidr/ssr';
import { App } from './App.js';

app.get('/users/:id', async (req, res) => {
  const { html, hydrationData } = await renderToString(
    () => App({ userId: req.params.id }),
    // Initial AppState data for this request:
    {
      currentUser: { id: req.params.id, role: 'admin' },
      requestId: req.headers['x-request-id']
    }
  );

  res.send(...);
});
```

All data supplied via `initialAppState` is accessible during the render pass via `getAppState().getData(...)`.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
