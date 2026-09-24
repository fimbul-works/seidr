# Lazy Component

The `lazy()` function creates an asynchronous, code-split component from a dynamic `import()`. It delays loading the component module until it is first rendered or explicitly preloaded with `.preload()`.

---

## `lazy()`

**Generic Type:**
- `P` — The props type accepted by the loaded component (defaults to `void`).

**Parameters:**
- `loader: LazyComponentLoader<P>` — A function returning a dynamic import `() => import(...)`, or a Promise directly.
- `options?: LazyOptions` — Optional configuration:
  - `fallback?: () => SeidrChild` — Content to render while the component is loading.
  - `onError?: (error: Error) => SeidrChild` — Content to render if loading rejects.
  - `name?: string` (default: `"LazyComponent"`) — Component name for debugging and SSR tracking.

**Returns:** `LazyComponentFactory<P>` (satisfies `SeidrComponentFactory<P>` with a `.preload()` method).

---

## Basic Usage

```typescript
import { lazy, mount } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

// Dynamic import with ES module default export
const HeavyChart = lazy(() => import('./components/HeavyChart.js'), {
  fallback: () => $div({ textContent: 'Loading chart...' })
});

const App = () => {
  return $div({}, [
    HeavyChart({ data: [1, 2, 3] })
  ]);
};

mount(App, document.body);
```

---

## Route-Level Code Splitting

`lazy()` integrates directly with Seidr's `Router`. Since `lazy()` returns a standard `SeidrComponentFactory`, you can pass lazy components straight into your route definitions:

```typescript
import { Router, lazy } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const Home = lazy(() => import('./pages/home.js'));
const About = lazy(() => import('./pages/about.js'), {
  fallback: () => $div({ textContent: 'Loading page...' })
});
const Settings = lazy(() => import('./pages/settings.js'));

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/settings', component: Settings }
];

export const App = () => Router(routes);
```

When a user visits `/about`, only the chunk for that page is downloaded. Once loaded, the module is cached in memory—navigating back to `/about` later renders instantly without any loading state.

---

## Preloading with `.preload()`

You can trigger the dynamic import ahead of time (e.g. when the user hovers over a navigation link or during route prefetching):

```typescript
import { lazy } from '@fimbul-works/seidr';
import { $a } from '@fimbul-works/seidr/html';

const Dashboard = lazy(() => import('./pages/dashboard.js'));

// Preload on mouse hover so the page is ready before click
const NavLink = () => {
  return $a({
    href: '/dashboard',
    textContent: 'Dashboard',
    onmouseenter: () => Dashboard.preload()
  });
};
```

---

## Error Handling

If the network is offline or the chunk fails to load, `lazy()` catches the error and can display a fallback UI via `onError`:

```typescript
const FeatureView = lazy(() => import('./feature.js'), {
  fallback: () => $div({ textContent: 'Loading feature...' }),
  onError: (error) => $div({
    className: 'error-banner',
    textContent: `Failed to load feature: ${error.message}`
  })
});
```

When a module load fails, `lazy()` automatically clears its cache so subsequent attempts will retry fetching rather than remaining permanently failed.

---

## Integration with `Suspense`

`lazy()` can also be used directly inside a `Suspense` component:

```typescript
import { Suspense, Switch, lazy } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const Analytics = lazy(() => import('./analytics.js'));

const View = () => {
  return Suspense(Analytics, ({ state }) => Switch(state, {
    pending: () => $div({ textContent: 'Loading analytics...' }),
    resolved: () => Analytics(),
    error: () => $div({ textContent: 'Could not load analytics' })
  }));
};
```

---

## Server-Side Rendering (SSR)

When rendering with `renderToString()`, `lazy()` automatically registers its load promise with `SSRScope`. The server will await the module resolution before returning the HTML, ensuring that the full markup of the lazy component is included in the server-rendered response.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
