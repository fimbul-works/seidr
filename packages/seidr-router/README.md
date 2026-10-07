# @fimbul-works/seidr-router

Declarative, lightweight URL-based routing for Seidr applications, supporting Client-Side Single Page Applications (SPAs) and Server-Side Rendering (SSR) with hydration.

## Features

- **Fine-Grained & Single-Pass**: Integrated directly with Seidr's fine-grained reactivity. No Virtual DOM diffing.
- **Reactive Route Tables (`Value<Route[]>`)**: Unlike traditional routers with frozen static route configurations, route definitions can be a reactive `Value<Route[]>` mutated dynamically at runtime without tearing down or remounting the router.
- **Nested Routing**: Routers automatically form hierarchical trees with relative sub-path resolution.
- **Dynamic Parameters & Wildcards**: Full support for `:param` segments, `*` wildcards, and RegExp routes with named capture groups.
- **Declarative `<Link>` & Interception**: SPA links preventing full reloads, plus `interceptLinks()` for dynamic Markdown/HTML content.
- **Reactive Navigation Hooks**: `useNavigate()`, `usePathname()`, `useRouteParams()`, and `useSearchParams()`.
- **SSR & Hydration Ready**: Serializes and hydrates route state deterministically.

## Installation

```bash
pnpm add @fimbul-works/seidr-router
# or
npm install @fimbul-works/seidr-router
```

> **Peer Dependency**: Requires `@fimbul-works/seidr`.

## Quick Start

```typescript
import { createComponent } from '@fimbul-works/seidr';
import { $div, $h1, $p } from '@fimbul-works/seidr/html';
import { Router, type Route, Link, useRouteParams } from '@fimbul-works/seidr-router';

const Home = () => $h1({ textContent: 'Home' });

const UserProfile = () => {
  const params = useRouteParams();
  return $p({ textContent: params.as((p) => `User Profile: ${p.id}`) });
};

const NotFound = () => $div([
  $p({ textContent: 'Page not found' }),
  Link({ to: '/' }, 'Return Home')
]);

const routes: Route[] = [
  { path: '/', component: Home, exact: true },
  { path: '/users/:id', component: UserProfile },
  { path: '*', component: NotFound }
];

export const App = () => Router(routes);
```

## Signature Feature: Reactive Route Tables (`Value<Route[]>`)

A distinctive capability of `@fimbul-works/seidr-router`—not found in traditional UI libraries—is that the route definitions array passed to `Router()` can be a callable observable `Value<Route[]>`.

This allows route tables to be mutated dynamically at runtime:

```typescript
import { createValue } from '@fimbul-works/seidr';
import { Router, type Route } from '@fimbul-works/seidr-router';
import { HomePage, PublicPage, SecretChamberPage } from './pages.js';

// 1. Initial route table as a reactive Value
export const routes = createValue<Route[]>([
  { path: '/', component: HomePage, exact: true },
  { path: '/public', component: PublicPage },
]);

// 2. Dynamically mutate the route table at runtime
export function unlockSecretChamber() {
  routes((prev) => [
    ...prev,
    { path: '/secret-chamber', component: SecretChamberPage },
  ]);
}


// 3. Router automatically updates without unmounting or tearing down
export const App = () => Router(routes);
```

### Why This Matters:
- **Zero-Teardown Reconciliation**: The router re-evaluates matches against the current URL. If the currently rendered route component still matches, it is preserved in place without remounting.
- **Progressive Disclosure & Easter Eggs**: Progressively reveal new routes, secret areas, and easter eggs based on user discovery and interactions.
- **Role & Auth Transitions**: Dynamically unlock admin or member routes upon authentication without full-page reloads.
- **Plugin Systems**: Dynamically registered plugins can register their own routes into the host route table at runtime.

## Documentation

For full API documentation, tutorials, and examples, see:
- [Seidr Router Documentation](https://github.com/fimbul-works/seidr/blob/main/docs/Router.md)
- [Official Seidr Addons](https://github.com/fimbul-works/seidr/blob/main/docs/addons.md)
- [Seidr Repository](https://github.com/fimbul-works/seidr)

## License

MIT © [FimbulWorks](https://github.com/fimbul-works)
