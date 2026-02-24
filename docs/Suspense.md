## Suspense()

Handles asynchronous loading states for Promises with loading and error fallbacks.

**Parameters:**
- `promiseOrSeidr` - `Promise<T>` or `Seidr<Promise<T>>` to wait for
- `factory` - Function called with resolved value: `(value: T) => SeidrNode`
- `loading` - Optional factory for loading state UI: `() => SeidrNode`
- `error` - Optional factory for error state UI: `(err: Error) => SeidrNode`

**Returns:** A [`SeidrComponent`](components.md#seidrcomponent-type) rooted in a Comment node.

**Example:**
```typescript
import { Suspense, $div, mount } from '@fimbul-works/seidr';

const fetchUser = async (id: string) => {
  const res = await fetch(`/api/user/${id}`);
  return res.json();
};

const UserProfile = (user: any) => $div({ textContent: user.name });

const App = () => {
  return $div({}, [
    Suspense(
      fetchUser('123'),
      (user) => UserProfile(user),
      () => $div({ textContent: 'Loading user...' }),
      (err) => $div({ textContent: `Error: ${err.message}` })
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
  UserProfile,
  LoadingSpinner,
  ErrorMessage
);
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
