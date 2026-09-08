# Utilities API

Seidr includes several built-in utilities for error wrapping, deterministic random number generation, and type validation.

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

## `random()`

A deterministic, high-entropy pseudo-random number generator using the SplitMix32 algorithm. The random sequence is maintained in `AppState` so that random numbers generated during SSR match the hydration pass deterministically on the client.

**Returns:** `number` — A float between 0 and 1.

```typescript
import { random } from '@fimbul-works/seidr';

const rand = random();
console.log(rand); // Deterministic float in [0, 1)
```

---

## `SeidrError`

The standard error class thrown by Seidr runtime assertions and invalid lifecycle operations.

```typescript
import { SeidrError } from '@fimbul-works/seidr';

throw new SeidrError('Custom Seidr error message');
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
