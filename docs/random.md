![@fimbul-works/seidr](../public/seidr-logo.svg)

# SSR-friendly `random()` number generator (`@fimbul-works/seidr-random`)

A deterministic, high-entropy pseudo-random number generator using the SplitMix32 algorithm. Unlike `Math.random()`, this integrates with Seidr's [`AppState`](AppState.md) so the server and client produce the same sequence during hydration, preventing mismatches.

## Usage Example

```typescript
import { createValue, mount } from '@fimbul-works/seidr';
import { $button, $div } from '@fimbul-works/seidr/html';
import { random } from '@fimbul-works/seidr-random';

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

## Additional Random Utilities

`random()` is intentionally kept small: it provides a deterministic, SSR-friendly source of pseudo-random numbers.

For higher-level randomization utilities, use [@fimbul-works/random](https://github.com/fimbul-works/random#readme). Its functions accept a random-number generator, so they can use Seidr's `random()` while preserving server/client determinism.

The package includes a large collection of various randomizing utilities such as array shuffling and sampling, weighted selection, statistical distributions, geometry samplers, random strings, and more.

```typescript
import { $button, $div, $input } from '@fimbul-works/seidr/html';
import { random } from "@fimbul-works/seidr-random";
import { randomString, shuffleArray } from "@fimbul-works/random";

const Quiz = ({ questions }) => {
  const shuffled = shuffleArray(questions, random);              // deterministic during hydration
  const inputId = `q-${randomString(8, '0123456789', random)}`;  // hydration-safe element ID

  return $div([
    $label({ htmlFor: inputId, textContent: shuffled[0].text }),
    $input({ id: inputId }),
  ]);
};
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
