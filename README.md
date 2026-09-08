![Seidr](seidr-logo.svg)

**Batteries-included** reactivity in a **kilobyte-sized** package. Seidr brings type-safe components, routing, and SSR to vanilla JavaScript/TypeScript with **build step optional**.

**Seiðr** — Old Norse for *"magic of weaving fate and causality."*

[![npm version](https://badge.fury.io/js/%40fimbul-works%2Fseidr.svg)](https://www.npmjs.com/package/@fimbul-works/seidr)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/microsoft/TypeScript)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/%40fimbul-works%2Fseidr)](https://bundlephobia.com/package/@fimbul-works/seidr)

## Table of Contents

- [Features](#-features)
- [When to Use Seidr](#-when-to-use-seidr)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Conceptual Overview](#-conceptual-overview)
- [Core Concepts](#-core-concepts)
- [API Reference](#-api-reference)
- [Server-Side Rendering](#-server-side-rendering)
- [Animation](#-animation)
- [Performance](#-performance)
- [Browser Support](#-browser-support)

## Features

- 🔋 **Batteries Included:** SSR engine, Global State, and lightweight Router
- 🪄 **Reactive Bindings:** Fine-grained observable to DOM attribute and child bindings
- 🎯 **Type-Safe Props:** TypeScript magic for reactive HTML attributes
- 🔧 **Functional API:** Simple, composable functions for DOM creation and state
- 📦 **Tiny Footprint:**
  - Hello World: **3.9KB** (brotli)
  - TodoMVC: **5.3KB** (brotli)
  - SSR Enabled: **8.9KB** (brotli) - Includes reactivity, DOM bindings, built-in components including the Router system, and SSR capability; no compiler or runtime layering required.
  - Tree-shakable: Import only what you need
- 🏗️ **Isomorphic by construction:** Write a single component that runs identically on server and client. Seidr's build plugin removes environment-inapplicable branches during compilation, so server-only and client-only code paths don't leak into the opposite bundle.

## When to Use Seidr

Seidr is designed for developers who value **control, correctness, and deliberate engineering**. It is not the right tool for every project.

### Ideal Use Cases

**Small to Medium-Sized Applications**
- SPAs where bundle size and startup speed matter
- Interactive widgets, dashboards, and embedded components
- Browser extensions with strict size constraints
- Progressive enhancement of server-rendered pages

**Projects That Benefit From**
- Direct DOM manipulation without virtual DOM overhead
- Explicit lifecycle management (no hidden re-renders)
- Type-safe reactive bindings
- Build step optional (runs directly in modern browsers)
- Full TypeScript support with advanced type inference

**Teams That Prefer**
- Functional programming patterns over class hierarchies
- Explicit over implicit (no magic compilers, just functions)
- Understanding how their tools work internally
- Fine-grained control over performance characteristics

### Consider Alternatives When

**You Need**
- A large ecosystem of pre-built UI widget libraries (use React, Vue)
- Heavy meta-frameworks with full server ecosystems (use Next.js, SvelteKit, Nuxt)
- Learning resources for junior developers (use mainstream frameworks)
- Browser devtools extension ecosystems

**Your Team**
- Prefers convention over configuration
- Doesn't want to think about resource cleanup and memory management
- Relies heavily on JSX/compiler transformations

### The Philosophy

Seidr embraces **fact-based tradeoffs**:

- **No virtual DOM** → Faster, surgical updates and lower memory overhead
- **Callable getter-setter Values** → Clean functional state API without getter/setter boilerplate
- **Explicit over Implicit** → Predictable data flow with zero hidden re-renders

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

## Conceptual Overview

Before diving into the details, it helps to understand Seidr's mental model. This section walks through the complete flow from state to reactivity to cleanup.

### The Three Pillars

**1. Reactive State (`createValue`)**
- Functional getter-setter: `val()` to read, `val(newVal)` or `val(prev => next)` to write
- Holds a value and notifies listeners on change
- Automatic derivation with `.as()` and `mergeValues()`

**2. Direct Bindings**
- Connect reactive state to DOM properties and attributes
- Automatically update when the observable changes
- No virtual DOM diffing or full-tree reconciliation

**3. Lifecycle & Cleanup**
- Dedicated lifecycle hooks (`onMounted`, `onAttached`, `onUnmounted`)
- Components track their bindings and clean up automatically
- Guaranteed memory safety when components are unmounted

### A Complete Flow: From State to UI to Cleanup

Let's build a simple search filter step by step:

#### Step 1: Create State
```typescript
import { createValue } from '@fimbul-works/seidr';

// Create observables with initial values
const searchQuery = createValue('');
const items = createValue([
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' }
]);
```

#### Step 2: Derive Filtered Results
```typescript
import { mergeValues } from '@fimbul-works/seidr';

// Create derived observable that filters based on search
const filteredItems = mergeValues(() => {
  const query = searchQuery().toLowerCase();
  return query
    ? items().filter((item) => item.name.toLowerCase().includes(query))
    : items();
});
```

**What happens:** `filteredItems` automatically recomputes whenever `items` or `searchQuery` changes.

#### Step 3: Bind to DOM
```typescript
import { createValue } from '@fimbul-works/seidr';
import { $input } from '@fimbul-works/seidr/html';

const searchQuery = createValue('');

// Create input bound to search query
const searchInput = $input({
  type: 'text',
  placeholder: 'Search...',
  value: searchQuery,
  oninput: (e: Event) => searchQuery((e.target as HTMLInputElement).value)
});
```

#### Step 4: Create Component with List Rendering
```typescript
import { createValue, List, mergeValues } from '@fimbul-works/seidr';
import { $div, $input, $li, $ul } from '@fimbul-works/seidr/html';

const SearchApp = () => {
  const searchQuery = createValue('');
  const items = createValue([
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' }
  ]);

  const filteredItems = mergeValues(() => {
    const query = searchQuery().toLowerCase();
    return query
      ? items().filter((item) => item.name.toLowerCase().includes(query))
      : items();
  });

  const searchInput = $input({
    type: 'text',
    placeholder: 'Search...',
    value: searchQuery,
    oninput: (e: Event) => searchQuery((e.target as HTMLInputElement).value)
  });

  return $div({}, [
    searchInput,
    $ul({}, [
      // List component with keyed diffing
      List(
        filteredItems,
        (item) => item.id,
        (itemValue) => $li({ textContent: itemValue.as((i) => i.name) })
      )
    ])
  ]);
};
```

#### Step 5: Mount and Automatic Cleanup
```typescript
import { mount } from '@fimbul-works/seidr';

const unmount = mount(SearchApp, document.body);

// SearchApp is now fully interactive.
// When done, cleanup everything cleanly:
unmount();
```

---

## Core Concepts

### Reactive State

State is stored in [`Value`](docs/Value.md) observables created via `createValue()`.

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

---

## 📚 API Reference

For complete API documentation with all methods, parameters, and examples, see **[API.md](docs/API.md)**.

- [Reactive State (`Value.md`)](docs/Value.md)
- [DOM Elements & Queries (`DOM.md`)](docs/DOM.md)
- [Components & Lifecycle (`components.md`)](docs/components.md)
- [Control Flow (`Show.md`, `List.md`, `Switch.md`, `Safe.md`, `Suspense.md`)](docs/components.md#built-in-components)
- [Type Guards (`TypeGuards.md`)](docs/TypeGuards.md)
- [Server-Side Rendering (`SSR.md`)](docs/SSR.md)
- [Utilities (`utils.md`)](docs/utils.md)

---

## 🌐 Server-Side Rendering

Seidr provides SSR support with automatic state capture and deterministic client-side hydration.

For more information, see **[SSR.md](docs/SSR.md)**.

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
- **Seidr TodoMVC**: ~5.8KB (Seidr client-side runtime)

---

## 🌐 Browser Support

Seidr works in all modern browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 📄 License

MIT License — See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
