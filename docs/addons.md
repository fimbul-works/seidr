![@fimbul-works/seidr](../public/seidr-logo.svg)

# Official Seidr Addons

Seidr has a small core, but provides a rich API to extend it. Here are some official addons.

---

## `@fimbul-works/seidr-router`

Declarative client and SSR routing for Seidr applications. A signature capability not found in other UI libraries is that route tables can be a reactive [`Value<Route[]>`](Router.md#reactive-route-tables-valueroute)—allowing routes to be dynamically added, removed, or mutated at runtime without unmounting or tearing down the router. Also supports nested route trees, dynamic route parameters, query string synchronization, declarative [`Link`](Router.md#link), and programmatic navigation hooks.

```typescript
import { Router, type Route, Link, useRouteParams } from '@fimbul-works/seidr-router';
import { $div } from '@fimbul-works/seidr/html';

export const App = () => Router([
  { path: '/', component: () => $div({ textContent: 'Home' }), exact: true },
  { path: '/users/:id', component: () => {
    const params = useRouteParams();
    return $div({ textContent: params.as((params) => `User ${params.id}`) });
  }},
  { path: '*', component: () => Link({ to: '/' }, 'Go back home') }
]);
```

Read more in the [Router API documentation](Router.md).

---

## `@fimbul-works/seidr-random`

A deterministic, high-entropy pseudo-random number generator using the SplitMix32 algorithm. The random sequence is maintained in [`AppState`](AppState.md) so that random numbers generated during SSR match the hydration pass deterministically on the client.

```typescript
import { random } from '@fimbul-works/seidr-random';

const rand = random();
console.log(rand); // Deterministic float in [0, 1]
```

Read more in the [`random()` API documentation](random.md).

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
