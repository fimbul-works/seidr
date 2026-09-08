# Component & Lifecycle API

Seidr components are functions that create and return UI elements. They receive configuration via arguments (*"props"*), create reactive state with [`createValue()`](Value.md#createvalue), and manage resource lifecycles using dedicated lifecycle hooks like [`onMounted()`](#onmounted), [`onAttached()`](#onattached), and [`onUnmounted()`](#onunmounted).

---

## `createComponent()`

Defines a component with automatic lifecycle tracking and deterministic ID generation.

```typescript
import { createComponent, createValue } from '@fimbul-works/seidr';
import { $button, $div, $span } from '@fimbul-works/seidr/html';

interface CounterProps {
  initialCount?: number;
  step?: number;
  label?: string;
}

export const Counter = createComponent<CounterProps>(({
  initialCount = 0,
  step = 1,
  label = 'Counter'
} = {}) => {
  const count = createValue(initialCount);

  return $div({ className: 'counter' }, [
    $span({ textContent: `${label}: ` }),
    $span({ textContent: count.as(String) }),
    $button({
      textContent: `+${step}`,
      onclick: () => count((c) => c + step)
    })
  ]);
}, 'Counter');
```

**Parameters:**
- `factory: (props: P) => SeidrChild | SeidrChild[]` — Pure function receiving props and returning elements.
- `name?: string` (default: `"Component"`) — Component name used for debugging and deterministic SSR ID namespacing.

**Returns:** `SeidrComponentFactory<P>`

### Component Props & State

Components accept arguments for configuration. Props are captured when the component is created:

- Destructure props with default fallbacks: `({ prop = default } = {})`.
- Each component invocation creates an isolated instance with its own reactive state.
- Child components can be passed directly as children in element arrays without JSX or extra wrapping.

```typescript
import { createComponent } from '@fimbul-works/seidr';
import { $div, $header, $img } from '@fimbul-works/seidr/html';

const Header = createComponent(() => $header({ textContent: 'User Profile' }), 'Header');
const Avatar = createComponent<{ src: string }>(({ src }) => $img({ src, alt: 'Avatar' }), 'Avatar');

const UserProfile = createComponent(() => {
  return $div({ className: 'profile' }, [
    Header(),
    Avatar({ src: '/avatar.png' })
  ]);
}, 'UserProfile');
```

---

## `mount()`

Mounts a component or element tree into a DOM container element.

```typescript
import { mount } from '@fimbul-works/seidr';
import { App } from './App.js';

const unmount = mount(App, document.getElementById('app')!);

// Unmount and destroy component tree when needed
unmount();
```

**Parameters:**
- `componentOrFactory: SeidrComponent | SeidrComponentFactory | Function` — Component instance or factory function.
- `container: HTMLElement` — Target DOM container element.

**Returns:** `CleanupFunction` (`() => void`) that unmounts the component, detaches DOM nodes, and triggers all unmount cleanups.

---

## Lifecycle Hooks

Seidr provides individual lifecycle hooks that can be called inside component factories during initialization.

### `onMounted()`

Registers a callback executed when the component (or a specific target DOM node) is mounted to its parent container.

```typescript
import { createComponent, onMounted } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const CanvasComponent = createComponent(() => {
  const container = $div({ className: 'canvas-wrapper' });

  // Hook without element: runs when component is mounted
  onMounted((parent) => {
    console.log('Component mounted inside container:', parent);
  });

  // Hook with target node: runs when that specific node is mounted
  onMounted((parent) => {
    console.log('Div attached to parent:', parent);
  }, container);

  return container;
}, 'CanvasComponent');
```

**Parameters:**
- `callback: (container: HTMLElement) => void` — Callback receiving the container element.
- `el?: Node` — Optional specific DOM node to attach the hook to.

---

### `onAttached()`

Registers a callback executed when the component (or a specific target DOM node) is attached to the active document. If the target is already connected, the callback runs immediately.

```typescript
import { createComponent, onAttached } from '@fimbul-works/seidr';
import { $canvas } from '@fimbul-works/seidr/html';

const Chart = createComponent(() => {
  const canvas = $canvas({ width: 400, height: 200 });

  onAttached(() => {
    // Guaranteed to be connected to document.body
    const ctx = (canvas as HTMLCanvasElement).getContext('2d');
    ctx?.fillRect(10, 10, 50, 50);
  });

  return canvas;
}, 'Chart');
```

**Parameters:**
- `callback: () => void` — Attached callback.
- `el?: Node` — Optional specific DOM node.

---

### `onUnmounted()`

Registers a cleanup function executed when the component (or a specific target DOM node) is removed from the DOM and destroyed.

Use `onUnmounted` to cancel timers, detach event listeners, close WebSockets, or clean up subscriptions:

```typescript
import { createComponent, createValue, onUnmounted } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const Timer = createComponent(() => {
  const seconds = createValue(0);

  const intervalId = setInterval(() => {
    seconds((s) => s + 1);
  }, 1000);

  // Register cleanup
  onUnmounted(() => {
    clearInterval(intervalId);
  });

  // Reactive subscription cleanup
  onUnmounted(
    seconds.watch((sec) => console.log('Tick:', sec))
  );

  return $div({ textContent: seconds.as((s) => `Active for ${s}s`) });
}, 'Timer');
```

**Parameters:**
- `callback: CleanupFunction` — Cleanup callback (`() => void`).
- `el?: Node` — Optional specific DOM node.

---

### `getComponentScope()`

Returns the active `SeidrComponent` instance during the execution of a component factory function.

```typescript
import { createComponent, getComponentScope } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const Inspectable = createComponent(() => {
  const currentScope = getComponentScope();
  console.log('Component ID:', currentScope?.id);
  console.log('Component Name:', currentScope?.name);

  return $div({ textContent: `Component ID: ${currentScope?.id}` });
}, 'Inspectable');
```

**Returns:** `SeidrComponent | null`

---

### `watchMutations()`

Internal DOM mutation listener that monitors `document.documentElement` to trigger node-level `onMounted`, `onAttached`, and `onUnmounted` handlers. Called automatically by `mount()`.

**Returns:** `CleanupFunction` to disconnect observer when all watchers unregister.

---

## `wrapComponent()`

Utility that ensures a pure function or existing component factory is normalized into a `SeidrComponentFactory`.

```typescript
import { wrapComponent } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const SimpleView = () => $div({ textContent: 'Hello' });
const factory = wrapComponent(SimpleView, 'SimpleView');
const componentInstance = factory();
```

---

## Built-In Components

Seidr provides specialized built-in components for reactive UI control flow:

- [`Show()`](Show.md) — Conditionally renders UI based on a boolean `Value`.
- [`List()`](List.md) — Efficiently renders and reconciles dynamic keyed lists from an array `Value`.
- [`Switch()`](Switch.md) — Matches and renders UI branches based on a discriminant `Value`.
- [`Safe()`](Safe.md) — Error boundary component with isolated cleanup and fallback UI.
- [`Suspense()`](Suspense.md) — Asynchronous boundary managing Promise resolution and loading/error states.

---

## `SeidrComponent` Interface

The runtime component instance structure:

```typescript
export interface SeidrComponent {
  readonly [TYPE_PROP]: typeof TYPE_COMPONENT;
  id: number;
  name: string;
  isMounted: boolean;
  nodes: ChildNode[];
  owner: SeidrComponent | null;
  children: Set<SeidrComponent>;
  onMount(fn: OnMountedFunction): void;
  onAttach(fn: OnAttachedFunction): void;
  onUnmount(fn: CleanupFunction): void;
  unmount(): void;
}
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
