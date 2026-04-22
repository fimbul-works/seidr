# Seidr API Reference

Seidr is organized into a core library and several specialized sub-exports to keep bundle sizes minimal.

- **Core API** (`@fimbul-works/seidr`): Reactive state, components, and core DOM utilities.
- **HTML Elements** (`@fimbul-works/seidr/html`): Predefined element creators for all standard HTML tags.
- **SSR API** (`@fimbul-works/seidr/ssr`): Server-side rendering and hydration utilities.

---

## [Reactive State](Seidr.md) (`@fimbul-works/seidr`)
  - [`Seidr`](Seidr.md#seidr-class) - The core reactive state class.
  - [`withStorage()`](Seidr.md#withstorage) - Decorate a Seidr instance with storage support.
  - [`wrapSeidr()`](Seidr.md#wrapseidr) - Wrap a value in a Seidr observable.
  - [`unwrapSeidr()`](Seidr.md#unwrapseidr) - Unwrap a Seidr observable to its value.

## [DOM Elements](DOM.md)
  - **Core Utilities** (`@fimbul-works/seidr`)
    - [`$()`](DOM.md#--create-dom-elements) - Create a DOM element.
    - [`$factory()`](DOM.md#factory) - Create a custom element creator.
    - [DOM Query Utilities](DOM.md#dom-query-utilities)
      - [`$getById()`](DOM.md#getbyid) - Get a DOM element by ID.
      - [`$query()`](DOM.md#query) - Query a single DOM element.
      - [`$queryAll()`](DOM.md#queryall) - Query multiple DOM elements.
  - **[Predefined Element Creators](DOM.md#predefined-element-creators)** (`@fimbul-works/seidr/html`)
    - `$div`, `$span`, `$p`, `$h1`, `$button`, and more...

## [Components](components.md) (`@fimbul-works/seidr`)
  - [`component()`](components.md#component) - Create a component.
  - [`mount()`](components.md#mount) - Mount a component to the DOM.
  - [`onMount()`](components.md#onmount) - Register a callback to be executed when component is mounted.
  - [`onUnmount()`](components.md#onunmount) - Register a callback to be executed when component is unmounted.
  - [`wrapComponent()`](components.md#wrapcomponent) - Convert a function into a component.
  - [`SeidrComponent`](components.md#seidrcomponent-type) - The type of a Seidr component.
  - [Built-In Components](components.md#built-in-components)
    - [`Show()`](Show.md#show) - A component that conditionally renders its children.
    - [`List()`](List.md#list) - A component that renders a list of items.
    - [`Switch()`](Switch.md#switch) - A component that renders a single child based on a condition.
    - [`Safe()`](Safe.md#safe) - A component that safely renders its children.
    - [`Suspense()`](Suspense.md#suspense) - A component that suspends rendering until a promise resolves.

## [Utilities](utils.md) (`@fimbul-works/seidr`)
- [`wrapError()`](utils.md#wrap-error) - Wrap a value in an Error instance.
- [Type Guards](TypeGuards.md)
  - [`isArray`](TypeGuards.md#isarray) - Check if a value is an array.
  - [`isBool`](TypeGuards.md#isbool) - Check if a value is a boolean.
  - [`isFn`](TypeGuards.md#isfn) - Check if a value is a function.
  - [`isNum`](TypeGuards.md#isnum) - Check if a value is a number.
  - [`isObj`](TypeGuards.md#isobj) - Check if a value is an object.
  - [`isStr`](TypeGuards.md#isstr) - Check if a value is a string.
  - [`isEmpty`](TypeGuards.md#isundefined) - Check if a value is undefined.
  - [`isSeidr`](TypeGuards.md#isseidr) - Check if a value is a [`Seidr`](Seidr.md#seidr-class) observable.
  - [`isDOMNode`](TypeGuards.md#isdomnode) - Check if a value is a DOM node.
  - [`isHTMLElement`](TypeGuards.md#ishtmlelement) - Check if a value is an HTMLElement.
  - [`isComponent`](TypeGuards.md#isseidrcomponent) - Check if a value is a [`SeidrComponent`](components.md#seidrcomponent-type).

## [SSR API](SSR.md) (`@fimbul-works/seidr/ssr`)
- [`renderToString()`](SSR.md#rendertostring) - Render a Seidr component to a string.
- [`hydrate()`](SSR.md#hydrate) - Hydrate a Seidr component.
- SSR Environment Utilities (`@fimbul-works/seidr`)
  - [`isClient()`](SSR.md#isclient) - Check if the code is running on the client.
  - [`inClient()`](SSR.md#inclient) - Run code only on the client.
  - [`isServer()`](SSR.md#isserver) - Check if the code is running on the server.
  - [`inServer()`](SSR.md#inserver) - Run code only on the server.

## [Testing API](testing.md) (`@fimbul-works/seidr/testing`)
- Utilities for testing Seidr components in both client and SSR modes.
- `describeDualMode`, `renderToHtml`, `expectHtmlToBe`, and more.

## [Build Plugins](build.md) (`@fimbul-works/seidr/build`)
- Specialized build-time transforms for optimizing Seidr applications.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md)
