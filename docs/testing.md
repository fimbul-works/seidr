<img src="../public/seidr-logo.svg" alt="Seidr logo" style="height:150px;margin-bottom:-2.5em;"/>

# Testing Utilities (`@fimbul-works/seidr/testing`)

Seidr exports dedicated testing utilities via `@fimbul-works/seidr/testing` to simplify writing Vitest or Jest tests for isomorphic components, dual-mode (Client + SSR) behavior, DOM output, and routing.

---

## Dual-Mode Test Runners

### `describeDualMode()`

Runs an entire test suite twice: once in simulated **Client Mode** (browser environment) and once in **SSR Mode** (server rendering).

```typescript
import { describeDualMode } from '@fimbul-works/seidr/testing';
import { createComponent, createValue } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';
import { it, expect } from 'vitest';

describeDualMode('MyComponent', () => {
  it('renders properly in both client and SSR environments', () => {
    const count = createValue(10);
    const el = $div({ textContent: count.as((c) => `Count: ${c}`) });

    expect(el.textContent).toBe('Count: 10');
  });
});
```

---

### `itHasParity()`

Runs an individual test in both Client and SSR modes, asserting that the behavior holds identically across both environments.

```typescript
import { itHasParity } from '@fimbul-works/seidr/testing';
import { createValue } from '@fimbul-works/seidr';
import { expect } from 'vitest';

itHasParity('Value derivation parity', () => {
  const val = createValue(5);
  const doubled = val.as((n) => n * 2);

  expect(doubled()).toBe(10);
});
```

---

## Environment & State Control

- **`enableClientMode()`** — Switches current test context to browser mode.
- **`enableSSRMode()`** — Switches current test context to SSR mode.
- **`setupAppState()` / `clearTestAppState()`** — Prepares or resets an isolated [`AppState`](AppState.md) for unit tests.
- **`mockLocation(url)`** — Mocks `window.location` for router unit tests.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
