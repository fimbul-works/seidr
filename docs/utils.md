![@fimbul-works/seidr](../public/seidr-logo.svg)

# Utilities API

Seidr includes several built-in utilities for error wrapping, deterministic random number generation, and type validation.

---

## `SeidrError`

The standard error class thrown by Seidr runtime assertions and invalid lifecycle operations.

```typescript
import { SeidrError } from '@fimbul-works/seidr';

throw new SeidrError('Custom Seidr error message');
```

---

## `wrapError()`

Ensures a caught value is an instance of `Error` or a custom error subclass (e.g. `SeidrError`).

**Parameters:**
- `err: any` — The caught value to wrap.
- `errorClass?: Constructor<E>` (default: `Error`) — Target error constructor class.

**Returns:** `E` — The error instance.

```typescript
import { wrapError, SeidrError } from '@fimbul-works/seidr';

try {
  throw 'Something went wrong';
} catch (e) {
  const err = wrapError(e, SeidrError);
  console.log(err instanceof SeidrError); // true
  console.log(err.message); // "Something went wrong"
}
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
