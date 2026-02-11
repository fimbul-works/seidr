# Component API

Seidr components are functions that return UI elements. They can receive data via arguments (*"props"*) and use the [`useScope()`](#usescope) hook for lifecycle management.

## component()

While most components can be plain functions, the `component()` wrapper is used to create a formal [`SeidrComponent`](#seidrcomponent-type). This is useful when you need to pass a "pre-packaged" component factory between modules, or when you need to manually manage the [`SeidrComponent`](#seidrcomponent-type) instance.

**Parameters:**
- `factory` - Factory function (signature `(props) => SeidrNode`)
- `name` - Optional name for the component (for debugging)

**Returns:** [`SeidrComponent`](#seidrcomponent-type)

```typescript
{
  element: HTMLElement | Array<HTMLElement>; // The element or an array of elements
  unmount: () => void;                       // Cleanup function
}
```

**Automatic Lifecycle**: All components automatically track child components and reactive bindings created during their execution.

### Component Props

Components accept parameters for configuration and initial state. Using plain function arguments is the recommended way to handle "props":

```typescript
import { Seidr, $div, $button, $span, mount } from '@fimbul-works/seidr';

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

// Using the component in different contexts
mount(() => Counter({ initialCount: 5, step: 2, label: 'Steps' }), container1);
mount(() => Counter({ initialCount: 0 }), container2);
```

**Props Best Practices:**
- Destructure props with defaults for optional parameters: `{ prop = default } = {}`
- Props are captured when the component is created (not when mounted)
- Each component instance has isolated state, even with the same props

**Component Hierarchy with Automatic Tracking**:

```typescript
import { $div, $header, $img, mount } from '@fimbul-works/seidr';

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
- `component` - [`SeidrComponent`](#seidrcomponent-type) to mount.
- `container` - DOM element.

**Returns:** Function that unmounts and removes the component when called.

```typescript
import { mount, $div } from '@fimbul-works/seidr';

const App = () => $div({ textContent: 'Hello Seidr' });

const unmount = mount(App, document.getElementById('app')!);

// Later
unmount();
```

---

## useScope()

Call `useScope()` inside the [component factory](#component) to get the scope object for tracking cleanup:

```typescript
import { useScope, Seidr, $div, $span, $button } from '@fimbul-works/seidr';

const Timer = () => {
  const scope = useScope();
  const count = new Seidr(0);

  const interval = setInterval(() => count.value++, 1000);

  // Cleanup function
  scope.track(() => clearInterval(interval));

  return $div({ textContent: count });
};

// Mount it
const unmount = mount(Timer, document.body);

// When done:
unmount(); // Cleans up the interval
```

---

## wrapComponent()

Wraps a component factory to ensure it creates a proper [`SeidrComponent`](#seidrcomponent-type). This utility normalizes both function components and raw DOM nodes into a consistent component interface.

**Parameters:**
- `factory` - A component factory function, a SeidrComponent factory, or a raw DOM node.

**Returns**: A function that returns a [`SeidrComponent`](#seidrcomponent-type)

```typescript
import { wrapComponent, $div } from '@fimbul-works/seidr';

// Wraps a simple function component
const SimpleComp = () => $div({ textContent: 'Hello' });
const factory = wrapComponent(SimpleComp);
const component = factory(); // returns SeidrComponent
```

---

## Built-in Components

For built in components, see:
- [`Conditional()`](Conditional.md#conditional)
- [`List()`](List.md#list)
- [`Switch()`](Switch.md#switch)
- [`Safe()`](Safe.md#safe)
- [`Suspense()`](Suspense.md#suspense)

---

## SeidrComponent type

```typescript
/**
 * Represents a Seidr component with automatic lifecycle management.
 *
 * Components are the primary building blocks of Seidr applications, encapsulating
 * both the visual element and the cleanup logic needed for proper resource
 * management. Each component tracks its own reactive bindings, event listeners,
 * and child components.
 */
export interface SeidrComponent {
  /**
   * Read-only identifier for Seidr components.
   * @type {typeof TYPE.COMPONENT}
   */
  readonly [TYPE_PROP]: typeof TYPE_COMPONENT;

  /**
   * The unique identifier of the component.
   */
  readonly id: string;

  /**
   * The root element of the component.
   *
   * This element is enhanced with SeidrElement functionality including
   * reactive bindings, event handling, and cleanup capabilities.
   * @type {SeidrComponentChildren}
   */
  element: SeidrComponentChildren;

  /**
   * The start marker of the component.
   * @type {Comment}
   */
  startMarker: Comment;

  /**
   * The end marker of the component.
   * @type {Comment}
   */
  endMarker: Comment;

  /**
   * The ComponentScope of this element.
   * @type {ComponentScope}
   */
  scope: ComponentScope;

  /**
   * Unmounts the component, destroying its scope and removing its elements from the DOM.
   */
  unmount(): void;
}
```

---

### ComponentScope type

```typescript
/**
 * Manages cleanup functions and child components within a component's lifecycle.
 *
 * The ComponentScope provides a centralized way to track all resources that
 * need to be cleaned up when a component is destroyed. This prevents memory
 * leaks and ensures proper resource management throughout the application.
 */
export interface ComponentScope {
  /**
   * The unique identifier of the component.
   */
  readonly id: string;

  /**
   * Whether the scope has been destroyed.
   */
  readonly isDestroyed: boolean;

  /**
   * Tracks a cleanup function to be executed when the component is destroyed.
   *
   * Use this method to register any cleanup logic that should run when
   * the component is no longer needed, such as removing event listeners,
   * cleaning up reactive bindings, or clearing timeouts.
   *
   * @param {CleanupFunction} cleanup - The cleanup function to execute
   */
  track(cleanup: CleanupFunction): void;

  /**
   * Register a promise to wait for (SSR integration).
   * @param promise - The promise to track
   * @returns {Promise<T>} The same promise, for chaining
   */
  waitFor<T>(promise: Promise<T>): Promise<T>;

  /**
   * Tracks a child component for automatic cleanup when this component is destroyed.
   *
   * Child components are automatically destroyed when their parent component
   * is destroyed, creating a proper cleanup hierarchy. This method ensures
   * that child components are properly managed and cleaned up.
   *
   * @param {SeidrComponent} component - The child component to track
   * @returns {SeidrComponent} The same child SeidrComponent
   */
  child(component: SeidrComponent): SeidrComponent;

  /**
   * Destroys all tracked resources and marks the scope as destroyed.
   *
   * This method executes all registered cleanup functions in the order
   * they were added. Once destroyed, the scope can no longer be used
   * to track new cleanup functions.
   */
  destroy(): void;

  /**
   * Notifies the scope that it has been attached to the DOM.
   * This will trigger onAttached and propagate to child components.
   * @param parent - The parent DOM node
   */
  attached(parent: Node): void;

  /**
   * Optional callback triggered when the component is attached to a parent.
   */
  onAttached?: (parent: Node) => void;
}
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
