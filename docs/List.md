# List Component

The `List` component efficiently renders and reconciles a dynamic collection of items from an array [`Value`](Value.md). It uses key-based diffing to minimize DOM operations, reordering and updating only the elements that change.

---

## `List()`

**Generic Types:**
- `T` — The type of item in the array.
- `K extends string | number` — The type of unique key.

**Parameters:**
- `observable: Value<T[]>` — Reactive array `Value`.
- `getKey: (item: T) => K` — Extractor function returning a unique string or number key for each item.
- `factory: (itemValue: Value<T>, key: K) => SeidrChild` — Render function receiving a reactive `itemValue` (`Value<T>`) and its unique key.
- `name?: string` (default: `"List"`) — Optional component name.

**Returns:** [`SeidrComponent`](components.md#seidrcomponent-type)

```typescript
import { List, createValue, mount } from '@fimbul-works/seidr';
import { $button, $div, $li, $ul } from '@fimbul-works/seidr/html';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const todos = createValue<Todo[]>([
  { id: 1, text: 'Learn Seidr', completed: true },
  { id: 2, text: 'Build an application', completed: false }
]);

const TodoList = () => {
  return $div({ className: 'todo-container' }, [
    $ul({}, [
      List<Todo, number>(
        todos,
        (item) => item.id,
        (itemValue, key) => {
          // itemValue is a reactive Value<Todo> for fine-grained updates!
          return $li({
            className: itemValue.as((t) => (t.completed ? 'completed' : 'pending')),
            textContent: itemValue.as((t) => t.text),
            onclick: () => itemValue((prev) => ({ ...prev, completed: !prev.completed }))
          });
        }
      )
    ]),
    $button({
      textContent: 'Add Todo',
      onclick: () => {
        const nextId = Date.now();
        todos((list) => [...list, { id: nextId, text: `Todo #${list.length + 1}`, completed: false }]);
      }
    })
  ]);
};

mount(TodoList, document.body);
```

### Key Features
- **Fine-Grained Item Reactivity:** The item factory receives `itemValue: Value<T>`. When individual items are updated in place, only that item's DOM bindings update without triggering a full list re-render.
- **Key-Based Reordering:** Items are moved, inserted, or removed efficiently using their unique keys with minimal DOM manipulations.
- **SSR Compatible:** Fully serializes and hydrates list structures deterministically during SSR.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
