## Switch()

Switches between different components based on an observable value.

**Parameters:**
- `observable` - [`Seidr<T>`](../seidr/README.md#seidr-class) observable
- `cases` - Object or Map: `{ [key: string]: () => SeidrComponent }`
- `defaultCase?` - Optional fallback factory function

**Returns:** A [`SeidrComponent`](../component/README.md#seidrcomponent-type) rooted in a Comment node.

**Example:**
```typescript
import { Switch, Seidr, $div, mount } from '@fimbul-works/seidr';

const mode = new Seidr('A');

const View = () => {
  return $div({}, [
    Switch(mode, {
      A: () => $div({ textContent: 'View A' }),
      B: () => $div({ textContent: 'View B' })
    }, () => $div({ textContent: 'Default' }))
  ]);
};

mount(View, document.body);
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
