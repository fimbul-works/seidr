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

## `random()` number generator

A deterministic, high-entropy pseudo-random number generator using the SplitMix32 algorithm. Unlike `Math.random()`, this integrates with Seidr's [`AppState`](AppState.md) so the server and client produce the same sequence during hydration, preventing mismatches.

```typescript
import { createValue, mount, random } from '@fimbul-works/seidr';
import { $button, $div } from '@fimbul-works/seidr/html';

const RandomExample = () => {
  const messages = ["Push me", "Poke me", "Try me"];
  const num = createValue(0);

  return $div([
    $button({
      textContent: messages[Math.floor(random() * messages.length)],
      onclick: () => num(Math.floor(random() * 10) + 1)
    }),
    $div({ textContent: num }),
  ]);
};

mount(RandomExample, document.body);
```

### Additional Random Utilities

`random()` is intentionally kept small: it provides a deterministic, SSR-friendly source of pseudo-random numbers.

For higher-level randomization utilities, use [@fimbul-works/random](https://github.com/fimbul-works/random#readme). Its functions accept a random-number generator, so they can use Seidr's `random()` while preserving server/client determinism.

The package includes a large collection of various randomizing utilities such as array shuffling and sampling, weighted selection, statistical distributions, geometry samplers, random strings, and more.

```typescript
import { random } from "@fimbul-works/seidr";
import { $button, $div, $input } from '@fimbul-works/seidr/html';
import { randomString, shuffleArray } from "@fimbul-works/random";

const Quiz = ({ questions }) => {
  const shuffled = shuffleArray(questions, random); // deterministic during hydration
  const inputId = `q-${randomString(8, '0123456789', random)}`; // hydration-safe element ID

  return $div([
    $label({ htmlFor: inputId, textContent: shuffled[0].text }),
    $input({ id: inputId }),
  ]);
};
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
