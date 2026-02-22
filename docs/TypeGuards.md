# Type Guards

Utility functions to check types at runtime with proper TypeScript type narrowing.

## Primitive Types

### isArray()

Check if a value is an array.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `Array`

```typescript
import { isArray } from '@fimbul-works/seidr';

console.log(isArray([]));       // true
console.log(isArray([1, 2, 3])); // true
console.log(isArray({}));       // false
console.log(isArray(123));      // false
```

### isBool()

Check if a value is a boolean primitive.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `boolean`

**Note:** Returns `false` for `Boolean` objects (use primitive booleans)

```typescript
import { isBool } from '@fimbul-works/seidr';

console.log(isBool(true));  // true
console.log(isBool(false)); // true
console.log(isBool(1));     // false
console.log(isBool('true')); // false
```

### isFn()

Check if a value is a function.

**Generic Type:** `T` extends `Function` - The type of value being checked

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `Function`

```typescript
import { isFn } from '@fimbul-works/seidr';

const fn = () => {};
const asyncFn = async () => {};

console.log(isFn(fn));       // true
console.log(isFn(asyncFn));  // true
console.log(isFn(class {})); // true (class constructors)
console.log(isFn({}));       // false
```

### isNum()

Check if a value is a number.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `number`

**Note:** Returns `false` for `Number` objects (use primitive numbers)

```typescript
import { isNum } from '@fimbul-works/seidr';

console.log(isNum(42));       // true
console.log(isNum(-3.14));    // true
console.log(isNum(Infinity)); // true
console.log(isNum(NaN));      // true (NaN is number type)
console.log(isNum('42'));     // false
```

### isObj()

Check if a value is a plain object (not array, not null, not function).

**Generic Type:** `T` extends `object` - The type of value being checked

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `T`

```typescript
import { isObj } from '@fimbul-works/seidr';

console.log(isObj({}));           // true
console.log(isObj({ a: 1 }));     // true
console.log(isObj([]));           // false (arrays)
console.log(isObj(null));         // false (null)
console.log(isObj(() => {}));     // false (functions)
```

### isUndefined()

Check if a value is `undefined`.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `undefined`

```typescript
import { isUndefined } from '@fimbul-works/seidr';

let maybeUndefined: string | undefined;

maybeUndefined = undefined;
if (isUndefined(maybeUndefined)) {
  // TypeScript knows: maybeUndefined is undefined
}

maybeUndefined = 'defined';
console.log(isUndefined(maybeUndefined)); // false
```

## isStr()

Check if a value is a string.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `string`

**Note:** Returns `false` for `String` objects (use primitive strings)

```typescript
import { isStr } from '@fimbul-works/seidr';

console.log(isStr('hello'));  // true
console.log(isStr(''));       // true
console.log(isStr('123'));    // true
console.log(isStr(123));      // false
```

## Seidr Types

### isSeidr()

Check if a value is a [Seidr](Seidr.md#seidr-class) instance.

**Generic Type:** `T` - The type of value being stored

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `Seidr<T>`

```typescript
import { isSeidr, Seidr } from '@fimbul-works/seidr';

const count = new Seidr(0);
const derived = count.as(n => n * 2);
const plainObj = { value: 0 };

console.log(isSeidr(count));    // true
console.log(isSeidr(derived));  // true
console.log(isSeidr(plainObj)); // false
console.log(isSeidr(42));       // false
```

## DOM Types

### isDOMNode()

Check if a value is a `Node` or [`ServerNode`](SSR.md) instance.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `Node`

```typescript
import { isDOMNode } from '@fimbul-works/seidr';

const el = document.createElement('div');
const plainObj = { value: 0 };

console.log(isDOMNode(el));       // true
console.log(isDOMNode(plainObj)); // false
console.log(isDOMNode(42));       // false
```

### isHTMLElement()

Check if a value is a `HTMLElement` or [`ServerHTMLElement`](SSR.md) instance.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `HTMLElement`

```typescript
import { isHTMLElement, $div } from '@fimbul-works/seidr';

const el = document.createElement('div');
const seidrEl = $div();
const plainObj = { value: 0 };

console.log(isHTMLElement(el));       // true
console.log(isHTMLElement(seidrEl));  // true
console.log(isHTMLElement(plainObj)); // false
console.log(isHTMLElement(42));       // false
```

### isSeidrComponent()

Check if a value is a [`SeidrComponent`](Components.md#seidrcomponent-type) object.

**Parameters:**
- `value` - Value to test

**Type Narrowing:** Narrows `unknown` to `SeidrComponent`

```typescript
import { isSeidrComponent, component, $div } from '@fimbul-works/seidr';

const factory = component(() => $div());
const comp = factory();
const plainObj = { value: 0 };

console.log(isSeidrComponent(comp));     // true
console.log(isSeidrComponent(plainObj)); // false
console.log(isSeidrComponent(42));       // false
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
