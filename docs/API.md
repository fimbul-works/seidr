# Seidr API Reference

## [Reactive State](Seidr.md)
  - [`Seidr`](Seidr.md#seidr-class) - The core reactive state class.
  - [`wrapSeidr()`](Seidr.md#wrapseidr) - Wrap a value in a Seidr observable.
  - [`unwrapSeidr()`](Seidr.md#unwrapseidr) - Unwrap a Seidr observable to its value.
  - [Global State Management](state.md)
    - [`useState()`](state.md#usestate) - A hook for managing shared application state as a global Seidr singleton.
    - [`useStorage()`](state.md#usestorage) - Helper function to use local storage or session Storage as a reactive state.
    - [`createStateKey()`](state.md#createstatekey) - Create a unique key for a global state that captures the type of the state.
## [DOM Elements](DOM.md)
  - [`$()`](DOM.md#--create-dom-elements) - Create a DOM element.
  - [`$factory()`](DOM.md#factory) - Create a custom element creator.
  - [Predefined Element Creators](DOM.md#predefined-element-creators) - Predefined element creators for common DOM elements.
  - [`SeidrElement`](DOM.md#seidrelement-type) - The type of an augmented HTMLElement.
  - [DOM Query Utilities](DOM.md#dom-query-utilities)
    - [`$getById()`](DOM.md#getbyid) - Get a DOM element by ID.
    - [`$query()`](DOM.md#query) - Query a single DOM element.
    - [`$queryAll()`](DOM.md#queryall) - Query multiple DOM elements.
## [Components](components.md)
  - [`component()`](components.md#component) - Create a component.
  - [`mount()`](components.md#mount) - Mount a component to the DOM.
  - [`useScope()`](components.md#usescope) - Get the scope of a component.
  - [`wrapComponent()`](components.md#wrapcomponent) - Convert a function into a component.
  - [`SeidrComponent`](components.md#seidrcomponent-type) - The type of a Seidr component.
  - [Built-In Components](components.md#built-in-components)
    - [`Conditional()`](Conditional.md#conditional) - A component that conditionally renders its children.
    - [`List()`](List.md#list) - A component that renders a list of items.
    - [`Switch()`](Switch.md#switch) - A component that renders a single child based on a condition.
    - [`Safe()`](Safe.md#safe) - A component that safely renders its children.
    - [`Suspense()`](Suspense.md#suspense) - A component that suspends rendering until a promise resolves.
## [Utilities](utils.md)
- [`bindInput()`](utils.md#bindinput) - Bind an input element to a Seidr observable.
- [`elementClassToggle()`](utils.md#elementclasstoggle) - Toggle a class on an element.
- [`cn()`](utils.md#cn) - Merge class names.
- [`debounce()`](utils.md#debounce) - Debounce a function.
- [`uid()`](utils.md#uid) - Generate a unique ID.
- [`uidTime()`](utils.md#uidtime) - Generate a unique ID based on the current time.
- [`random()`](utils.md#random) - Generate a random number.
- [Type Guards](TypeGuards.md)
  - [`isArray`](TypeGuards.md#isarray) - Check if a value is an array.
  - [`isBool`](TypeGuards.md#isbool) - Check if a value is a boolean.
  - [`isFn`](TypeGuards.md#isfn) - Check if a value is a function.
  - [`isNum`](TypeGuards.md#isnum) - Check if a value is a number.
  - [`isObj`](TypeGuards.md#isobj) - Check if a value is an object.
  - [`isStr`](TypeGuards.md#isstr) - Check if a value is a string.
  - [`isUndefined`](TypeGuards.md#isundefined) - Check if a value is undefined.
  - [`isSeidr`](TypeGuards.md#isseidr) - Check if a value is a [`Seidr`](Seidr.md#seidr-class) observable.
  - [`isDOMNode`](TypeGuards.md#isdomnode) - Check if a value is a DOM node.
  - [`isHTMLElement`](TypeGuards.md#ishtmlelement) - Check if a value is an HTMLElement.
  - [`isSeidrElement`](TypeGuards.md#isseidrelement) - Check if a value is a [`SeidrElement`](DOM.md#seidrelement-type).
  - [`isSeidrComponent`](TypeGuards.md#isseidrcomponent) - Check if a value is a [`SeidrComponent`](Components.md#seidrcomponent-type).
## [SSR API](SSR.md)
- [Key Features](SSR.md#key-features)
- [Quick Start](SSR.md#quick-start)
- [Architecture](SSR.md#architecture-runtime-graph-reconstruction)
- [`renderToString()`](SSR.md#rendertostring) - Render a Seidr component to a string.
- [`hydrate()`](SSR.md#hydrate) - Hydrate a Seidr component.
- SSR Environment Utilities
  - [`isClient()`](SSR.md#isclient) - Check if the code is running on the client.
  - [`inClient()`](SSR.md#inclient) - Run code only on the client.
  - [`isServer()`](SSR.md#isserver) - Check if the code is running on the server.
  - [`inServer()`](SSR.md#inserver) - Run code only on the server.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md)
