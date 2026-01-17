# Seidr - Developer Guide for Agents

## Philosophy

**Seidr** is a reactive frontend library with one core principle: **Seidr is the only class, everything else is utility functions.**

- **Tree-shakeable**: Import only what you use
- **Type-safe**: Full TypeScript with advanced type inference
- **Minimal**: Zero virtual DOM, direct DOM manipulation
- **Predictable**: Pure functions, explicit cleanup

## Documentation Strategy

### Overview

 Seidr uses a **documentation-test synchronization** strategy to ensure all examples in documentation actually work correctly.

 ## Git Rules

 **CRITICAL**: Never commit or push without explicit permission from the user.
 - Always ask for confirmation before running `git commit` or `git push`.
 - This rule is absolute and applies across all sessions.

 ### Three-Layer Documentation

1. **JSDoc Comments** - Source code documentation with examples
2. **API.md** - Comprehensive API reference with all examples
3. **README.md** - User guide with quick start and core concepts
4. **SSR.md** - Server-Side Rendering complete guide

### Synchronization Rule

**CRITICAL**: Every example in documentation has a corresponding test. When updating examples, update tests to prevent drift.

```typescript
// Documentation Example Test
describe("uidTime - Documentation Examples", () => {
  it("should work with basic usage example", () => {
    const id = uid();
    const createdAt = uidTime(id);
    expect(typeof createdAt).toBe("number");
  });
});
```

## Core Architecture

### The Reactive State: `Seidr<T>`

```typescript
const count = new Seidr(0);
count.value = 5;                    // Set
console.log(count.value);            // Get: 5

const doubled = count.as(n => n * 2); // Derived value
const fullName = Seidr.computed(      // Computed value
  () => `${firstName.value} ${lastName.value}`,
  [firstName, lastName]
);
```

### Everything Else is a Utility Function

#### DOM Creation (`src/core/dom/`)

**The `$` prefix = DOM operations**

```typescript
import { $ } from '@fimbul-works/seidr';
const div = $('div', { className: 'foo' }, []);

import { $div, $button, $input } from '@fimbul-works/seidr';
const button = $button({ textContent: 'Click me' });

import { $factory } from '@fimbul-works/seidr';
const $card = $factory('article');
const $primaryButton = $factory('button', { className: 'btn btn-primary' });
```

**Reactive Props Magic**:
```typescript
const isActive = new Seidr(false);
const button = $button({
  disabled: isActive.as(active => !active), // Seidr<boolean> assigned to boolean property
});
```

#### Component System (`src/core/dom/component.ts`)

**CRITICAL**: Components can now be **pure functions**! The `component()` wrapper is optional and only needed for creating reusable factories.

```typescript
// ✅ RECOMMENDED: Pure function components
const Counter = ({ start = 0 } = {}) => {
  const scope = useScope(); // Automatic scope when mounted!
  const count = new Seidr(start);

  return $button({
    textContent: count.as(n => `Count: ${n}`),
    onclick: () => count.value++
  });
};

// Mount it directly
mount(Counter, document.body);

// Or pass props
mount(() => Counter({ start: 10 }), document.body);

// ✅ OPTIONAL: component() wrapper for reusable factories
const CounterFactory = component(({ start = 0 } = {}) => {
  const scope = useScope();
  const count = new Seidr(start);

  return $button({
    textContent: count.as(n => `Count: ${n}`),
    onclick: () => count.value++
  });
});

// Usage: Returns a factory function
const counter1 = CounterFactory({ start: 5 });
const counter2 = CounterFactory(); // Uses defaults

mount(counter1, container1);
mount(counter2, container2);
```

**The Magic of `useScope()`:**

When you mount a function using `mount()`, `List()`, `Conditional()`, or `Switch()`, Seidr automatically provides a reactive scope. This means:
- `useScope()` works in **any plain function**
- Automatic cleanup of reactive bindings
- No memory leaks
- Simple, functional API

**When to use `component()` wrapper:**
- Creating reusable component factories to pass between modules
- Need to manually manage `SeidrComponent` instances
- Want a single "pre-packaged" component unit

**When to use plain functions:**
- Most cases (95% of the time)
- Simpler API
- Better testability
- Easier to understand

**See API.md for complete component documentation including:**
- Props pattern with plain functions
- Safe components (error boundaries)
- Automatic child tracking
- Declarative components (Conditional, List, Switch, Router)

## Code Quality Standards

### No Global Hacks

**CRITICAL**: Avoid using global variables (`globalThis`, `window` hacks, etc.) for state management or communication.

