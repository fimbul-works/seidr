# Seidr

**Seiðr** - the Old Norse magic of influence and causality. A lightweight reactive frontend library that weaves together DOM manipulation, reactive bindings, and component lifecycles into elegant, maintainable applications.

Build reactive user interfaces with minimal overhead and maximum control. No virtual DOM, no build step required, just pure functions and reactive primitives.

[![npm version](https://badge.fury.io/js/%40fimbul-works%2Fseidr.svg)](https://www.npmjs.com/package/@fimbul-works/seidr)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/microsoft/TypeScript)

## Features

- 🪄 **Reactive Bindings** - Connect observables to DOM elements with automatic updates
- 🏗️ **Component System** - Lifecycle management with automatic cleanup
- 🎯 **Type-Safe** - Full TypeScript support with excellent type inference
- 📦 **Tiny Footprint** - Minimal bundle size for maximum performance
- 🔧 **Functional API** - Simple, composable functions for DOM creation

## Installation

```bash
npm install @fimbul-works/seidr
# or
yarn add @fimbul-works/seidr
# or
pnpm install @fimbul-works/seidr
```

## Quick Start

```typescript
import { ObservableValue } from '@fimbul-works/observable';
import { component, bind, DivEl, ButtonEl, SpanEl, mount } from '@fimbul-works/seidr';

function Counter() {
  return component((scope) => {
    const count = new ObservableValue(0);

    const container = DivEl({ className: 'counter' }, [
      SpanEl({ textContent: 'Count: 0' }),
      ButtonEl({ textContent: 'Increment' }),
      ButtonEl({ textContent: 'Decrement' })
    ]);

    const [countDisplay, incrementBtn, decrementBtn] = container.children;

    // Reactive binding - automatically updates when count changes
    scope.track(
      bind(count, countDisplay, (value, el) => {
        el.textContent = `Count: ${value}`;
      })
    );

    // Event handlers
    incrementBtn.addEventListener('click', () => count.set(count.get() + 1));
    decrementBtn.addEventListener('click', () => count.set(count.get() - 1));

    return container;
  });
}

// Mount component
const counter = Counter();
mount(counter, document.body);
```

## Core Concepts

### DOM Creation

Seidr provides type-safe element creators for all HTML elements:

```typescript
import { DivEl, InputEl, ButtonEl } from '@fimbul-works/seidr';

const form = DivEl({ className: 'form' }, [
  InputEl({ type: 'text', placeholder: 'Enter name' }),
  ButtonEl({ textContent: 'Submit', onclick: () => console.log('clicked') })
]);
```

### Reactive Bindings

Connect observables to DOM elements with the `bind` function:

```typescript
import { ObservableValue } from '@fimbul-works/observable';
import { bind, InputEl } from '@fimbul-works/seidr';

const text = new ObservableValue('Hello');
const input = InputEl();

// Update input value when observable changes
const cleanup = bind(text, input, (value, el) => {
  el.value = value;
});

// Later: cleanup() to remove binding
```

### Components with Lifecycle

Components automatically manage cleanup of bindings, child components, and resources:

```typescript
import { component, mount } from '@fimbul-works/seidr';

function UserProfile() {
  return component((scope) => {
    const profile = new ObservableValue({ name: 'Alice', age: 30 });
    const element = DivEl();

    // Track binding for automatic cleanup
    scope.track(
      bind(profile, element, (value, el) => {
        el.textContent = `${value.name}, ${value.age}`;
      })
    );

    // Track child component
    scope.child(AvatarComponent());

    return element;
  });
}

const profile = UserProfile();
mount(profile, container);

// When done:
profile.destroy(); // Cleans up all bindings and children
```

### Conditional Rendering

Show/hide components based on observable conditions:

```typescript
import { mountConditional, ObservableValue } from '@fimbul-works/seidr';

const showDetails = new ObservableValue(false);

const conditional = mountConditional(
  showDetails,
  () => DetailsPanel(), // Only created when needed
  container
);

showDetails.set(true); // Component automatically mounts
showDetails.set(false); // Component automatically unmounts and cleans up
```

### List Rendering

Efficiently render lists from observable arrays:

```typescript
import { mountList, ObservableValue } from '@fimbul-works/seidr';

const items = new ObservableValue([
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' }
]);

const list = mountList(
  items,
  (item) => item.id, // Key function
  (item) => ListItem(item), // Component factory
  container
);

// Updates efficiently handle additions, removals, and reordering
items.set([...items.get(), { id: 3, name: 'Cherry' }]);
```

## Utilities

Seidr includes helpful utilities for common tasks:

```typescript
import { cn, debounce, toggleClass } from '@fimbul-works/seidr';

// Classname builder
const classes = cn('btn', isActive && 'active', ['btn-primary', 'btn-lg']);

// Debounce function calls
const handleSearch = debounce((query) => search(query), 300);

// Toggle classes reactively
toggleClass(isDarkMode, document.body, 'dark-theme');
```

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
