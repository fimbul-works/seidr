# ![@fimbul-works/seidr](./public/seidr-logo.svg)

**Batteries-included** reactivity in a **kilobyte-sized** package. Seidr brings type-safe components, routing, and SSR to vanilla JavaScript/TypeScript with **build step optional**.

**Seiðr** — Old Norse for *"magic of weaving fate and causality."*

[![npm version](https://badge.fury.io/js/%40fimbul-works%2Fseidr.svg)](https://www.npmjs.com/package/@fimbul-works/seidr)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/microsoft/TypeScript)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/%40fimbul-works%2Fseidr)](https://bundlephobia.com/package/@fimbul-works/seidr)

## Table of Contents

- [Features](#features)
- [When to Use Seidr](#when-to-use-seidr)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Conceptual Overview](#conceptual-overview)
- [Core Concepts](#core-concepts)
  - [Reactive State](#reactive-state)
  - [Components](#components)
  - [Control Flow](#control-flow)
  - [Routing](#routing)
- [Server-Side Rendering](#server-side-rendering)
- [Animation](#animation)
- [Performance](#performance)
- [Browser Support](#browser-support)
- [API Reference](#api-reference)
- [License](#license)

## Features

- 🪄 **Reactive Bindings:** Fine-grained observable for DOM attribute and child bindings.
- 🎯 **Type-Safe Props:** TypeScript magic for reactive HTML attributes.
- 🔧 **Functional API:** Simple, composable functions for DOM creation and state.
- 📦 **Tiny Footprint:** Full client-side bundle with SSR suppor is only **7.8KB** (brotli).
- 🏗️ **Isomorphic by construction:** Write a single component that runs identically on server and client. Seidr's build plugin removes environment-inapplicable branches during compilation, so server-only and client-only code paths don't leak into the opposite bundle.

## Installation

```bash
npm install @fimbul-works/seidr
```

Or using your preferred package manager:

```bash
pnpm install @fimbul-works/seidr
# or
yarn add @fimbul-works/seidr
```

## Quick Start

```typescript
import { createValue, mount } from '@fimbul-works/seidr';
import { $button, $div, $span } from '@fimbul-works/seidr/html';

const Counter = () => {
  const count = createValue(0);
  const disabled = count.as((value) => value >= 10);

  return $div({
    className: 'counter',
    style: 'padding: 20px; border: 1px solid #ccc;'
  }, [
    $span({ textContent: count.as((c) => `Count: ${c}`) }), // Automatic reactive binding
    $button({
      textContent: 'Increment',
      disabled, // Reactive boolean attribute binding
      onclick: () => count((c) => c + 1)
    }),
    $button({
      textContent: 'Reset',
      onclick: () => count(0)
    })
  ]);
};

mount(Counter, document.body);
```

---

## Core Concepts

### Reactive State

State is stored in [`Value`](docs/Value.md) observable getter-setter functions created via `createValue()`.

```typescript
import { createValue } from '@fimbul-works/seidr';
import { $input } from '@fimbul-works/seidr/html';

const disabled = createValue(false);
const input = $input({ disabled });

disabled(true); // Input instantly becomes disabled
```

**Learn more:** [`createValue()`](docs/Value.md#createvalue)

#### Derived Values

Transform observables with `.as()` and `mergeValues()` for derived values that update automatically.

```typescript
const count = createValue(0);
const doubled = count.as((n) => n * 2);
const message = count.as((n) => (n > 5 ? 'Many!' : `Count: ${n}`));
```

**Learn more:** [`instance.as()`](docs/Value.md#as) | [`mergeValues()`](docs/Value.md#mergevalues)

#### Watching & Side Effects

Subscribe to changes with `.watch()` or `.bind()`. When called within a component, subscriptions automatically register with the current component scope and clean up on unmount—manual cleanup via `onUnmounted()` is not needed.

Outside of a component scope (e.g. in tests or global state), subscriptions live indefinitely until explicitly cancelled via the returned cleanup function.

Handlers can also return an optional cleanup function that executes automatically before the next change or when unsubscribed:

```typescript
const isTracking = createValue(false);

// Inside a component, this subscription cleans up automatically when unmounted:
isTracking.bind((active) => {
  if (!active) return;

  const onMouseMove = (e: MouseEvent) => console.log(e.clientX, e.clientY);
  window.addEventListener('mousemove', onMouseMove);

  // Return a teardown function (runs on next change or when unbinding/unmounting)
  return () => window.removeEventListener('mousemove', onMouseMove);
});
```

**Learn more:** [`.watch()`](docs/Value.md#watch) | [`.bind()`](docs/Value.md#bind)

### Components

Seidr components are functions that return UI elements. They have full access to Seidr's reactivity and lifecycle hooks.

```typescript
import { createComponent, createValue, onUnmounted } from '@fimbul-works/seidr';
import { $button, $div, $span } from '@fimbul-works/seidr/html';

interface ProfileProps {
  name: string;
  initialAge?: number;
}

const UserProfile = createComponent<ProfileProps>(({ name, initialAge = 30 }) => {
  const age = createValue(initialAge);

  // Track custom cleanup logic
  onUnmounted(() => console.log('Profile destroyed'));

  return $div({ className: 'user-profile' }, [
    $span({ textContent: `${name}, ` }),
    $span({ textContent: age.as((a) => `Age: ${a}`) }),
    $button({
      textContent: 'Birthday',
      onclick: () => age((prev) => prev + 1)
    })
  ]);
}, 'UserProfile');
```

**Learn more:** [`createComponent()`](docs/components.md#createcomponent) | [`Lifecycle Hooks`](docs/components.md#lifecycle-hooks)

### Control Flow

Seidr provides built-in control flow components that avoid full branch re-renders:

- **`Show`**: Conditionally renders children or fallback when a boolean `Value` changes.
- **`List`**: Reconciles dynamic collections using keyed diffing.
- **`Switch`**: Matches a reactive discriminant value against discrete cases.
- **`Safe`**: Error boundary component that catches render/initialization errors and displays fallback UI.
- **`Suspense`** & **`Lazy`**: Asynchronous boundaries and code-split module loading.

```typescript
import { createValue, Show } from '@fimbul-works/seidr';
import { $button, $div, $p } from '@fimbul-works/seidr/html';

const ToggleView = () => {
  const visible = createValue(false);

  return $div({}, [
    $button({
      textContent: 'Toggle Details',
      onclick: () => visible((prev) => !prev)
    }),
    Show(
      visible,
      () => $p({ textContent: 'Secret project details revealed!' }),
      () => $p({ textContent: 'Click above to reveal details.' })
    )
  ]);
};
```

**Learn more:** [`Show`](docs/Show.md) | [`List`](docs/List.md) | [`Switch`](docs/Switch.md) | [`Safe`](docs/Safe.md) | [`Suspense`](docs/Suspense.md) | [`Lazy`](docs/Lazy.md)

### Routing (`@fimbul-works/seidr-router`)

Routing is provided via the official addon [`@fimbul-works/seidr-router`](docs/Router.md). It supports nested routes, dynamic parameters, history navigation, declarative links, and SSR hydration out of the box:

```typescript
import { createComponent } from '@fimbul-works/seidr';
import { $div, $h1, $nav, $p } from '@fimbul-works/seidr/html';
import { Link, type Route, Router } from '@fimbul-works/seidr-router';

const App = createComponent(() => {
  return $div({}, [
    $nav({}, [
      Link({ to: '/', textContent: 'Home' }),
      Link({ to: '/about', textContent: 'About' })
    ]),
    Router([
      { path: '/', component: () => $h1({ textContent: 'Welcome Home' }), exact: true },
      { path: '/about', component: () => $p({ textContent: 'About Seidr' }) },
      { path: '*', component: () => $p({ textContent: '404 - Page Not Found' }) }
    ])
  ]);
});
```

**Learn more:** [`Router API`](docs/Router.md)

---

## 🌐 Server-Side Rendering

Seidr provides first-class SSR support with automatic state capture and deterministic client-side hydration. Components execute identically on both server and client.

### Server Render

```typescript
import { renderToString } from '@fimbul-works/seidr/ssr';
import { App } from './app';

const { html, state } = await renderToString(App);

const responseHtml = `
<!DOCTYPE html>
<html>
  <body>
    <div id="app">${html}</div>
    <script>window.__HYDRATION_DATA__ = ${state};</script>
    <script type="module" src="/client.js"></script>
  </body>
</html>`;
```

### Client Hydration

```typescript
import { hydrate } from '@fimbul-works/seidr/ssr';
import { App } from './app';

hydrate(App, document.getElementById('app')!, window.__HYDRATION_DATA__);
```

**Learn more:** [`SSR Guide`](docs/SSR.md)

---

## ⚡ Performance

### Surgical Updates

Only changed DOM attributes and nodes are updated without virtual DOM diffing overhead.

```typescript
const count = createValue(0);
const display = $span({ textContent: count });

// Only the span's textContent is updated, nothing else
count((c) => c + 1);
```

### No Reconciliation Overhead

Unlike React/Vue, Seidr doesn't diff entire virtual component trees. Updates go straight to the real DOM.

### Minimal Bundle Impact (gzipped)
- **React TodoMVC**: ~60KB (React + ReactDOM)
- **Vue3 TodoMVC**: ~25KB (Vue runtime)
- **SolidJS TodoMVC**: ~6KB (SolidJS runtime)
- **Seidr TodoMVC**: ~5.3KB (Seidr runtime)

---

## 📚 API Reference

For complete API documentation with all methods, parameters, and examples, see [Seidr API documentation](docs/API.md).

---

## 📄 License

MIT License — See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