**Rationale**: Global hacks are:
- Hard to debug and test
- Prone to race conditions in concurrent scenarios
- Difficult to reason about in complex systems
- Often unnecessary with proper architecture

**Instead**: Use:
- Function parameters and return values
- Proper scope management (e.g., render stacks, context objects)
- Well-defined interfaces and dependency injection
- The module system for shared state

**If you think you need a global hack**: Split files into smaller parts, or STOP!!! ...Have a conversation about the issue and the next move. Consult with the team first. There's almost always a more elegant solution!

## Build System

### Build Commands

```bash
npm run build     # Full TypeScript compilation
npm run build:all # Create minified bundles and get a size report
npm test          # Run all tests
```

**Current sizes** (gzipped):
- `example.counter.min.js.gz`: 1.8 KB (reactive core only)
- `seidr.min.js.gz`: 7.1 KB (full library: core + router + SSR + utilities)

**Size Regression Check**: If bundle size increased >10%, investigate.

**Note:** The 7.1KB footprint includes the entire library. If your project only uses core reactivity and elements, your baseline bundle will be significantly smaller due to tree-shaking.

## Project Status

**Version**: 1.0.0

### Production Ready ✅

- ✅ **Dual-entry architecture** (browser/Node separation)
- ✅ **Complete SSR support** with `renderToString()` and `hydrate()`
- ✅ **578+ tests passing** with comprehensive coverage
- ✅ **Full documentation-test synchronization**
- ✅ **Advanced TypeScript patterns**
- ✅ **AsyncLocalStorage-based render context** for Node.js SSR
- ✅ **Minimal bundle size** (browser/Node builds)
- ✅ **Declarative components** (Conditional, List, Switch, Router)
- ✅ **Automatic child component tracking** when passed as children
- ✅ **Pure function components** - components can now be plain functions
- ✅ **Router with SSR support** - proper `AsyncLocalStorage` isolation
- ✅ **Environment utilities** - `inServer()`, `inBrowser()`, `isServer()`, `isBrowser()`

### Recent Improvements

#### Component System Refactoring
- **Pure function components**: Components can now be simple functions that return DOM elements
- **Automatic lifecycle management**: When mounted via `mount()`, `List()`, `Conditional()`, or `Switch()`, components automatically receive a reactive scope
- **`useScope()` hook**: Access component lifecycle for cleanup tracking in plain functions
- **No more component classes**: The `component()` wrapper is now optional, used only for creating reusable factories

#### Router System
- **SSR with `initialPath`**: Pass `req.path` to `renderToString()` for proper server-side routing
- **AsyncLocalStorage isolation**: Each request gets isolated path state via `RenderContext`
- **Single-pass rendering**: SSR renders once based on `initialPath`, no re-renders on navigation
- **`Link` component**: Navigation links with active state support and reactive `to` prop
- **`createRoute()` helper**: Type-safe route creation for `Router()` component

##### SSR Enhancements
- **Lazy registration**: Seidr instances register automatically when observed/bound/used (not during creation)
- **`inServer()` with async support**: Automatically awaited by `renderToString()` for data fetching
- **`inBrowser()`**: Client-side only code execution
- **`isServer()` / `isBrowser()`**: Dynamic environment checks safe for testing
- **Dual-mode pattern**: Single component works on both server and client via `setState()`/`getState()`
- **`random()` utility**: SSR-safe deterministic random using the Alea algorithm

#### API Additions
- **Type guards**: `isUndefined()`, `isBool()`, `isNum()`, `isStr()`, `isFn()`, `isObj()`, `isSeidr()`, `isSeidrComponent()`, `isHTMLElement()`, `isSeidrElement()`
- **Utilities**: `wrapSeidr()`, `unwrapSeidr()`, `random()` (SSR-safe deterministic random)
- **State management**: `hasState()`, `setState()`, `getState()`, `createStateKey()`
- **Query functions**: `$getById()`, `$query()`, `$queryAll()`

## Key Differences from Other Libraries

- **No component classes**: Components are functions
- **No virtual DOM**: Direct DOM manipulation
- **No build step required**: Use directly in browsers with ESM
- **One reactive primitive**: `Seidr<T>` class only
- **Everything else is utilities**: Tree-shakeable functions

## For Detailed Information

See these documents:
- **README.md** - User guide, quick start, conceptual overview
- **API.md** - Complete API reference with examples
- **SSR.md** - Server-Side Rendering complete guide
- **JSDoc comments** in source files - Detailed documentation
