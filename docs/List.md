## List()

Renders a dynamic list of components from an observable array with optimized key-based diffing.

**Parameters:**
- `observable` - [`Seidr<T[]>`](Seidr.md#seidr-class) array observable
- `getKey` - Function to extract unique key: `(item: T) => string | number`
- `factory` - Function to create components: `(item: Seidr<T>) => SeidrNode`

**Returns:** A [`SeidrComponent`](components.md#seidrcomponent-type) rooted in a Comment node.

**Example:**
```typescript
import { List, Seidr, mount } from '@fimbul-works/seidr';
import { $li, $ul } from '@fimbul-works/seidr/html';

const items = new Seidr([{ id: 1, text: 'Item 1' }]);
const Item = (text: string | Seidr<string>) => $li({ textContent: text });

const ListPage = () => {
  return $ul({}, [
    List(items, i => i.id, i => Item(i.as(v => v.text)))
  ]);
};

mount(ListPage, document.body);
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
