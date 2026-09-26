<img src="../public/seidr-logo.svg" alt="Seidr logo" style="height:150px;margin-bottom:-2.5em;"/>

# API Reference

Seidr is organized into a lightweight core library and specialized sub-exports to keep bundle sizes minimal.

- **Core API** (`@fimbul-works/seidr`): Reactive state, components, lifecycle hooks, router, DOM utilities, and environment helpers.
- **HTML Elements** (`@fimbul-works/seidr/html`): Predefined element creators for standard HTML tags.
- **SSR API** (`@fimbul-works/seidr/ssr`): Server-side rendering, request context isolation, and hydration serializers.
- **Build Plugins** (`@fimbul-works/seidr/build`): Vite and Rolldown plugins for compile-time dead-code elimination.
- **Testing Utilities** (`@fimbul-works/seidr/testing`): Dual-mode (Client + SSR) test runners and HTML assertion helpers.

---

## [Application State](AppState.md) (`@fimbul-works/seidr`)
- [`getAppState()`](AppState.md#getappstate) — Retrieve the active application execution context.
- [`AppState`](AppState.md#appstate-interface) — Central execution context, component registry, and data store interface.
- [`AppState.defineDataStrategy()`](AppState.md#defining-a-data-strategy-definedatastrategy) — Register pluggable state capture and hydration strategies.

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
  - [`$text()`](DOM.md#text) — Create a DOM Text node.
  - [`$comment()`](DOM.md#comment) — Create a DOM Comment.
  - [`getDocument()`](DOM.md#getdocument) — Retrieve the active DOM Document instance.
  - [DOM Query Utilities](DOM.md#dom-query-utilities)
    - [`$getById()`](DOM.md#getbyid) — Get a DOM element by ID.
    - [`$query()`](DOM.md#query) — Query a single DOM element.
    - [`$queryAll()`](DOM.md#queryall) — Query multiple DOM elements.
- **[Predefined Element Creators](DOM.md#predefined-element-creators)** (`@fimbul-works/seidr/html`)
  - `$div`, `$span`, `$p`, `$h1`, `$button`, `$input`, `$ul`, `$li`, `$table`, and 100+ standard HTML tags.

## [Components & Lifecycle](components.md) (`@fimbul-works/seidr`)
- [`createComponent()`](components.md#createcomponent) — Define a component with automatic lifecycle tracking.
- [`mount()`](components.md#mount) — Mount a component to a DOM container.
- Lifecycle Hooks:
  - [`onMounted()`](components.md#onmounted) — Register a callback executed when a component or DOM node is mounted.
  - [`onUnmounted()`](components.md#onunmounted) — Register a cleanup callback executed when a component or DOM node is removed.
  - [`getComponentScope()`](components.md#getcomponentscope) — Retrieve the active component instance.
  - [`watchMutations()`](components.md#watchmutations) — Enable DOM mutation tracking for node lifecycle hooks.
- [`wrapComponent()`](components.md#wrapcomponent) — Normalize a function or component factory.
- [`SeidrComponent`](components.md#seidrcomponent-interface) — Component instance interface.
- [Built-In Components & Control Flow](components.md#built-in-components):
  - [`Show()`](Show.md#show) — Conditionally render children or fallback based on a reactive condition Value.
  - [`List()`](List.md#list) — Efficiently render and reconcile a keyed list from a reactive array.
  - [`Switch()`](Switch.md#switch) — Switch between components based on a reactive discriminant value.
  - [`Safe()`](Safe.md#safe) — Error boundary component providing fallback UI on initialization failure.
  - [`Suspense()`](Suspense.md#suspense) — Asynchronous boundary managing Promise resolution and loading states.
  - [`lazy()`](Lazy.md#lazy) — Asynchronous code-splitting utility for dynamically imported component modules.

## [Router API](Router.md) (`@fimbul-works/seidr`)
- [`Router()`](Router.md#router) — Declarative router component supporting nested routing and SSR hydration.
- [`Link()`](Router.md#link) — Declarative navigation link component preventing full reloads.
- Hooks:
  - [`useNavigate()`](Router.md#usenavigate) — Programmatic navigation hook.
  - [`usePathname()`](Router.md#usepathname) — Reactive current pathname hook.
  - [`useRouteParams()`](Router.md#userouteparams--userouterparams) / `useRouterParams()` — Reactive route parameters hook.
  - [`useSearchParams()`](Router.md#usesearchparams) — Reactive URL search query parameters hook.
- Drivers & Controllers:
  - [`browserRouter()`](Router.md#browserrouter) — Singleton browser history driver.
  - [`hashRouter()`](Router.md#hashrouter) — Singleton URL hash driver.
  - [`history()`](Router.md#history) — Low-level history controller (`push`, `replace`, `go`).
  - [`initRouter()`](Router.md#initrouter) — Router initialization with SSR hydration strategy.
- Utilities:
  - [`matchRoute()`](Router.md#matchroute) — Match a path against a list of route definitions.
  - [`parseRouteParams()`](Router.md#parserouteparams) — Parse parameters from a pattern and path.
  - [`addPopstateListener()`](Router.md#addpopstatelistener--removepopstatelistener), [`removePopstateListener()`](Router.md#addpopstatelistener--removepopstatelistener) — Listen to browser navigation events.

## [Utilities & Type Guards](type-guards.md) (`@fimbul-works/seidr`)
- Utilities (`docs/utils.md`):
  - [`wrapError()`](utils.md#wraperror) — Wrap an unknown thrown value in an `Error` or `SeidrError`.
  - [`random()`](utils.md#random) — Deterministic pseudo-random number generator (SplitMix32) preserved across SSR.
  - [`SeidrError`](utils.md#seidrerror) — Standard Seidr runtime assertion error class.
- [Type Guards](type-guards.md):
  - Primitives: [`isArray`](type-guards.md#isarray), [`isBool`](type-guards.md#isbool), [`isFn`](type-guards.md#isfn), [`isNum`](type-guards.md#isnum), [`isObj`](type-guards.md#isobj), [`isStr`](type-guards.md#isstr), [`isNullish`](type-guards.md#isnullish).
  - Reactive State: [`isValue`](type-guards.md#isvalue).
  - Components: [`isComponent`](type-guards.md#iscomponent), [`isComponentFactory`](type-guards.md#iscomponentfactory), [`isLazyComponent`](type-guards.md#islazycomponent).
  - DOM: [`isDOMNode`](type-guards.md#isdomnode), [`isHTMLElement`](type-guards.md#ishtmlelement), [`isComment`](type-guards.md#iscomment), [`isTextNode`](type-guards.md#istextnode).

## [SSR API](SSR.md) (`@fimbul-works/seidr/ssr` & `@fimbul-works/seidr`)
- [`renderToString()`](SSR.md#rendertostring) — Render a component tree to HTML string and hydration payload with optional `initialAppState`.
- [`hydrate()`](SSR.md#hydrate) — Hydrate server-rendered HTML markup on the client (accepts object or serialized string).
- [`isHydrating()`](SSR.md#ishydrating) — Check if client-side hydration is currently active.
- Serialization:
- [`setHydrationSerializer()`](SSR.md#custom-serializers-eg-superjson-devalue), [`getHydrationSerializer()`](SSR.md#gethydrationserializer) — Pluggable hydration serializers.
- Environment Utilities (`@fimbul-works/seidr`):
  - [`isClient()`](SSR.md#isclient) — Check if running in the browser environment.
  - [`inClient()`](SSR.md#inclient) — Run code only on the client.
  - [`isServer()`](SSR.md#isserver) — Check if running in the server (SSR) environment.
  - [`inServer()`](SSR.md#inserver) — Run code only on the server (awaits async Promises during SSR).

## [Build Plugins](build.md) (`@fimbul-works/seidr/build`)
- [`seidrVitePlugin()`](build.md#vite-plugin-seidrviteplugin) — Official Vite plugin for compile-time branch pruning and dead-code elimination.
- [`seidrBundlePlugin()`](build.md#rolldown-bundle-plugin-seidrbundleplugin) — Official Rolldown plugin for component bundling.

## [Testing Utilities](testing.md) (`@fimbul-works/seidr/testing`)
- Dual-Mode Runners: [`describeDualMode()`](testing.md#describedualmode), [`itHasParity()`](testing.md#ithasparity).
- Environment Controls: `enableClientMode()`, `enableSSRMode()`, `setupAppState()`, `mockLocation()`.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md)
