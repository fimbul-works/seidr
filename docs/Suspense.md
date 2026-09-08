# Suspense Component

The `Suspense` component handles asynchronous operations and Promise resolution, providing reactive state observables for loading, error, and resolved states.

---

## `Suspense()`

**Generic Type:**
- `T` — The type of data resolved by the Promise.

**Parameters:**
- `promiseOrValue: Promise<T> | Value<Promise<T>>` — A Promise or a reactive [`Value`](Value.md) emitting Promises.
- `factory: (state: SuspenseState<T>) => SeidrChild` — Render function receiving the reactive suspense state.
- `name?: string` (default: `"Suspense"`) — Optional component name.

**Returns:** [`SeidrComponent`](components.md#seidrcomponent-type)

### `SuspenseState<T>`
- `state: Value<SuspenseStatus>` — Reactive status (`'pending' | 'resolved' | 'error'`).
- `value: Value<T | null>` — Reactive resolved data (or `null` if pending/error).
- `error: Value<Error | null>` — Reactive error instance (or `null` if pending/resolved).

```typescript
import { Suspense, Switch, createValue, mount } from '@fimbul-works/seidr';
import { $div, $p, $span } from '@fimbul-works/seidr/html';

interface UserData {
  name: string;
  email: string;
}

const fetchUser = async (id: string): Promise<UserData> => {
  const res = await fetch(`https://api.example.com/users/${id}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
};

const UserProfile = (id: string) => {
  return $div({ className: 'user-profile' }, [
    Suspense<UserData>(
      fetchUser(id),
      ({ state, value, error }) => Switch(state, {
        pending: () => $p({ textContent: 'Loading user profile...' }),
        resolved: () => $div({}, [
          $p({ textContent: value.as((u) => `Name: ${u?.name}`) }),
          $p({ textContent: value.as((u) => `Email: ${u?.email}`) })
        ]),
        error: () => $p({ className: 'error', textContent: error.as((e) => `Error: ${e?.message}`) })
      })
    )
  ]);
};

mount(UserProfile('123'), document.body);
```

---

## Reactive Promise Re-fetching

You can pass a reactive `Value<Promise<T>>` to `Suspense`. Whenever the reactive Promise changes (e.g. when a query parameter or selected ID updates), `Suspense` automatically cancels outdated requests and transitions back to `'pending'` until the new Promise resolves.

```typescript
import { Suspense, Switch, createValue } from '@fimbul-works/seidr';
import { $button, $div, $p } from '@fimbul-works/seidr/html';

const selectedUserId = createValue('1');

// Reactive Promise derived from selectedUserId
const userPromise = selectedUserId.as((id) => fetchUser(id));

const DynamicUserView = () => {
  return $div({}, [
    $div({ className: 'controls' }, [
      $button({ textContent: 'User 1', onclick: () => selectedUserId('1') }),
      $button({ textContent: 'User 2', onclick: () => selectedUserId('2') })
    ]),
    Suspense(
      userPromise,
      ({ state, value, error }) => Switch(state, {
        pending: () => $p({ textContent: 'Fetching...' }),
        resolved: () => $p({ textContent: value.as((u) => `User: ${u?.name}`) }),
        error: () => $p({ textContent: error.as((e) => `Failed: ${e?.message}`) })
      })
    )
  ]);
};
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
