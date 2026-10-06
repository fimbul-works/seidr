# Seidr Server/Client Boundaries & SSR Hydration

Seidr is designed for isomorphic applications: components can render on a Node.js server to generate static HTML, and seamlessly hydrate on the client to become fully interactive.

---

## 1. Environment Detection & Execution Guards

Seidr provides four primitives in `@fimbul-works/seidr` for managing environment boundaries:

| Utility | Type | Behavior |
| :--- | :--- | :--- |
| `isServer()` | `() => boolean` | Returns `true` in Node.js / SSR server execution. |
| `isClient()` | `() => boolean` | Returns `true` in browser environments. |
| `inServer(fn)` | `<T>(fn: () => T) => T \| undefined` | Executes `fn` **only on the server**. Returns `undefined` on the client. |
| `inClient(fn)` | `<T>(fn: () => T) => T \| undefined` | Executes `fn` **only on the client**. Returns `undefined` on the server. |

### Idiomatic Data Fetching Pattern (from `examples/ssr`):
```typescript
import { createComponent, createValue, inClient, inServer, isServer, Suspense } from '@fimbul-works/seidr';

export const MyPage = createComponent(() => {
  const data = createValue([], { id: 'page-data' });

  // Server loads from internal DB/API, client loads via HTTP fetch:
  const fetchPromise = isServer()
    ? inServer(async () => {
        const result = await db.query();
        data(result);
        return result;
      })!
    : inClient(async () => {
        // If already populated from SSR hydration, reuse immediately:
        if (data().length > 0) return data();
        const res = await fetch('/api/data');
        const result = await res.json();
        data(result);
        return result;
      })!;

  return Suspense(fetchPromise, ContentComponent);
});
```

---

## 2. SSR Safety Rules for Ported Components

When porting client-heavy libraries (like Radix or DnD) to Seidr, follow these strict invariants:

1. **Never Access `window` at Module Level or Component Setup**:
   ```typescript
   // ❌ BAD: Throws in SSR!
   const width = window.innerWidth;

   // ✅ GOOD: Guard inside onMounted:
   onMounted(() => {
     inClient(() => {
       width(window.innerWidth);
     });
   });
   ```

2. **Always Use `getDocument()` Instead of `document`**:
   `getDocument()` resolves to `window.document` in the browser and the SSR JSDOM document on the server.
   ```typescript
   import { getDocument } from '@fimbul-works/seidr';
   const doc = getDocument();
   ```

3. **Event Listeners Belong in `inClient`**:
   Never call `window.addEventListener()` or `document.addEventListener()` without wrapping it in `inClient()` or `onMounted()`.

---

## 3. Deterministic Hydration Matching

During SSR, Seidr generates deterministic IDs so that client-side hydration attaches reactive listeners to the exact corresponding DOM nodes without markup mismatches:

- **Component Scoped IDs**: `createValue()` calls inside a component automatically receive deterministic hierarchical IDs (e.g., `1-1`, `1-2`).
- **Explicit Value IDs**: Giving a `Value` an explicit `id` registers it as a singleton in `AppState`. The server serializes its value into the hydration payload, and the client restores it upon mounting.
- **Random Numbers**: For deterministic PRNG numbers between server markup and client hydration, use `@fimbul-works/seidr-random` (`random()`), which maintains and synchronizes its seed sequence in `AppState`.

---

## 4. `withStorage` Hydration Gotcha

```typescript
const theme = withStorage('app_theme', createValue('dark', { id: 'theme' }));
```

When combining `withStorage` with SSR-hydrated values:
- `withStorage` reads from `localStorage` synchronously during construction on the client.
- If a client has a previously saved value in `localStorage`, it will immediately overwrite the server-hydrated value upon component instantiation.
- Be aware of this precedence: client `localStorage` > SSR snapshot.
