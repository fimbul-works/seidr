<img src="../public/seidr-logo.svg" alt="Seidr logo" style="height:150px;margin-bottom:-2.5em;"/>

# Router API

Seidr includes a built-in, lightweight, declarative routing system designed for both Client-Side Single Page Applications (SPAs) and Server-Side Rendering (SSR).

The router supports dynamic path parameters, wildcard routes, regular expression patterns, nested route trees, programmatic navigation, reactive search query parameters, and custom router drivers (browser history or URL hash).

---

## Declarative Components

### `Router()`

The declarative routing component that matches the current URL against an array of route definitions and renders the matching route component.

```typescript
import { Router, type Route } from '@fimbul-works/seidr';
import { Home } from './pages/Home.js';
import { UserProfile } from './pages/UserProfile.js';
import { NotFound } from './pages/NotFound.js';

const routes: Route[] = [
  { path: '/', component: Home, exact: true },
  { path: '/users/:id', component: UserProfile },
  { path: '*', component: NotFound }
];

export const App = () => Router(routes);
```

#### Parameters:
- `routes: Array<Route> | Value<Array<Route>>` — Static array of route definitions, or a reactive [`Value`](Value.md) allowing dynamic route changes.
- `options?: RouterOptions` — Optional router configuration:
  - `router?: RouterInterface` (default: `browserRouter()`) — Custom router instance (e.g. `hashRouter()`).
  - `url?: string | URL | Location` — Initial URL (defaults to `window.location.pathname` in the browser or `"/"` in SSR).
- `name?: string` (default: `"Router"`) — Component name used for debugging and SSR tracking.

