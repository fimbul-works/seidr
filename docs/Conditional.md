## Show()

Conditionally renders a component based on a boolean observable.

**Parameters:**
- `condition` - [`Seidr<boolean>`](Seidr.md#seidr-class) observable
- `factory` - Function that returns a [`SeidrComponent`](components.md#seidrcomponent-type) or DOM Node

**Returns:** A [`SeidrComponent`](components.md#seidrcomponent-type) rooted in a Comment node.

**Example:**
```typescript
import { Show, Seidr, $div, mount } from '@fimbul-works/seidr';

const isVisible = new Seidr(false);
const MyComp = () => $div({ textContent: 'I am here' });

const View = () => {
  return $div({ className: 'container' }, [
    Show(isVisible, MyComp)
  ]);
};

mount(View, document.body);

// Behavior:
isVisible.value = true;
// container contains: <div>I am here</div><!--seidr-show:...-->
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
