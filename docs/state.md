# Global State Management

### useState()

A hook for managing shared application state as a global Seidr singleton.

> 💡 **Comparison to React:** While it shares a similar name, Seidr's `useState()` is **global**, not local. It implements a singleton pattern: every call with the same key returns the exact same observable instance. Use this to share state across multiple independent components.

**Generic Type:** `T` - The type of value stored

**Parameters:**
- `key` - Unique string key for the state, or a `string | StateKey<T>`
- `value` - The initial value of the state

**Returns:** `[Seidr<T>, (v: T | Seidr<T>) => Seidr<T>]` - A tuple with the shared Seidr observable and a setter function.

```typescript
import { useState } from '@fimbul-works/seidr';

const MyComponent = () => {
  const [count, setCount] = useState<number>('count', 0);

  return $button({
    textContent: count.as(n => `Count: ${n}`),
    onclick: () => setCount(count.value! + 1)
  });
};
```

**Singleton Pattern:**
The first time `useState()` is called for a key, it creates the [`Seidr`](../seidr/docs/Seidr.md#seidr-class) instance. All subsequent calls with the same key (in any component) return that same instance. This simplifies cross-component synchronization.

**SSR Note:**
`useState()` is safe for SSR because it resolves the state context lazily. During server rendering, state is automatically isolated to the specific request context.

---

## useStorage()

Bind a [`Seidr`](Seidr.md#seidr-class) observable to localStorage/sessionStorage with automatic persistence.

**Parameters:**
- `key` - Storage key.
- `seidr` - The observable to bind.
- `storage` - Optiona Storage object (defaults to `localStorage`).
- `onError` - Optional error handler (signature `(error: Error) => void`).

**Returns:** The a cleanup function to remove the binding.

```typescript
const sessionData = new Seidr('value');
const cleanup = useStorage(
  'session-key',
  sessionData,
  sessionStorage
);
sessionData.value = 'new value'; // Updates session storage

cleanup(); // Removes the binding
```

---
## createStateKey()

Create a type-safe state key for application-level state storage.

**Generic Type:** `T` - The type of value that will be stored

**Returns:** A unique `symbol` that carries type information

```typescript
import { createStateKey } from '@fimbul-works/seidr';

const THEME = createStateKey<string>('theme');
const USER_ID = createStateKey<number>('userId');
const SETTINGS = createStateKey<{ theme: string }>('settings');
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
