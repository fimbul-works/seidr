## Suspense()

Handles asynchronous loading states for Promises with reactive states.

**Parameters:**
- `promiseOrSeidr` - `Promise<T>` or `Seidr<Promise<T>>` to wait for
- `factory` - Function called with reactive states: `(state: SuspenseState<T>) => SeidrNode`

`SuspenseState<T>` includes:
- `value`: `Seidr<T | null>` - The resolved value
- `state`: `Seidr<'pending' | 'resolved' | 'error'>` - The current status
- `error`: `Seidr<Error | null>` - Any error that occurred

**Returns:** A [`SeidrComponent`](components.md#seidrcomponent-type) handling the promise state.

**Example:**
```typescript
import { Suspense, Switch, mount } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const fetchUser = async (id: string) => {
  const res = await fetch(`/api/user/${id}`);
  return res.json();
};

const UserProfile = (user: any) => $div({ textContent: user.name });

const App = () => {
  return $div({}, [
    Suspense(
      fetchUser('123'),
      ({ state, value, error }) => Switch(state, {
        pending: () => $div({ textContent: 'Loading user...' }),
        resolved: () => UserProfile(value.value),
        error: () => $div({ textContent: `Error: ${error.value?.message}` })
      })
    )
  ]);
};

mount(App, document.body);
```

**Reactive Usage:**

You can pass a [`Seidr<Promise<T>>`](Seidr.md#seidr-class) to `Suspense` to automatically handle promise updates. This is powerful for data fetching that depends on other reactive state.

```typescript
const userId = new Seidr('1');

// Create a reactive promise that updates whenever userId changes
const userIdPromise = userId.as(id =>
  fetch(`/api/user/${id}`).then(r => r.json())
);

Suspense(
  userIdPromise,
  ({ state, value, error }) => Switch(state, {
    pending: LoadingSpinner,
    resolved: () => UserProfile(value.value),
    error: () => ErrorMessage(error.value)
  })
);
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
