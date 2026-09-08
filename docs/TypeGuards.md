# Type Guards

Type guard utilities provide runtime validation and TypeScript type narrowing for primitives, DOM nodes, reactive Values, and Seidr components.

---

## Primitive Type Guards

### `isArray()`

Checks if a value is an Array.

```typescript
import { isArray } from '@fimbul-works/seidr';

console.log(isArray([]));       // true
console.log(isArray([1, 2, 3])); // true
console.log(isArray({}));       // false
```

---

### `isBool()`

Checks if a value is a boolean primitive.

```typescript
import { isBool } from '@fimbul-works/seidr';

console.log(isBool(true));  // true
console.log(isBool(false)); // true
console.log(isBool(1));     // false
```

---

### `isFn()`

Checks if a value is a callable function or constructor.

```typescript
import { isFn } from '@fimbul-works/seidr';

console.log(isFn(() => {}));     // true
console.log(isFn(async () => {})); // true
console.log(isFn(class {}));     // true
console.log(isFn({}));           // false
```

---

### `isNum()`

Checks if a value is a number primitive.

```typescript
import { isNum } from '@fimbul-works/seidr';

console.log(isNum(42));       // true
console.log(isNum(-3.14));    // true
console.log(isNum(NaN));      // true
console.log(isNum('42'));     // false
```

---

### `isObj()`

Checks if a value is a non-null, non-array object.

```typescript
import { isObj } from '@fimbul-works/seidr';

console.log(isObj({}));       // true
console.log(isObj({ a: 1 })); // true
console.log(isObj([]));       // false
console.log(isObj(null));     // false
console.log(isObj(() => {})); // false
```

---

### `isStr()`

Checks if a value is a string primitive.

```typescript
import { isStr } from '@fimbul-works/seidr';

console.log(isStr('hello')); // true
console.log(isStr(''));      // true
console.log(isStr(123));     // false
```

---

### `isNullish()`

Checks if a value is `null` or `undefined`.

```typescript
import { isNullish } from '@fimbul-works/seidr';

console.log(isNullish(null));      // true
console.log(isNullish(undefined)); // true
console.log(isNullish(0));         // false
console.log(isNullish(''));        // false
console.log(isNullish(false));     // false
```

---

## Reactive State Type Guards

### `isValue()`

Checks if a value is a Seidr reactive [`Value`](Value.md) observable.

```typescript
import { createValue, isValue } from '@fimbul-works/seidr';

const count = createValue(0);
const derived = count.as((n) => n * 2);

console.log(isValue(count));   // true
console.log(isValue(derived)); // true
console.log(isValue(42));      // false
console.log(isValue(() => {})); // false
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
