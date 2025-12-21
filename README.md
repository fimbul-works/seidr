# Seidr

**Seiðr** - the Old Norse magic of influence and causality. A lightweight reactive frontend library that weaves together DOM manipulation, reactive bindings, and component lifecycles into elegant, maintainable applications.

Build reactive user interfaces with minimal overhead and maximum control. No virtual DOM, no build step required, just pure functions and reactive primitives.

[![npm version](https://badge.fury.io/js/%40fimbul-works%2Fseidr.svg)](https://www.npmjs.com/package/@fimbul-works/seidr)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/microsoft/TypeScript)

## ✨ Features

- 🪄 **Reactive Bindings** - Automatic `Seidr` to DOM attribute binding
- 🎯 **Type-Safe Props** - TypeScript magic for reactive HTML attributes
- 🏗️ **Component System** - Lifecycle management with automatic cleanup
- 📦 **Tiny Footprint** - 1.5KB core, 2.3KB full (minified + gzipped)
- 🔧 **Functional API** - Simple, composable functions for DOM creation
- ⚡ **Zero Dependencies** - Pure TypeScript, build step optional
- 🌲 **Tree-Shakable** - Import only what you need
- 🔥 **SSR Ready** - Server-side rendering support (experimental)

## 📦 Bundle Size

| Module | Minified | Gzipped |
|--------|----------|---------|
| **Core** (Reactive + DOM) | 3.8KB | **1.5KB** |
| **Full** (All features) | 8.7KB | **2.3KB** |

*Excellent tree-shaking - only pay for what you use!*

## Installation

```bash
npm install @fimbul-works/seidr
# or
yarn add @fimbul-works/seidr
# or
pnpm install @fimbul-works/seidr
```

## 🚀 Quick Start

```typescript
import { component, mount, Seidr, $div, $button, $span } from '@fimbul-works/seidr';

function Counter() {
  return component((scope) => {
    const count = new Seidr(0);
    const isDisabled = count.derive(value => value >= 10);

    return $div({
      className: 'counter',
      style: 'padding: 20px; border: 1px solid #ccc;'
    }, [
      $span({ textContent: count }), // Automatic reactive binding!
      $button({
        textContent: 'Increment',
        disabled: isDisabled, // Reactive boolean binding!
        onclick: () => count.value++
      }),
      $button({
        textContent: 'Reset',
        onclick: () => count.value = 0
      })
    ]);
  });
}

// Mount component
mount(Counter(), document.body);
```

## 🎯 Core Concepts

### Reactive Props

State is stored in `Seidr<T>` which can be used directly as props - no manual binding required!

```typescript
import { Seidr, $input, $button, $div } from '@fimbul-works/seidr';

// Create reactive observables
const disabled = new Seidr(false);
const className = new Seidr('btn-primary');
const maxLength = new Seidr(50);
const placeholder = new Seidr('Enter text...');

// Automatic reactive bindings - TypeScript handles everything!
const input = $input({
  type: 'text',
  className, // Seidr<string> → className property
  disabled, // Seidr<boolean> → disabled property
  maxLength, // Seidr<number> → maxLength property
  placeholder // Seidr<string> → placeholder property
});

// Any change to the observable automatically updates the DOM
disabled.value = true; // input.disabled becomes true
className.value = 'btn-disabled'; // input.className becomes 'btn-disabled'
maxLength.value = 100; // input.maxLength becomes 100
```

### Manual Reactive Bindings

For complex transformations, use the `bind` method on Seidr:

```typescript
import { Seidr, $div, $span } from '@fimbul-works/seidr';

const count = new Seidr(0);
const display = $span();

// Custom transformation function
const cleanup = count.bind(display, (value, el) => {
  el.textContent = value > 5 ? 'Many clicks!' : `Count: ${value}`;
});

count.value = 3; // display shows "Count: 3"
count.value = 7; // display shows "Many clicks!"

// Later: cleanup() to remove binding
```

### Components with Lifecycle

Components automatically manage cleanup of bindings, child components, and resources:

```typescript
import { component, mount, Seidr, $div, $span, $button } from '@fimbul-works/seidr';

function UserProfile() {
  return component((scope) => {
    const name = new Seidr('Alice');
    const age = new Seidr(30);
    const isEditing = new Seidr(false);

    const ageSpan = $span({ textContent: `Age: ${age.value}` });

    // Reactive age display with manual binding
    scope.track(age.bind(ageSpan, (value, el) => {
      el.textContent = `Age: ${value}`;
    }));

    return $div({ className: 'user-profile' }, [
      // Reactive name display
      $span({ textContent: name }),
      ageSpan,

      // Edit button with reactive disabled state
      $button({
        textContent: 'Edit',
        disabled: isEditing,
        onclick: () => isEditing.value = !isEditing.value
      })
    ]);
  });
}

const profile = UserProfile();
mount(profile, document.body);

// When done:
profile.destroy(); // Cleans up all reactive bindings automatically
```

### Conditional Rendering

Show/hide components based on observable conditions:

```typescript
import { mountConditional, Seidr, $div, $button, component } from '@fimbul-works/seidr';

const isVisible = new Seidr(false);

function DetailsPanel() {
  return component((scope) => {
    return $div({ className: 'details-panel' }, [
      $div({ textContent: 'User Details' }),
      $div({ textContent: 'Some additional information...' }),
      $button({
        textContent: 'Close',
        onclick: () => isVisible.value = false
      })
    ]);
  });
}

mountConditional(
  isVisible,
  () => DetailsPanel(), // Only created when needed
  document.body
);

isVisible.value = true; // Component automatically mounts and becomes visible
isVisible.value = false; // Component automatically unmounts and cleans up
```

### List Rendering

Efficiently render lists from observable arrays with key-based diffing:

```typescript
import { mountList, Seidr, $div, $span, $button, component } from '@fimbul-works/seidr';

const todos = new Seidr([
  { id: 1, text: 'Learn Seidr', completed: false },
  { id: 2, text: 'Build amazing apps', completed: false }
]);

function TodoItem({ todo }: { todo: any }) {
  return component((scope) => {
    const isCompleted = new Seidr(todo.completed);

    return $div({
      className: 'todo-item',
      style: 'display: flex; align-items: center; gap: 10px; margin: 5px 0;'
    }, [
      // Reactive checkbox
      $button({
        textContent: isCompleted,
        onclick: () => {
          isCompleted.value = !isCompleted.value;
          todo.completed = isCompleted.value;
        }
      }),

      // Reactive text styling
      $span({
        textContent: todo.text,
        style: isCompleted.derive(completed =>
          completed ? 'text-decoration: line-through;' : ''
        )
      })
    ]);
  });
}

mountList(
  todos,
  (item) => item.id, // Key function for efficient updates
  (item) => TodoItem({ todo }), // Component factory
  document.body
);

// Updates efficiently handle additions, removals, and reordering
todos.value = [...todos.value, { id: 3, text: 'Master reactive programming', completed: false }];
todos.value = todos.value.filter(todo => todo.id !== 1); // Remove item
```

## 🚀 Advanced Patterns

### Derived Values

Create derived observables that update automatically when the original value changes:

```typescript
import { Seidr } from '@fimbul-works/seidr';

const isActive = new Seidr(false);
const activeClass = isActive.derive((v) => v ? 'active' : '');

isActive.value = true;
// activeClass.value is now 'active'
```

### Computed Values

Create aggregating observables that automatically update when dependencies change:

```typescript
import { Seidr, $div, $span } from '@fimbul-works/seidr';

const firstName = new Seidr('John');
const lastName = new Seidr('Doe');

// Computed full name that updates when either first or last name changes
const fullName = Seidr.computed(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);

const profile = $div();

// Create elements individually to avoid array appendChild issues
profile.appendChild($span({ textContent: 'First Name:' }));
profile.appendChild($span({ textContent: firstName }));
profile.appendChild($span({ textContent: 'Last Name:' }));
profile.appendChild($span({ textContent: lastName }));
profile.appendChild($span({ textContent: 'Full Name:' }));
profile.appendChild($span({ textContent: fullName })); // Automatically updates!

firstName.value = 'Jane'; // fullName becomes "Jane Doe"
```

### Component Switching

Switch between different components based on observable state:

```typescript
import { mountSwitch, Seidr, $div, $button, component } from '@fimbul-works/seidr';

const viewMode = new Seidr<'list' | 'grid'>('list');

const ListView = () => component(() => $div({ textContent: 'List View' }));
const GridView = () => component(() => $div({ textContent: 'Grid View' }));

mountSwitch(
  viewMode,
  {
    list: ListView,
    grid: GridView
  },
  document.body
);

viewMode.value = 'grid'; // Automatically switches to GridView
```

### Two-Way Binding

Bind form inputs to observables with automatic synchronization:

```typescript
import { Seidr, $input, $span, $div } from '@fimbul-works/seidr';

const searchText = new Seidr('');

const input = $input({
  type: 'text',
  placeholder: 'Search...',
  value: searchText, // Reactive initial value
  oninput: (e) => {
    const target = e.target as HTMLInputElement;
    searchText.value = target.value;
  }
});

const span = $span({ textContent: searchText });
const searchComponent = $div();

searchComponent.appendChild(input);
searchComponent.appendChild(span);

// Manual binding for bidirectional sync (if needed)
const cleanup = searchText.bind(input, (value, el) => {
  if (el !== document.activeElement) { // Don't update while user is typing
    el.value = value;
  }
});
```

### Reactive Class Names

Use the `cn` utility for dynamic class management:

```typescript
import { Seidr, cn, toggleClass, $div } from '@fimbul-works/seidr';

const isActive = new Seidr(false);
const size = new Seidr('large');
const error = new Seidr(false);

// Using cn utility with reactive values
const className = cn(
  'base-component',
  [isActive && 'active'],
  { 'size-large': size.derive(s => s === 'large'), 'has-error': error }
);

const element = $div({ className });

// Or toggle classes reactively
toggleClass(element, 'highlight', isActive);
```

## 🧪 Testing

Seidr comes with comprehensive test coverage (124 tests across 10 test files) built with Vitest:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

All tests are passing, ensuring production-ready reliability and correctness.

## 🔧 Available Element Creators

Seidr provides 69+ element creators with the `$` prefix:

```typescript
// Common examples
$div, $span, $p, $h1, $h2, $h3
$button, $input, $textarea, $select, $option
$img, $a, $ul, $ol, $li
$table, $thead, $tbody, $tr, $td, $th
$form, $label, $fieldset, $legend
// And many more...
```

## 📚 API Reference

- **`Seidr<T>`** - Core reactive primitive
- **`component()`** - Create components with lifecycle management
- **`mount()`** - Mount components to DOM containers
- **`mountConditional()`** - Conditional component rendering
- **`mountList()`** - Efficient list rendering with diffing
- **`mountSwitch()`** - Component switching based on state
- **`observable.bind()`** - Manual reactive bindings
- **`$elementName`** - Element creators ($div, $button, etc.)
- **`cn()`** - Class name utility with reactive support
- **`toggleClass()`** - Reactive class toggling
- **`$, $$`** - DOM query utilities

## 🌟 What Makes Seidr Special?

- **Type-First**: Advanced TypeScript patterns provide compile-time safety
- **Zero Runtime Magic**: No build step required, transparent reactive bindings
- **Memory Safe**: Automatic cleanup prevents memory leaks
- **Performance**: Direct DOM manipulation, no virtual DOM overhead
- **Tree-Shakable**: Only pay for what you use

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
