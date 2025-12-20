# Seidr

**Seiðr** - the Old Norse magic of influence and causality. A lightweight reactive frontend library that weaves together DOM manipulation, reactive bindings, and component lifecycles into elegant, maintainable applications.

Build reactive user interfaces with minimal overhead and maximum control. No virtual DOM, no build step required, just pure functions and reactive primitives.

[![npm version](https://badge.fury.io/js/%40fimbul-works%2Fseidr.svg)](https://www.npmjs.com/package/@fimbul-works/seidr)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/microsoft/TypeScript)

## Features

- 🪄 **Reactive Bindings** - Automatic `ObservableValue` to DOM attribute binding
- 🎯 **Type-Safe Props** - TypeScript magic for reactive HTML attributes
- 🏗️ **Component System** - Lifecycle management with automatic cleanup
- 📦 **Tiny Footprint** - 1.2KB minified + gzipped, no virtual DOM
- 🔧 **Functional API** - Simple, composable functions for DOM creation
- ⚡ **Zero Dependencies** - Pure TypeScript, build step optional

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
import { component, mount, ObservableValue, DivEl, ButtonEl, SpanEl } from '@fimbul-works/seidr';

function Counter() {
  return component((scope) => {
    const count = new ObservableValue(0);
    const isDisabled = new ObservableValue(false);

    const container = DivEl({
      className: 'counter',
      style: 'padding: 20px; border: 1px solid #ccc;'
    }, [
      SpanEl({ textContent: `Count: ${count.value}` }), // Static initial text
      ButtonEl({
        textContent: 'Increment',
        disabled: isDisabled, // Reactive boolean binding!
        onclick: () => {
          count.value++;
          isDisabled.value = count.value >= 10; // Disable after 10 clicks
        }
      }),
      ButtonEl({
        textContent: 'Reset',
        onclick: () => {
          count.value = 0;
          isDisabled.value = false;
        }
      })
    ]);

    // Reactive binding for text content
    scope.track(
      bind(count, container.children[0] as HTMLSpanElement, (value, el) => {
        el.textContent = `Count: ${value}`;
      })
    );

    return container;
  });
}

// Mount component
const counter = Counter();
mount(counter, document.body);
```

## Core Concepts

## 🪄 Reactive Props - The Magic

Seidr's killer feature: **automatically bind ObservableValue<string>, ObservableValue<number>, or ObservableValue<boolean> to any writable DOM attribute**:

```typescript
import { ObservableValue, InputEl, ButtonEl, DivEl } from '@fimbul-works/seidr';

// Create reactive observables
const disabled = new ObservableValue(false);
const className = new ObservableValue('btn-primary');
const maxLength = new ObservableValue(50);
const placeholder = new ObservableValue('Enter text...');

// Automatic reactive bindings - no manual bind() needed!
const input = InputEl({
  type: 'text',
  className, // ObservableValue<string> → className property
  disabled, // ObservableValue<boolean> → disabled property
  maxLength, // ObservableValue<number> → maxLength property
  placeholder // ObservableValue<string> → placeholder property
});

// Any change to the observable automatically updates the DOM
disabled.value = true; // input.disabled becomes true
className.value = 'btn-disabled'; // input.className becomes 'btn-disabled'
maxLength.value = 100; // input.maxLength becomes 100
```

### Manual Reactive Bindings

For complex transformations, use the `bind` function:

```typescript
import { ObservableValue, bind, DivEl, SpanEl } from '@fimbul-works/seidr';

const count = new ObservableValue(0);
const container = DivEl();
const display = SpanEl();

// Custom transformation function
const cleanup = bind(count, display, (value, el) => {
  el.textContent = value > 5 ? 'Many clicks!' : `Count: ${value}`;
});

count.value = 3; // display shows "Count: 3"
count.value = 7; // display shows "Many clicks!"

// Later: cleanup() to remove binding
```

### Components with Lifecycle

Components automatically manage cleanup of bindings, child components, and resources:

```typescript
import { component, mount, ObservableValue, DivEl, SpanEl, ButtonEl, bind } from '@fimbul-works/seidr';

function UserProfile() {
  return component((scope) => {
    const name = new ObservableValue('Alice');
    const age = new ObservableValue(30);
    const isEditing = new ObservableValue(false);

    const container = DivEl({ className: 'user-profile' }, [
      // Reactive name display
      SpanEl({ textContent: name }),

      // Reactive age display
      SpanEl({ textContent: `Age: ${age.value}` }),

      // Edit button with reactive disabled state
      ButtonEl({
        textContent: 'Edit',
        disabled: isEditing,
        onclick: () => isEditing.value = !isEditing.value
      }),

      // Conditional save button
      isEditing.value ? ButtonEl({
        textContent: 'Save',
        onclick: () => isEditing.value = false
      }) : null
    ]);

    // Manual binding for complex transformation
    scope.track(
      bind(age, container.children[1] as HTMLSpanElement, (value, el) => {
        el.textContent = `Age: ${value}`;
      })
    );

    return container;
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
import { mountConditional, ObservableValue, DivEl, ButtonEl, component } from '@fimbul-works/seidr';

const isVisible = new ObservableValue(false);

function DetailsPanel() {
  return component((scope) => {
    return DivEl({ className: 'details-panel' }, [
      DivEl({ textContent: 'User Details' }),
      DivEl({ textContent: 'Some additional information...' }),
      ButtonEl({
        textContent: 'Close',
        onclick: () => isVisible.value = false
      })
    ]);
  });
}

const conditional = mountConditional(
  isVisible,
  () => DetailsPanel(), // Only created when needed
  document.body
);

isVisible.value = true; // Component automatically mounts and becomes visible
isVisible.value = false; // Component automatically unmounts and cleans up
```

### List Rendering

Efficiently render lists from observable arrays:

```typescript
import { mountList, ObservableValue, DivEl, SpanEl, ButtonEl, component } from '@fimbul-works/seidr';

const todos = new ObservableValue([
  { id: 1, text: 'Learn Seidr', completed: false },
  { id: 2, text: 'Build amazing apps', completed: false }
]);

function TodoItem({ todo }: { todo: any }) {
  return component((scope) => {
    const isCompleted = new ObservableValue(todo.completed);

    return DivEl({
      className: 'todo-item',
      style: 'display: flex; align-items: center; gap: 10px; margin: 5px 0;'
    }, [
      // Reactive checkbox
      ButtonEl({
        textContent: isCompleted.value ? '✅' : '⭕',
        onclick: () => {
          isCompleted.value = !isCompleted.value;
          todo.completed = isCompleted.value;
        }
      }),

      // Reactive text styling
      SpanEl({
        textContent: todo.text,
        style: isCompleted.value ? 'text-decoration: line-through;' : ''
      })
    ]);
  });
}

const list = mountList(
  todos,
  (item) => item.id, // Key function for efficient updates
  (item) => TodoItem({ todo }), // Component factory
  document.body
);

// Updates efficiently handle additions, removals, and reordering
todos.value = [...todos.value, { id: 3, text: 'Master reactive programming', completed: false }];
todos.value = todos.value.filter(todo => todo.id !== 1); // Remove item
```

## Advanced Patterns

### Computed Values

Create derived observables that automatically update when dependencies change:

```typescript
import { ObservableValue, computed, DivEl, SpanEl } from '@fimbul-works/seidr';

const firstName = new ObservableValue('John');
const lastName = new ObservableValue('Doe');

// Computed full name that updates when either first or last name changes
const fullName = computed(
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);

const profile = DivEl([
  SpanEl({ textContent: 'First Name:' }),
  SpanEl({ textContent: firstName }),
  SpanEl({ textContent: 'Last Name:' }),
  SpanEl({ textContent: lastName }),
  SpanEl({ textContent: 'Full Name:' }),
  SpanEl({ textContent: fullName }) // Automatically updates!
]);

firstName.value = 'Jane'; // fullName becomes "Jane Doe"
```

### Two-Way Binding

Bind form inputs to observables with automatic synchronization:

```typescript
import { ObservableValue, InputEl, SpanEl, bind, DivEl } from '@fimbul-works/seidr';

const searchText = new ObservableValue('');

const searchComponent = DivEl([
  // Input that updates the observable
  InputEl({
    type: 'text',
    placeholder: 'Search...',
    value: searchText, // Reactive initial value
    oninput: (e) => searchText.value = e.target.value
  }),

  // Display that shows the current search text
  SpanEl({ textContent: searchText }) // Reactive display!
]);

// Manual binding for bidirectional sync
const cleanup = bind(searchText, searchComponent.children[0] as HTMLInputElement, (value, el) => {
  if (el !== document.activeElement) { // Don't update while user is typing
    el.value = value;
  }
});
```

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
