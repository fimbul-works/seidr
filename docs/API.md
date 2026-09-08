# Seidr API Reference

Seidr is organized into a lightweight core library and specialized sub-exports to keep bundle sizes minimal.

- **Core API** (`@fimbul-works/seidr`): Reactive state, components, lifecycle hooks, routing, and core DOM utilities.
- **HTML Elements** (`@fimbul-works/seidr/html`): Predefined element creators for standard HTML tags.
- **SSR API** (`@fimbul-works/seidr/ssr`): Server-side rendering and hydration utilities.

---

## [Reactive State](Value.md) (`@fimbul-works/seidr`)
- [`createValue()`](Value.md#createvalue) — Factory function to create reactive getter-setter Values.
- [`mergeValues()`](Value.md#mergevalues) — Create a derived Value combining multiple parent observables.
- [`withStorage()`](Value.md#withstorage) — Synchronize a Value with localStorage/sessionStorage.
- [`wrapValue()`](Value.md#wrapvalue) — Wrap a raw value in a Value observable if not already reactive.
- [`unwrapValue()`](Value.md#unwrapvalue) — Safely extract the raw value from a Value observable.
- [`wrapValueObject()`](Value.md#wrapvalueobject) — Wrap a Value in an OOP object accessor with getter/setter properties.
- [`isValue()`](Value.md#isvalue) — Check if a value is a Seidr Value observable.

## [DOM Elements](DOM.md)
- **Core Utilities** (`@fimbul-works/seidr`)
  - [`$()`](DOM.md#--create-dom-elements) — Create a DOM element with reactive attributes and child bindings.
  - [`$factory()`](DOM.md#factory) — Create a reusable custom element creator.
  - [DOM Query Utilities](DOM.md#dom-query-utilities)
    - [`$getById()`](DOM.md#getbyid) — Get a DOM element by ID.
    - [`$query()`](DOM.md#query) — Query a single DOM element.
    - [`$queryAll()`](DOM.md#queryall) — Query multiple DOM elements.
- **[Predefined Element Creators](DOM.md#predefined-element-creators)** (`@fimbul-works/seidr/html`)
  - `$div`, `$span`, `$p`, `$h1`, `$button`, `$input`, `$ul`, `$li`, `$table`, and more.

## [Components & Lifecycle](components.md) (`@fimbul-works/seidr`)
- [`createComponent()`](components.md#createcomponent) — Define a component with automatic lifecycle tracking.
- [`mount()`](components.md#mount) — Mount a component to a DOM container.
- Lifecycle Hooks:
  - [`onMounted()`](components.md#onmounted) — Register a callback executed when a component or DOM node is mounted.
  - [`onAttached()`](components.md#onattached) — Register a callback executed when a component or DOM node is attached to the document.
  - [`onUnmounted()`](components.md#onunmounted) — Register a cleanup callback executed when a component or DOM node is removed from the DOM.
  - [`getComponentScope()`](components.md#getcomponentscope) — Retrieve the active component instance.
  - [`watchMutations()`](components.md#watchmutations) — Enable DOM mutation tracking for node lifecycle hooks.
- [`wrapComponent()`](components.md#wrapcomponent) — Normalize a function or component factory.
- [`SeidrComponent`](components.md#seidrcomponent-type) — Component instance interface.
- [Built-In Components](components.md#built-in-components)
  - [`Show()`](Show.md#show) — Conditionally render children based on a reactive condition.
  - [`List()`](List.md#list) — Efficiently render and reconcile a keyed list from a reactive array.
  - [`Switch()`](Switch.md#switch) — Switch between components based on a reactive discriminant value.
  - [`Safe()`](Safe.md#safe) — Error boundary component providing fallback UI on initialization failure.
  - [`Suspense()`](Suspense.md#suspense) — Asynchronous boundary managing Promise resolution and loading states.

## [Router API](components.md#router-api) (`@fimbul-works/seidr`)
- `Router` — Declarative router component.
- `Link` — Declarative navigation link component.
- `useNavigate()` — Programmatic navigation hook.
- `usePathname()` — Reactive current pathname hook.
- `useRouteParams()` — Reactive route parameters hook.
- `useSearchParams()` — Reactive URL search query parameters hook.
- `browserRouter()`, `hashRouter()`, `initRouter()` — Router initialization utilities.

## [Utilities & Type Guards](TypeGuards.md) (`@fimbul-works/seidr`)
- [`wrapError()`](utils.md#wraperror) — Wrap an unknown thrown value in an `Error` or `SeidrError`.
- [Type Guards](TypeGuards.md):
  - [`isArray`](TypeGuards.md#isarray) — Check if a value is an array.
  - [`isBool`](TypeGuards.md#isbool) — Check if a value is a boolean primitive.
  - [`isFn`](TypeGuards.md#isfn) — Check if a value is a function.
  - [`isNum`](TypeGuards.md#isnum) — Check if a value is a number.
  - [`isObj`](TypeGuards.md#isobj) — Check if a value is a plain object.
  - [`isStr`](TypeGuards.md#isstr) — Check if a value is a string.
  - [`isNullish`](TypeGuards.md#isnullish) — Check if a value is `null` or `undefined`.
  - [`isValue`](TypeGuards.md#isvalue) — Check if a value is a reactive `Value`.
  - [`isComponent`](TypeGuards.md#iscomponent) — Check if a value is a `SeidrComponent`.
  - [`isComponentFactory`](TypeGuards.md#iscomponentfactory) — Check if a value is a wrapped `SeidrComponentFactory`.
  - [`isDOMNode`](TypeGuards.md#isdomnode) — Check if a value is a DOM `Node` / `ServerNode`.
  - [`isHTMLElement`](TypeGuards.md#ishtmlelement) — Check if a value is an `HTMLElement` / `ServerHTMLElement`.
  - [`isComment`](TypeGuards.md#iscomment) — Check if a value is a Comment node.
  - [`isTextNode`](TypeGuards.md#istextnode) — Check if a value is a Text node.

## [SSR API](SSR.md) (`@fimbul-works/seidr/ssr` & `@fimbul-works/seidr`)
- [`renderToString()`](SSR.md#rendertostring) — Render a component tree to HTML string and hydration payload.
- [`hydrate()`](SSR.md#hydrate) — Hydrate server-rendered HTML markup on the client.
- SSR Environment Utilities (`@fimbul-works/seidr`):
  - [`isClient()`](SSR.md#isclient) — Check if running in the browser environment.
  - [`inClient()`](SSR.md#inclient) — Run code only on the client.
  - [`isServer()`](SSR.md#isserver) — Check if running in the server (SSR) environment.
  - [`inServer()`](SSR.md#inserver) — Run code only on the server (awaits async Promises during SSR).

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md)
