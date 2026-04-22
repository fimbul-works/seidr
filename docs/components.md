# Component API

Seidr components are functions that return UI elements. They can receive data via arguments (*"props"*) and use the [`useScope().onMount()`](#onmount), [`useScope().onAttached()`](#onattached) and [`useScope().onUnmount()`](#onunmount) for lifecycle management.

## component()

While most components can be plain functions, the `component()` wrapper is used to create a formal [`Component`](#component-type). This is useful when you need to pass a "pre-packaged" component factory between modules, or when you need to manually manage the [`Component`](#component-type) instance.

**Parameters:**
- `factory` - Factory function (signature `(props) => SeidrNode`)
- `name` - Optional name for the component (for debugging)

**Returns:** [`Component`](#component-type)

**Automatic Lifecycle**: All components automatically track child components and reactive bindings created during their execution.

### Component Props

Components accept parameters for configuration and initial state. Using plain function arguments is the recommended way to handle "props":

```typescript
import { Seidr, mount } from '@fimbul-works/seidr';
import { $div, $button, $span } from '@fimbul-works/seidr/html';

const Counter = ({ initialCount = 0, step = 1, label = 'Counter' } = {}) => {
  const count = new Seidr(initialCount);

  return $div({ className: 'counter' }, [
    $span({ textContent: label }),
    $span({ textContent: count.as(n => `: ${n}`) }),
    $button({
      textContent: `+${step}`,
      onclick: () => count.value += step
    })
  ]);
};

// Mounting multiple instances with explicit names for isolation.
// This is recommended when mounting multiple independent roots in the same document
// to ensure unique IDs and prevent state collisions.
mount(component(() => Counter({ initialCount: 5, step: 2, label: 'Steps' }), 'StepsCounter'), container1);
mount(component(() => Counter({ initialCount: 0 }), 'DefaultCounter'), container2);
```

**Props Best Practices:**
- Destructure props with defaults for optional parameters: `{ prop = default } = {}`
- Props are captured when the component is created (not when mounted)
- Each component instance has isolated state, even with the same props

**Component Hierarchy with Automatic Tracking**:

```typescript
import { mount } from '@fimbul-works/seidr';
import { $div, $header, $img } from '@fimbul-works/seidr/html';

const Header = () => $header({ textContent: 'User Profile' });
const Avatar = () => $img({ src: '/avatar.png', alt: 'User Avatar' });

const UserProfile = () => {
  return $div({ className: 'profile' }, [
    Header, // Plain functions can be passed directly as children!
    Avatar
  ]);
};

mount(UserProfile, document.body);
```

---

## mount()

Mount a component to a DOM container.

**Parameters:**
- `component` - [`Component`](#component-type) to mount.
- `container` - DOM element.

**Returns:** Function that unmounts and removes the component when called.

```typescript
import { mount } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const App = () => $div({ textContent: 'Hello Seidr' });

const unmount = mount(App, document.getElementById('app')!);

// Later
unmount();
```

---

## useScope()

Get the current component scope.

**Returns:** [`Component`](#component-type)

```typescript
import { useScope } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const Example = () => {
  const scope = useScope();

  return $div({ textContent: scope.id });
};

// Scope is available
mount(Example, document.body);
```

### onMount()

Call `useScope().onMount()` inside the [component factory](#component) to register a callback that is triggered when the component is mounted.

```typescript
import { useScope } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const Example = () => {
  useScope().onMount((parent) => console.log("Mounted to element", parent));

  return $div({ textContent: count });
};

// Callback is triggered
mount(Example, document.body);
```

### onAttached()

Call `useScope().onAttached()` inside the [component factory](#component) to register a callback that is triggered when the component is attached to a document.

```typescript
import { useScope } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const Example = () => {
  useScope().onAttached(() => console.log("Attached to document"));

  return $div({ textContent: count });
};

// Callback is triggered
mount(Example, document.body);
```

### onUnmount()

Call `useScope().onUnmount()` inside the [component factory](#component) to register a callback that is triggered when the component is unmounted.

```typescript
import { useScope, Seidr } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const Timer = () => {
  const count = new Seidr(0);

  const interval = setInterval(() => count.value++, 1000);

  // Cleanup function
  useScope().onUnmount(() => clearInterval(interval));

  return $div({ textContent: count });
};

// Mount it
const unmount = mount(Timer, document.body);

unmount(); // Cleans up the interval
```

---

## wrapComponent()

Wraps a component factory to ensure it creates a proper [`Component`](#component-type). This utility normalizes both function components and raw DOM nodes into a consistent component interface.

**Parameters:**
- `factory` - A component factory function, a SeidrComponent factory, or a raw DOM node.

**Returns**: A function that returns a [`Component`](#component-type)

```typescript
import { wrapComponent } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

// Wraps a simple function component
const SimpleComp = () => $div({ textContent: 'Hello' });
const factory = wrapComponent(SimpleComp);
const component = factory(); // returns SeidrComponent
```

---

## Built-in Components

For built in components, see:
- [`Show()`](Show.md#show)
- [`List()`](List.md#list)
- [`Switch()`](Switch.md#switch)
- [`Safe()`](Safe.md#safe)
- [`Suspense()`](Suspense.md#suspense)

---

## Component type

Represents a Seidr component with automatic lifecycle management.

Components are the primary building blocks of Seidr applications, encapsulating both the visual element and the cleanup logic needed for proper resource management.

**Properties:**
- `id` - The unique identifier of the component.
- `numericId` - The numeric representation of the identifier, used for generating children's IDs.
- `isMounted` - Whether the component has been destroyed.
- `parent` - The parent component.
- `parentNode` - The parent DOM node, if mounted.
- `element` - The root element of the component.
- `children` - The child components.
- `startMarker` - The start marker of the component.
- `endMarker` - The end marker of the component.

**Methods:**
- `onMount(callback: OnMountFunction): void` - Callback triggered when the component is mounted to a parent.
- `onAttached(callback: () => void): void` - Callback triggered when the component tree is attached to a document.
- `onUnmount(cleanup: CleanupFunction): void` - Tracks a cleanup function to be executed when the component is destroyed.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
