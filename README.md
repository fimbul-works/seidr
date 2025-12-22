# Seidr

Build reactive user interfaces with **zero build step** and **kilobyte scale footprint**. Seidr brings reactive bindings, lifecycle management, and type-safe components to vanilla JavaScript/TypeScript — no compilation required.

**Seiðr** - Old Norse for "magic of influence and causality"

[![npm version](https://badge.fury.io/js/%40fimbul-works%2Fseidr.svg)](https://www.npmjs.com/package/@fimbul-works/seidr)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/microsoft/TypeScript)

## Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Core Concepts](#-core-concepts)
  - [Reactive Props](#reactive-props)
  - [Manual Reactive Bindings](#manual-reactive-bindings)
  - [Components with Lifecycle](#components-with-lifecycle)
  - [Conditional Rendering](#conditional-rendering)
  - [List Rendering](#list-rendering)
- [Advanced Patterns](#-advanced-patterns)
- [API Reference](#-api-reference)
- [Performance](#-performance)
- [Browser Support](#-browser-support)

## ✨ Features

- 🪄 **Reactive Bindings** - Observable to DOM attribute binding
- 🎯 **Type-Safe Props** - TypeScript magic for reactive HTML attributes
- 🏗️ **Component System** - Lifecycle management with automatic cleanup
- 📦 **Tiny Footprint** - 1.4KB core, 2.3KB full (minified + gzipped)
- 🔧 **Functional API** - Simple, composable functions for DOM creation
- ⚡ **Zero Dependencies** - Pure TypeScript, build step optional
- 🌲 **Tree-Shakable** - Import only what you need

## 📦 Installation

```bash
npm install @fimbul-works/seidr
```

Or using your preferred package manager:

```bash
yarn add @fimbul-works/seidr
pnpm install @fimbul-works/seidr
```

## 🚀 Quick Start

```typescript
import { component, mount, Seidr, $div, $button, $span } from '@fimbul-works/seidr';

function Counter() {
  return component((scope) => {
    const count = new Seidr(0);
    const disabled = count.as(value => value >= 10);

    return $div({
      className: 'counter',
      style: 'padding: 20px; border: 1px solid #ccc;'
    }, [
      $span({ textContent: count }), // Automatic reactive binding!
      $button({
        textContent: 'Increment',
        disabled, // Reactive boolean binding!
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

State is stored in `Seidr<T>` observables. Pass them directly to element props and Seidr handles the rest!

```typescript
import { Seidr, $input } from '@fimbul-works/seidr';

const disabled = new Seidr(false);
const input = $input({ disabled }); // That's it!

disabled.value = true; // Input instantly becomes disabled
```

If a prop value is a `Seidr`, it stays live. If it is a plain value, it is assigned once.

**Full example with multiple reactive props:**

```typescript
import { Seidr, $input, $button, $div } from '@fimbul-works/seidr';

const disabled = new Seidr(false);
const className = disabled.as((isDisabled) => isDisabled ? 'input-disabled' : 'input-primary');
const placeholder = new Seidr('Enter text...');

const input = $input({
  type: 'text',
  disabled,       // Seidr<boolean> → disabled property
  className,      // Seidr<string> → className property
  placeholder     // Seidr<string> → placeholder property
});

// Any change automatically updates the DOM
disabled.value = true;
// className.value = 'input-disabled';
placeholder.value = 'Disabled...';
```

### Manual Reactive Bindings

For complex transformations, use the `bind` method:

```typescript
import { Seidr, $div, $span } from '@fimbul-works/seidr';

const count = new Seidr(0);
const display = $span();

// Custom transformation function
const cleanup = count.bind(display, (value, el) => {
  el.textContent = value > 5 ? 'Many clicks!' : `Count: ${value}`;
  el.style.color = value > 5 ? 'red' : 'black';
});

count.value = 3; // display shows "Count: 3" in black
count.value = 7; // display shows "Many clicks!" in red

// When done:
cleanup();
```

**When to use manual binding:**
- Complex DOM updates (multiple properties, style changes)
- Conditional transformations (different outputs for different values)
- Performance optimization (batch multiple updates)
- Non-standard property updates

### Components with Lifecycle

Components automatically manage cleanup of bindings, child components, and resources:

```typescript
import { component, mount, Seidr, $div, $span, $button } from '@fimbul-works/seidr';

function UserProfile() {
  return component((scope) => {
    const name = new Seidr('Alice');
    const age = new Seidr(30);

    // Manual binding for complex age display with formatting
    const ageSpan = $span();
    scope.track(age.bind(ageSpan, (value, el) => {
      el.textContent = `Age: ${value} years`;
      el.style.fontWeight = value >= 18 ? 'bold' : 'normal';
    }));

    return $div({ className: 'user-profile' }, [
      // Simple reactive binding for name
      $span({ textContent: name }),
      ageSpan,
      $button({
        textContent: 'Birthday',
        onclick: () => age.value++
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

// Toggle button
document.body.appendChild(
  $button({
    textContent: 'Toggle Details',
    onclick: () => isVisible.value = !isVisible.value
  })
);

// Conditionally mounted panel
mountConditional(
  isVisible,
  () => DetailsPanel(), // Only created when needed
  document.body
);

// Component automatically mounts/unmounts with full cleanup
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
      $button({
        textContent: isCompleted.as(c => c ? '✓' : '○'),
        onclick: () => {
          isCompleted.value = !isCompleted.value;
          todo.completed = isCompleted.value;
        }
      }),
      $span({
        textContent: todo.text,
        style: isCompleted.as(completed =>
          completed ? 'text-decoration: line-through; opacity: 0.6;' : ''
        )
      })
    ]);
  });
}

mountList(
  todos,
  (item) => item.id,                  // Key function for efficient updates
  (item) => TodoItem({ todo: item }), // Component factory
  document.body
);

// Updates efficiently handle additions, removals, and reordering
todos.value = [...todos.value, { id: 3, text: 'Master reactive programming', completed: false }];
todos.value = todos.value.filter(todo => todo.id !== 1); // Remove item
```

### Component Switching

Switch between different components based on observable state with automatic cleanup:

```typescript
import { mountSwitch, Seidr, $div, $button, component } from '@fimbul-works/seidr';

type ViewMode = 'list' | 'grid' | 'table';
const viewMode = new Seidr<ViewMode>('list');

const ListView = () => component(() =>
  $div({ textContent: '📋 List View', className: 'list-view' })
);

const GridView = () => component(() =>
  $div({ textContent: '📊 Grid View', className: 'grid-view' })
);

const TableView = () => component(() =>
  $div({ textContent: '📈 Table View', className: 'table-view' })
);

// Control buttons
const controls = $div({ className: 'view-controls' }, [
  $button({
    textContent: 'List',
    onclick: () => viewMode.value = 'list'
  }),
  $button({
    textContent: 'Grid',
    onclick: () => viewMode.value = 'grid'
  }),
  $button({
    textContent: 'Table',
    onclick: () => viewMode.value = 'table'
  })
]);

document.body.appendChild(controls);

// Automatically switches components with full cleanup
mountSwitch(
  viewMode,
  {
    list: ListView,
    grid: GridView,
    table: TableView
  },
  document.body
);
```

**Key Features:**
- ✅ **Automatic Cleanup**: Previous component is destroyed when switching
- ✅ **Type Safety**: TypeScript ensures all component factories return compatible types
- ✅ **Reactive**: Changes to `viewMode` automatically update the displayed component
- ✅ **Error Handling**: Graceful handling of missing component factories

**Perfect for:**
- Navigation systems with different view modes
- Tab-based interfaces
- State-dependent component selection
- Multi-step wizards with different screens

## 🚀 Advanced Patterns

### 🟢 Basic: Derived Values

Create derived observables that update automatically:

```typescript
import { Seidr, $div } from '@fimbul-works/seidr';

const celsius = new Seidr(0);
const fahrenheit = celsius.as(c => (c * 9/5) + 32);

const display = $div({
  textContent: fahrenheit.as(f => `${f}°F`)
});

celsius.value = 100; // display shows "212°F"
```

### 🟡 Intermediate: Computed Values

Create observables that depend on multiple sources:

```typescript
import { Seidr, $div, $span } from '@fimbul-works/seidr';

const firstName = new Seidr('John');
const lastName = new Seidr('Doe');

// Computed full name updates when either name changes
const fullName = Seidr.computed(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);

const profile = $div({}, [
  $span({ textContent: 'First: ' }),
  $span({ textContent: firstName }),
  $span({ textContent: ' Last: ' }),
  $span({ textContent: lastName }),
  $span({ textContent: ' Full: ' }),
  $span({ textContent: fullName }) // Automatically updates!
]);

firstName.value = 'Jane'; // fullName becomes "Jane Doe"
lastName.value = 'Smith';  // fullName becomes "Jane Smith"
```

### 🟡 Intermediate: Two-Way Data Binding

Bind form inputs to observables with automatic synchronization:

```typescript
import { Seidr, $input, $span, $div } from '@fimbul-works/seidr';

// Helper for two-way binding
function bindInput(observable: Seidr<string>) {
  return {
    value: observable.value,
    oninput: (e: Event) => {
      observable.value = (e.target as HTMLInputElement).value;
    }
  };
}

const searchText = new Seidr('');

const searchComponent = $div({}, [
  $input({
    type: 'text',
    placeholder: 'Search...',
    ...bindInput(searchText)
  }),
  $span({ textContent: searchText.as(t => `Searching: ${t}`) })
]);

// Typing in input automatically updates the span
```

### 🟡 Intermediate: Reactive Class Names

Use the `cn` utility for dynamic class management:

```typescript
import { Seidr, cn, $div } from '@fimbul-works/seidr';

const isActive = new Seidr(false);
const size = new Seidr('large');
const hasError = new Seidr(false);

// Conditional classes with cn utility
const className = cn(
  'base-component',
  isActive.as(active => active && 'active'),
  size.as(s => `size-${s}`),
  hasError.as(error => error && 'has-error')
);

const element = $div({ className });

// Or toggle classes reactively using the element method
const highlight = new Seidr(false);
element.toggleClass('highlight', highlight);

highlight.value = true; // Adds 'highlight' class
```

### 🔴 Advanced: Component Switching

Switch between different components based on observable state:

```typescript
import { mountSwitch, Seidr, $div, $button, component } from '@fimbul-works/seidr';

type ViewMode = 'list' | 'grid' | 'table';
const viewMode = new Seidr<ViewMode>('list');

const ListView = () => component(() =>
  $div({ textContent: 'List View 📋' })
);

const GridView = () => component(() =>
  $div({ textContent: 'Grid View 📊' })
);

const TableView = () => component(() =>
  $div({ textContent: 'Table View 📈' })
);

// Control buttons
const controls = $div({}, [
  $button({
    textContent: 'List',
    onclick: () => viewMode.value = 'list'
  }),
  $button({
    textContent: 'Grid',
    onclick: () => viewMode.value = 'grid'
  }),
  $button({
    textContent: 'Table',
    onclick: () => viewMode.value = 'table'
  })
]);

document.body.appendChild(controls);

// Automatically switches components with full cleanup
mountSwitch(
  viewMode,
  {
    list: ListView,
    grid: GridView,
    table: TableView
  },
  document.body
);
```

### 🔴 Advanced: Nested Components with Shared State

Build complex component hierarchies:

```typescript
import { component, Seidr, $div, $button, $input } from '@fimbul-works/seidr';

// Shared observable
const count = new Seidr(0);

const Counter = () => component(() =>
  $div({}, [
    $span({ textContent: count.as(c => `Count: ${c}`) }),
    $button({
      textContent: '+',
      onclick: () => count.value++
    })
  ])
);

const Doubler = () => component(() =>
  $div({
    textContent: count.as(c => `Double: ${c * 2}`)
  })
);

const App = () => component(() =>
  $div({}, [
    Counter(),
    Counter(), // Two counters share the same state!
    Doubler()
  ])
);
```

## 📚 API Reference

### Core Reactive

#### `new Seidr<T>(initialValue)`
Creates a reactive observable that automatically updates bound DOM elements.

```typescript
const count = new Seidr(0);
const name = new Seidr('Alice');
```

#### `seidr.value`
Get or set the current value. Setting triggers all bindings.

```typescript
count.value = 5;      // Set value
console.log(count.value); // Get value
```

#### `seidr.as(fn)`
Create a derived observable that transforms the source value.

```typescript
const doubled = count.as(n => n * 2);
const isEven = count.as(n => n % 2 === 0);
```

#### `Seidr.computed(fn, dependencies)`
Create a computed observable that depends on multiple sources.

```typescript
const fullName = Seidr.computed(
  () => `${first.value} ${last.value}`,
  [first, last]
);
```

#### `seidr.bind(element, updateFn)`
Manually bind an observable to an element with custom update logic. Returns cleanup function.

```typescript
const cleanup = count.bind(element, (value, el) => {
  el.textContent = `Count: ${value}`;
});
// Later: cleanup();
```

### Components & Lifecycle

#### `component(fn)`
Create a component with automatic cleanup. Function receives a `scope` object.

```typescript
const MyComponent = () => component((scope) => {
  // Component logic
  return element;
});
```

#### `scope.track(cleanup)`
Register a cleanup function to be called when component is destroyed.

```typescript
scope.track(() => {
  console.log('Cleaning up!');
});
```

#### `component.destroy()`
Manually trigger component cleanup and removal.

```typescript
const comp = MyComponent();
comp.destroy();
```

### Mounting & Rendering

#### `mount(component, container)`
Mount a component to a DOM container.

```typescript
mount(MyComponent(), document.body);
```

#### `mountConditional(observable, factory, container)`
Conditionally mount/unmount a component based on observable value.

```typescript
mountConditional(
  isVisible,
  () => Panel(),
  container
);
```

#### `mountList(observable, keyFn, factory, container)`
Render a list with efficient key-based diffing.

```typescript
mountList(
  items,
  item => item.id,
  item => ItemComponent({ item }),
  container
);
```

#### `mountSwitch(observable, components, container)`
Switch between multiple components based on observable value.

```typescript
mountSwitch(
  viewMode,
  { list: ListView, grid: GridView },
  container
);
```

### Element Creators

All HTML elements available with `$` prefix:

```typescript
// Structure
$div, $span, $p, $section, $article, $header, $footer, $main, $aside, $nav

// Headings
$h1, $h2, $h3, $h4, $h5, $h6

// Text
$a, $strong, $em, $small, $mark, $abbr, $code, $pre

// Forms
$form, $input, $textarea, $button, $select, $option, $label, $fieldset, $legend

// Lists
$ul, $ol, $li, $dl, $dt, $dd

// Tables
$table, $thead, $tbody, $tfoot, $tr, $td, $th, $caption

// Media
$img, $video, $audio, $canvas, $svg

// And 40+ more...
```

### Utilities

#### `cn(...classes)`
Utility for conditional class names with reactive support.

```typescript
const className = cn(
  'base',
  isActive && 'active',
  { 'large': size === 'large' }
);
```

#### `element.toggleClass(className, observable)`
Reactively toggle a class on an element based on observable value.

```typescript
const isActive = new Seidr(false);
const button = $button({ textContent: 'Click me' });
button.toggleClass('active', isActive);

isActive.value = true; // Adds 'active' class
isActive.value = false; // Removes 'active' class
```

#### `$(selector)` / `$all(selector)`
DOM query utilities.

```typescript
const el = $('#my-id');
const all = $all('.my-class');
```

## ⚡ Performance

Seidr's direct DOM manipulation approach offers several performance advantages:

### Surgical Updates
Only changed elements are updated with no virtual DOM diffing overhead.

```typescript
const count = new Seidr(0);
const display = $span({ textContent: count });

// Only the span's textContent is updated, nothing else
count.value++;
```

### No Reconciliation
Unlike React/Vue, Seidr doesn't need to diff component trees. Updates go straight to the DOM.

### Minimal Bundle Impact
- **React counter app**: ~42KB (React + ReactDOM)
- **Vue counter app**: ~35KB (Vue runtime)
- **Seidr counter app**: ~1.1KB (minified + gzipped)

### Efficient List Rendering
Key-based diffing ensures minimal DOM operations:

```typescript
// Only removes 1 element, doesn't re-render entire list
todos.value = todos.value.filter(t => t.id !== 3);
```

### Memory Safety
Automatic cleanup prevents memory leaks from abandoned subscriptions:

```typescript
const comp = MyComponent();
comp.destroy(); // All bindings cleaned up automatically
```

## 🌐 Browser Support

Seidr works in all modern browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

**Requires:**
- ES6 Class support
- ES6 Map/Set support

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
