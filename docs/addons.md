![@fimbul-works/seidr](../public/seidr-logo.svg)

# Official Seidr Addons

Seidr has a small core, but provides a rich API to extend it. Here are some official addons.

---

## `@fimbul-works/seidr-random`

### `random()`

A deterministic, high-entropy pseudo-random number generator using the SplitMix32 algorithm. The random sequence is maintained in [`AppState`](AppState.md) so that random numbers generated during SSR match the hydration pass deterministically on the client.

**Returns:** `number` — A float between 0 and 1.

```typescript
import { random } from '@fimbul-works/seidr-random';

const rand = random();
console.log(rand); // Deterministic float in [0, 1)
```

Read more in the [package README](https://github.com/fimbul-works/seidr-random#readme).

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
