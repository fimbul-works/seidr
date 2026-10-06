# Seidr API Cheatsheet

Ground-truth API reference for Seidr. Consult this document before writing code to avoid hallucinating non-existent functions or incorrect signatures.

---

## 1. Reactive State (`@fimbul-works/seidr`)

### `createValue<T>(initialValue: T, options?: ValueOptions): Value<T>`
Creates a callable reactive signal.
- **Reading**: `val()`
- **Writing**: `val(newVal)` or `val((prev) => nextVal)`
- **Options**:
  - `id?: string` — Singleton ID inside current `AppState`; participates in SSR hydration.
  - `isEqual?: (a: any, b: any) => boolean` — Defaults to `Object.is`. Pass `() => false` for pure event signal behavior.
  - `hydrate?: boolean` — Defaults to `true`.

### Methods on `Value<T>`:
- `.as<D>(transformFn: (val: T) => D, options?: ValueOptions): Value<D>`
  Derived value from a single source.
- `.watch(handler: (newVal: T, prevVal?: T) => CleanupFunction | void): CleanupFunction`
  Runs callback on subsequent updates. Optional teardown returned from handler runs before next update or on unwatch. Always pass the returned cleanup function to `onUnmounted()` hook!
- `.bind(handler: (val: T, prevVal?: T) => CleanupFunction | void): CleanupFunction`
  Runs callback **immediately** with current value, and on subsequent updates. Always pass the returned cleanup function to `onUnmounted()` hook!
- `.cleanup(fn: CleanupFunction): void`
  Registers a teardown callback executed when `.destroy()` is called.
- `.destroy(): void`
  Disposes of all watchers, bindings, and active cleanups.

### Companion Observable Utilities:
- `mergeValues<T>(computeFn: () => T, options?: ValueOptions & { parents?: Value<any>[] }): Value<T>`
  Derived value across multiple observables.
  > **Note**: Pass `{ parents: [...] }` explicitly if `computeFn` has conditional branches!
- `wrapValue<T>(val: T | Value<T>, options?: ValueOptions): Value<T>`
  Returns existing `Value` or wraps plain `T` in a new `Value`.
- `unwrapValue<T>(val: T | Value<T>): T`
  Safely unwraps `Value<T>` and returns plain `T`.
- `withStorage<T>(key: string, value: Value<T>, storage?: Storage, onError?: ...): Value<T>`
  Persists observable to `localStorage` (default) or `sessionStorage`.
- `wrapValueObject<T, K extends string = "value">(val: Value<T>, key?: K): { [P in K]: T }`
  OOP getter/setter accessor bridge for animation/tweening libraries (e.g., Flaedi).

---

## 2. DOM Elements & Construction

### Main Element Creators:
- `$(tag: string, children?): HTMLElement`
- `$(tag: string, props?: SeidrElementProps | null, children?): HTMLElement`
- `$factory(tag: string, defaultProps?: SeidrElementProps)`
  Returns a pre-configured element factory.
- **HTML Helpers (`@fimbul-works/seidr/html`)**:
  `$div`, `$span`, `$button`, `$input`, `$form`, `$p`, `$h1`–`$h6`, `$ul`, `$li`, `$a`, `$canvas`, etc.

### Forms & Input Binding:
- `bindInput(value: Value<string>): { value: Value<string>, oninput: (e: Event) => void }`
  Two-way binding helper for form text inputs:
  ```typescript
  $input({ ...bindInput(textValue) });
  ```

### Element References (`useRef`):
- `useRef<T extends Element = Element>(): Ref<T>`
  Returns a `Ref<T>` (a decorated `Value<T | null>` with `hydrate: false`).
  Pass to `{ ref: myRef }`. Safely inspect inside `onMounted()`.

### DOM Query Helpers:
- `getDocument(): Document` — Returns `document` in browser, or JSDOM instance in SSR.
- `$getById<T extends HTMLElement>(id: string): T | null`
- `$query<T extends HTMLElement>(selector: string, root?: Element): T | null`
- `$queryAll<T extends HTMLElement>(selector: string, root?: Element): T[]`

---

## 3. Components & Lifecycle

### Component Definition:
- `createComponent<P>(factory: (props: P) => SeidrChild | SeidrChild[], name?: string): SeidrComponentFactory<P>`
  Defines a component with automatic scope tracking and deterministic SSR ID namespacing.
- `mount(componentOrFactory, container: HTMLElement): CleanupFunction`
  Mounts component tree and returns unmount function.
- `getComponentScope(): SeidrComponent | null`
  Returns active component scope during execution.

### Lifecycle Hooks:
- `onMounted(callback: (container: HTMLElement) => void, el?: Node): void`
  Runs when component (or target element) is attached to DOM.
- `onUnmounted(callback: () => void, el?: Node): void`
  Runs when component (or target element) is detached and destroyed.

---

## 4. Built-in Control Flow Components

- `Show(condition: Value<any>, whenTrue: () => SeidrChild, whenFalse?: () => SeidrChild): Value<SeidrChild>`
  Boolean conditional rendering.
- `Switch<T extends string | number>(value: Value<T>, branches: Record<T, () => SeidrChild>, fallback?: () => SeidrChild): Value<SeidrChild>`
  Discriminant multi-branch matching.
- `List<T, K extends string | number>(observable: Value<T[]>, getKey: (item: T) => K, factory: (itemValue: Value<T>, key: K) => SeidrChild, name?: string): SeidrComponent`
  Keyed dynamic list with fine-grained per-item reactivity.
- `Suspense<T>(promise: Promise<T>, component: SeidrComponentFactory<{ state: Value<SuspenseStatus>, value: Value<T | null>, error: Value<Error | null> }>): SeidrComponent`
  Promise resolution boundary.
- `Safe(component: SeidrComponentFactory, fallback?: SeidrComponentFactory): SeidrComponent`
  Error boundary.
- `lazy<P>(loader: () => Promise<{ default: SeidrComponentFactory<P> }>): SeidrComponentFactory<P>`
  Dynamic import code-splitting.

---

## 5. Router API (`@fimbul-works/seidr` / `@fimbul-works/seidr/router`)

- `Router(options: RouterOptions): SeidrComponent`
- `Link(props: LinkProps, children?): HTMLElement`
- `interceptLinks(container?: HTMLElement): void`
- Hooks:
  - `useNavigate(): (to: string, options?: NavigateOptions) => void`
  - `usePathname(): Value<string>`
  - `useRouteParams(): Value<Record<string, string>>`
  - `useSearchParams(): Value<URLSearchParams>`

---

## 6. Environment & SSR Primitives

- `isServer(): boolean` — `true` in Node/SSR.
- `isClient(): boolean` — `true` in browser.
- `inServer<T>(fn: () => T): T | undefined` — Executes only on server.
- `inClient<T>(fn: () => T): T | undefined` — Executes only on client.
- `getAppState(): AppState` — Accesses active application state container.
