## Nested routes

```typescript
const UserLayout = () => {
  return $div({ className: 'user-layout' }, [
    $nav({}, [
      Link({ to: '/users' }, ['List']),
      Link({ to: '/users/create' }, ['Create']),
    ]),
    Router({
      routes: [
        createRoute('/users', UserList),
        createRoute('/users/create', UserCreate),
        createRoute('/users/:id', UserProfile),
        createRoute('/users/:id/edit', UserEdit),
      ],
    }),
  ]);
};
```

## Performance

```typescript
// React: Re-renders entire tree, but reconciler is fast
const [items, setItems] = useState(bigArray);
setItems([...items, newItem]); // Virtual DOM diff

// Seidr: No re-render, but you manage granularity
const items = new Seidr(bigArray);
items.value = [...items.value, newItem]; // O(n) list diff

// For fine-grained updates, derive observables:
const itemCount = items.as(arr => arr.length); // O(1) update
```

### Test Cases:

- 10,000 row table render (initial + update single row)
- Nested component updates (change leaf, measure propagation)
- Form input reactivity (keystroke to UI update latency)
- List operations (add/remove/reorder 1000 items)

### Bundle Size Comparison

| Framework       | Hello World | TodoMVC | Complex App |
|-----------------|-------------|---------|-------------|
| React           | 42KB        | 45KB    | 50KB+       |
| Preact          | 4KB         | 6KB     | 10KB+       |
| Vue 3           | 17KB        | 20KB    | 25KB+       |
| Svelte          | 2KB*        | 5KB     | 8KB+        |
| Solid           | 7KB         | 10KB    | 15KB+       |
| Seidr           | 1.8KB       | 3KB     | 7.0KB       |

## Benchmark Strategy

**1. TodoMVC**
- Standard benchmark, everyone knows it
- Shows list rendering, state management, event handling
- You already have the bundle size for this (2.8KB gzipped)

**2. Real-time Dashboard**
- Multiple reactive subscriptions updating simultaneously
- Tests your graph propagation efficiency
- Shows where virtual DOM reconciliation becomes expensive

**3. Infinite Scroll / Virtualized List**
- Stress test for mount/unmount performance
- Shows memory management (cleanup tracking)
- Demonstrates List() component with key-based diffing

**4. SSR Blog**
- Initial page load metrics (TTFB, FCP, TTI)
- Hydration time comparison
- Bundle transfer + parse time on slow connections

**Metrics to track:**
- Bundle size (minified + gzipped)
- Initial render time (cold start)
- Update performance (10k state changes)
- Memory usage over time (1 hour stress test)
- Hydration time (SSR case)
- Tree-shaking effectiveness (hello world vs full app)
