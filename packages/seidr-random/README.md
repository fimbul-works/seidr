# @fimbul-works/seidr-random

SSR-safe, deterministic pseudo-random number generator for Seidr, based on the SplitMix32 algorithm.

## Overview

Unlike `Math.random()`, `@fimbul-works/seidr-random` integrates with Seidr's `AppState` container so that random sequences generated during Server-Side Rendering (SSR) match the hydration pass deterministically on the client, eliminating hydration mismatches.

## Installation

```bash
pnpm add @fimbul-works/seidr-random
# or
npm install @fimbul-works/seidr-random
```

> **Peer Dependency**: Requires `@fimbul-works/seidr`.

## Usage

```typescript
import { random } from '@fimbul-works/seidr-random';

// Produces a deterministic pseudo-random float between 0 and 1
const val = random();
console.log(val);
```

### Component Example

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

## Integration with `@fimbul-works/random`

`random()` provides a lightweight, deterministic source of pseudo-random numbers.

For advanced utilities (array shuffling, weighted sampling, statistical distributions, random strings), use [@fimbul-works/random](https://github.com/fimbul-works/random#readme). Pass Seidr's `random` function to preserve server/client determinism:

```typescript
import { random } from '@fimbul-works/seidr-random';
import { randomString, shuffleArray } from '@fimbul-works/random';

const shuffled = shuffleArray(items, random); // Deterministic across hydration
const id = `el-${randomString(8, '0123456789', random)}`; // Hydration-safe element ID
```

## Documentation

- [Seidr Random Documentation](https://github.com/fimbul-works/seidr/blob/main/docs/random.md)
- [Official Seidr Addons](https://github.com/fimbul-works/seidr/blob/main/docs/addons.md)
- [Seidr Repository](https://github.com/fimbul-works/seidr)

## License

MIT © [FimbulWorks](https://github.com/fimbul-works)
