![@fimbul-works/seidr](../public/seidr-logo.svg)

# Type Guards

Type guard utilities provide runtime validation and TypeScript type narrowing for DOM nodes, reactive Values, and Seidr components.

For primitive type guards, Seidr uses [`@fimbul-works/hvat`](https://www.npmjs.com/package/@fimbul-works/hvat).

---

## Reactive State Type Guards

### `isValue()`

Checks if a value is a Seidr reactive [`Value`](Value.md) observable.

```typescript
import { createValue, isValue } from '@fimbul-works/seidr';

const count = createValue(0);
const derived = count.as((n) => n * 2);

console.log(isValue(count));    // true
console.log(isValue(derived));  // true
console.log(isValue(42));       // false
console.log(isValue(() => {})); // false
```

---

### `isRef()`

Checks if a value is a Seidr [`Ref`](DOM.md#element-references-useref) element reference observable created via `createRef()`.

```typescript
import { isRef, createRef } from '@fimbul-works/seidr';

const ref = createRef<HTMLCanvasElement>();

console.log(isRef(ref));    // true
console.log(isRef(null));   // false
console.log(isRef({}));     // false
```

---

## Component Type Guards

### `isComponent()`

Checks if an object is an instantiated [`SeidrComponent`](components.md#seidrcomponent-type).

```typescript
import { createComponent, isComponent } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const CardFactory = createComponent(() => $div(), 'Card');
const cardInstance = CardFactory();

console.log(isComponent(cardInstance)); // true
console.log(isComponent(CardFactory));  // false
console.log(isComponent($div()));       // false
```

---

### `isComponentFactory()`

Checks if a function is a wrapped `SeidrComponentFactory` created via `createComponent()`.

```typescript
import { createComponent, isComponentFactory } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const MyComp = createComponent(() => $div(), 'MyComp');
const PlainFn = () => $div();

console.log(isComponentFactory(MyComp));  // true
console.log(isComponentFactory(PlainFn)); // false
```

---

### `isLazyComponent()`

Checks if a value is a lazy component factory created via `lazy()`.

```typescript
import { createComponent, lazy, isLazyComponent } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const LazyModal = lazy(() => import('./Modal.js'));
const NormalComp = createComponent(() => $div(), 'NormalComp');

console.log(isLazyComponent(LazyModal));  // true
console.log(isLazyComponent(NormalComp)); // false
```

---


## DOM Type Guards

### `isDOMNode()`

Checks if a value is a DOM `Node` or server-side SSR `ServerNode`.

```typescript
import { isDOMNode } from '@fimbul-works/seidr';

const element = document.createElement('div');
const text = document.createTextNode('Hello');

console.log(isDOMNode(element)); // true
console.log(isDOMNode(text));    // true
console.log(isDOMNode({}));      // false
```

---

### `isHTMLElement()`

Checks if a value is an `HTMLElement` or server-side SSR `ServerHTMLElement`.

```typescript
import { isHTMLElement } from '@fimbul-works/seidr';
import { $div } from '@fimbul-works/seidr/html';

const el = document.createElement('div');
const customEl = $div();
const text = document.createTextNode('Hello');

console.log(isHTMLElement(el));       // true
console.log(isHTMLElement(customEl)); // true
console.log(isHTMLElement(text));     // false
```

---

### `isComment()`

Checks if a value is a DOM `Comment` node.

```typescript
import { isComment } from '@fimbul-works/seidr';

const comment = document.createComment('marker');
console.log(isComment(comment)); // true
```

---

### `isTextNode()`

Checks if a value is a DOM `Text` node.

```typescript
import { isTextNode } from '@fimbul-works/seidr';

const text = document.createTextNode('Hello');
console.log(isTextNode(text)); // true
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