**Returns:** [`SeidrComponent`](components.md#seidrcomponent-type)

#### Route Configuration: `Route`

```typescript
export interface Route {
  path: string | RegExp;
  component: SeidrComponentFactoryOrFunction<any>;
  exact?: boolean;
}
```

- **`path: string | RegExp`**:
  - Exact path: `"/about"`
  - Dynamic route parameters: `"/users/:id"`, `"/posts/:category/:slug"`
  - Wildcard / Fallback: `"*"` (captures the remainder of the path into `params['*']`)
  - Regular expressions: `/^\\/item-(?<id>\\d+)$/` (named capture groups are extracted into params)
- **`component: SeidrComponentFactoryOrFunction`**: A component factory (e.g., from `createComponent` or `lazy`) or a plain function returning `SeidrChild`.
- **`exact?: boolean`** (default: `false`): When `true`, requires the pathname parts to match the pattern parts exactly in length.

---

### `Link()`

An element creator for client-side navigation. It renders an HTML anchor (`<a>` by default) with an `onclick` handler that prevents standard full-page reloads and triggers client-side router navigation.

```typescript
import { Link } from '@fimbul-works/seidr';
import { $span } from '@fimbul-works/seidr/html';

// Basic Link
const homeLink = Link({ to: '/' }, 'Home');

// Link with reactive destination and custom child elements
const userLink = Link(
  {
    to: userId.as((id) => `/users/${id}`),
    className: 'nav-link'
  },
  [
    $span({ textContent: 'View Profile' })
  ]
);

// Custom element tag (e.g. button styled as a link)
const buttonLink = Link({ to: '/dashboard', tagName: 'button' }, 'Go to Dashboard');
```

#### Parameters:
- `props: LinkProps<K> & SeidrElementProps<K>`:
  - `to: string | Value<string>` — The destination route pathname or URL.
  - `tagName?: K` (default: `"a"`) — HTML element tag to create.
  - All standard HTML element properties, attributes, and event handlers.
- `children?: SeidrChild | SeidrChild[]` — Child nodes or components.

**Returns:** `HTMLElementTagNameMap[K]`

---

## Navigation & URL Hooks

Seidr provides reactive hooks that can be called anywhere inside component render trees.

### `useNavigate()`

Returns a programmatic navigation function.

```typescript
import { useNavigate } from '@fimbul-works/seidr';
import { $button } from '@fimbul-works/seidr/html';

const NavigationControls = () => {
  const navigate = useNavigate();

  return [
    // Push new history entry
    $button({
      textContent: 'Go to Settings',
      onclick: () => navigate('/settings')
    }),

    // Replace current history entry
    $button({
      textContent: 'Redirect to Home',
      onclick: () => navigate('/', true)
    }),

    // Delta history navigation (back/forward)
    $button({
      textContent: 'Go Back',
      onclick: () => navigate(-1)
    })
  ];
};
```

#### Returns: `NavigateFn`
- `navigate(to: string, replace?: boolean): void` — Navigates to a path.
- `navigate(delta: number): void` — Steps backward or forward in browser history (e.g. `-1`, `1`).

---

### `usePathname()`

Returns the current router pathname as a reactive, read-only [`Value<string>`](Value.md).

```typescript
import { usePathname } from '@fimbul-works/seidr';
import { $p } from '@fimbul-works/seidr/html';

const CurrentRouteDisplay = () => {
  const pathname = usePathname();

  return $p({
    textContent: pathname.as((path) => `Current Path: ${path}`)
  });
};
```

> [!NOTE]
> In nested routers, `usePathname()` returns the local pathname relative to the parent router's matched prefix.

---

### `useRouteParams()` / `useRouterParams()`

Returns the route parameters extracted from the current route pattern as a reactive [`Value<Record<string, string>>`](Value.md).

```typescript
import { useRouteParams } from '@fimbul-works/seidr';
import { $div, $h1 } from '@fimbul-works/seidr/html';

// Route: "/users/:userId/posts/:postId"
const PostView = () => {
  const params = useRouteParams();

  return $div({}, [
    $h1({
      textContent: params.as((p) => `User ${p.userId} - Post ${p.postId}`)
    })
  ]);
};
```

`useRouterParams` is an alias for `useRouteParams`.

---

### `useSearchParams()`

Returns a tuple containing a reactive [`Value`](Value.md) of the current URL query parameters and a setter function to update individual query parameters.

```typescript
import { useSearchParams } from '@fimbul-works/seidr';
import { $button, $input, $p } from '@fimbul-works/seidr/html';

const ProductFilter = () => {
  const [searchParams, setSearchParam] = useSearchParams();

  return [
    $input({
      type: 'text',
      placeholder: 'Filter by category...',
      value: searchParams.as((params) => params.category ?? ''),
      oninput: (e: Event) => {
        const val = (e.target as HTMLInputElement).value;
        setSearchParam('category', val);
      }
    }),
    $p({
      textContent: searchParams.as((p) => `Selected sort: ${p.sort ?? 'default'}`)
    }),
    $button({
      textContent: 'Sort Ascending',
      onclick: () => setSearchParam('sort', 'asc')
    })
  ];
};
```

#### Returns: `[Value<Record<string, string>>, (name: string, value: string) => void]`
- `searchParams: Value<Record<string, string>>` — Reactive record of all URL query parameters.
- `setParam: (name: string, value: string) => void` — Updates a search parameter and pushes the new URL.

---

## Nested Routing

Seidr routers automatically coordinate as a hierarchical tree. When a parent `Router` matches a prefix, any child `Router` rendered inside that route automatically scopes its paths relative to the parent router's matched path.

```typescript
import { Router, type Route, Link } from '@fimbul-works/seidr';
import { $div, $nav, $p } from '@fimbul-works/seidr/html';

// Child routes inside the Admin section
const adminRoutes: Route[] = [
  { path: '/', component: () => $p({ textContent: 'Admin Dashboard Overview' }), exact: true },
  { path: '/users', component: () => $p({ textContent: 'Manage Users' }) },
  { path: '/reports', component: () => $p({ textContent: 'System Reports' }) }
];

const AdminLayout = () => {
  return $div({ className: 'admin-layout' }, [
    $nav({}, [
      Link({ to: '/admin' }, 'Overview'),
      Link({ to: '/admin/users' }, 'Users'),
      Link({ to: '/admin/reports' }, 'Reports')
    ]),
    // Nested router handles /admin/* paths relative to /admin
    Router(adminRoutes)
  ]);
};

// Root router
const rootRoutes: Route[] = [
  { path: '/', component: () => $p({ textContent: 'Public Home' }), exact: true },
  { path: '/admin/*', component: AdminLayout }
];

export const App = () => Router(rootRoutes);
```

---

## Router Drivers & Initialization

### `initRouter()`

Initializes the global router state within the current [`AppState`](AppState.md). Called automatically by `Router()`, `Link()`, and all router hooks.

```typescript
import { initRouter } from '@fimbul-works/seidr';

// Initialize with an explicit initial URL (useful in tests or custom SSR servers)
initRouter('/blog/post-1');
```

- When running under SSR, `initRouter` defines an [`AppState`](AppState.md) hydration strategy under `DATA_KEY_ROUTER`, serializing the initial URL and restoring it deterministically during client hydration.

### `browserRouter()`

Returns the singleton `RouterInterface` backed by standard HTML5 browser history (`window.history.pushState` / `window.history.replaceState`).

```typescript
import { browserRouter } from '@fimbul-works/seidr';

const router = browserRouter();
console.log(router.pathname()); // Current path
router.push('/dashboard');      // Navigate
```

### `hashRouter()`

Returns the singleton `RouterInterface` backed by the URL hash fragment (e.g. `#/about`, `#/users/42`). Ideal for static hosting or environments without URL rewriting.

```typescript
import { Router, hashRouter } from '@fimbul-works/seidr';

export const App = () => Router(routes, { router: hashRouter() });
```

### `history()`

Low-level history navigation controller.

```typescript
import { history } from '@fimbul-works/seidr';

const hist = history();
hist.push('/page-2');
hist.replace('/page-2-edited');
hist.go(-1);
```

---

## Matching & Routing Utilities

### `matchRoute()`

Matches a pathname against a list of route definitions.

```typescript
import { matchRoute, type Route } from '@fimbul-works/seidr';

const routes: Route[] = [
  { path: '/users/:id', component: () => null }
];

const match = matchRoute('/users/42?tab=activity', routes);
if (match) {
  console.log(match.index);       // 0
  console.log(match.params);      // { id: '42' }
  console.log(match.matchedPath); // "/users/42"
}
```

### `parseRouteParams()`

Parses route parameters from a pattern and pathname.

```typescript
import { parseRouteParams } from '@fimbul-works/seidr';

const params1 = parseRouteParams('/users/:id', '/users/100');
console.log(params1); // { id: '100' }

const params2 = parseRouteParams('/files/*', '/files/docs/2026/spec.pdf');
console.log(params2); // { '*': 'docs/2026/spec.pdf' }

const mismatch = parseRouteParams('/users/:id', '/posts/100');
console.log(mismatch); // false
```

### `addPopstateListener()` & `removePopstateListener()`

Registers and unregisters listeners triggered when the URL changes via browser forward/back buttons.

```typescript
import { addPopstateListener, removePopstateListener } from '@fimbul-works/seidr';

const onPop = (url: string) => {
  console.log('Navigated to:', url);
};

addPopstateListener(onPop);
// Later:
removePopstateListener(onPop);
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
