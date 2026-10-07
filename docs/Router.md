![@fimbul-works/seidr](../public/seidr-logo.svg)

# Router API (`@fimbul-works/seidr-router`)

The official router addon for Seidr provides a lightweight, declarative routing system designed for both Client-Side Single Page Applications (SPAs) and Server-Side Rendering (SSR).

The router supports dynamic path parameters, wildcard routes, regular expression patterns, nested route trees, programmatic navigation, and reactive search query parameters.

---

## Declarative Components

### `Router()`

The declarative routing component that matches the current URL against an array of route definitions and renders the matching route component.

```typescript
import { Router, type Route } from '@fimbul-works/seidr-router';
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

### Reactive Route Tables (`Value<Route[]>`)

A distinctive capability of Seidr's router—not found in conventional UI frameworks—is that `routes` can be a reactive [`Value<Route[]>`](Value.md) rather than a static array.

Most UI libraries (such as React Router, TanStack Router, Next.js, and Vue Router) treat routing definitions as a fixed, immutable tree declared ahead-of-time. Dynamically altering available routes in those systems requires re-instantiating the router provider, rebuilding route manifests, or relying on ad-hoc route guards and redirects.

In Seidr, the route table itself is a first-class observable:

```typescript
import { createValue } from '@fimbul-works/seidr';
import { Router, type Route } from '@fimbul-works/seidr-router';
import { HomePage, PublicPage, SecretPage } from './pages.js';

// 1. Initial route table as a reactive Value
export const routes = createValue<Route[]>([
  { path: '/', component: HomePage, exact: true },
  { path: '/public', component: PublicPage },
]);

// 2. Dynamically mutate the route table at runtime
export function unlockSecretRoute() {
  routes((prev) => [
    ...prev,
    { path: '/secret-chamber', component: SecretPage },
  ]);
}

// 3. Router subscribes to `routes` and reconciles seamlessly
export const App = () => Router(routes);
```

#### Why This Matters & Use Cases:
- **Zero-Teardown Reconciliation**: When `routes` updates, the router re-evaluates the active match against the current URL. If the currently rendered route component still matches, it is preserved in place without remounting, preserving DOM state and scroll position. If a newly registered route now matches the active URL (e.g. unlocking a path while the user was on it or on a 404 fallback), it transitions smoothly.
- **Progressive Disclosure & Easter Eggs**: Applications and exploratory websites can progressively reveal new routes, secret areas, and easter eggs based on user discovery, achievements, or interaction sequences.
- **Role & Auth Transitions**: Dynamically register administrative, moderator, or premium routes upon authentication without requiring full-page reloads or tearing down application layouts.
- **Plugin & Micro-Frontend Systems**: Third-party plugins or dynamically loaded modules can register their own routes into the host application's route table at runtime.


---

### `Link()`

An element creator for client-side navigation. It renders an HTML anchor (`<a>` by default) with an `onclick` handler that prevents standard full-page reloads and triggers client-side router navigation.

```typescript
import { $span } from '@fimbul-works/seidr/html';
import { Link } from '@fimbul-works/seidr-router';

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
  - `activeClass?: string | Value<string>` — CSS class to apply when the link is active.
  - `inactiveClass?: string | Value<string>` — CSS class to apply when the link is inactive.
  - `exact?: boolean | Value<boolean>` (default: `false`) — Whether the link is exact. When `true`, requires the pathname parts to match the pattern parts exactly in length.
  - All standard HTML element properties, attributes, and event handlers.
- `children?: SeidrChild | SeidrChild[]` — Child nodes or components.

**Returns:** `HTMLElementTagNameMap[K]`

---

## Navigation & URL Hooks

Seidr provides reactive hooks that can be called anywhere inside component render trees.

### `useNavigate()`

Returns a programmatic navigation function.

```typescript
import { $button } from '@fimbul-works/seidr/html';
import { useNavigate } from '@fimbul-works/seidr-router';

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
import { $p } from '@fimbul-works/seidr/html';
import { usePathname } from '@fimbul-works/seidr-router';

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

### `useRouteParams()`

Returns the route parameters extracted from the current route pattern as a reactive [`Value<Record<string, string>>`](Value.md).

```typescript
import { $div, $h1 } from '@fimbul-works/seidr/html';
import { useRouteParams } from '@fimbul-works/seidr-router';

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

---

### `useSearchParams()`

Returns a tuple containing a reactive [`Value`](Value.md) of the current URL query parameters and a setter function to update individual query parameters.

```typescript
import { $button, $input, $p } from '@fimbul-works/seidr/html';
import { useSearchParams } from '@fimbul-works/seidr-router';

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
import { createComponent } from '@fimbul-works/seidr';
import { $div, $nav, $p } from '@fimbul-works/seidr/html';
import { Router, type Route, Link } from '@fimbul-works/seidr-router';

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

## Utilities

### `interceptLinks()`

Client-side utility that scans an element (or `document.body`) for anchor tags (`<a>`) and intercepts eligible link clicks to navigate with the Seidr router instead of causing a full-page reload. Ideal for dynamic content such as Markdown-rendered HTML.

```typescript
import { onMounted, useRef } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';
import { interceptLinks } from '@fimbul-works/seidr-router';

const InterceptedLinksExample = () => {
  const containerRef = useRef<HTMLDivElement>();

  onMounted(() => interceptLinks(containerRef()));

  return $div({ ref: containerRef, innerHTML: '<a href="/blog/123">Some post</a>' });
};
```

#### Criteria for link interception:
- The `<a>` element does not have a `target` attribute.
- The destination URL is either a relative path or has the same origin as the router.
- The `<a>` element does not already have an `onclick` handler attached.
- Throws a `SeidrError` if the router system is not initialized.
- Safely no-ops during SSR (`!isClient()`).

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
