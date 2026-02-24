## List()

Renders a dynamic list of components from an observable array with optimized key-based diffing.

**Parameters:**
- `observable` - [`Seidr<T[]>`](Seidr.md#seidr-class) array observable
- `getKey` - Function to extract unique key: `(item: T) => string | number`
- `factory` - Function to create components: `(item: T) => SeidrComponent`

**Returns:** A [`SeidrComponent`](components.md#seidrcomponent-type) rooted in a Comment node.

**Example:**
```typescript
import { List, Seidr, $li, $ul, uid, mount } from '@fimbul-works/seidr';

const items = new Seidr([{ id: uid(), text: 'Item 1' }]);
const Item = ({ text }) => $li({ textContent: text });

const ListPage = () => {
  return $ul({}, [
    List(items, i => i.id, i => Item(i))
  ]);
};

mount(ListPage, document.body);
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
