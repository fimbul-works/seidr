# Show Component

The `Show` component conditionally mounts and unmounts child elements or components based on a reactive boolean [`Value`](Value.md).

---

## `Show()`

**Parameters:**
- `condition: Value<boolean>` — Boolean `Value` observable controlling visibility.
- `factory: () => SeidrChild` — Factory function returning the elements or component to display when `condition` is `true`.
- `name?: string` (default: `"Show"`) — Optional component name.

**Returns:** [`SeidrComponent`](components.md#seidrcomponent-type)

```typescript
import { Show, createValue, mount } from '@fimbul-works/seidr';
import { $button, $div, $p } from '@fimbul-works/seidr/html';

const isVisible = createValue(false);

const SecretMessage = () => $p({ textContent: '🎉 This is a conditionally rendered message!' });

const App = () => {
  return $div({ className: 'container' }, [
    $button({
      textContent: isVisible.as((v) => (v ? 'Hide Details' : 'Show Details')),
      onclick: () => isVisible((v) => !v)
    }),
    Show(isVisible, SecretMessage)
  ]);
};

mount(App, document.body);
```

### Behavior
- When `condition()` evaluates to `true`, the `factory` function is invoked, and the resulting nodes are inserted into the DOM.
- When `condition()` evaluates to `false`, the rendered nodes and child components are unmounted and removed from the DOM, triggering any registered `onUnmounted` cleanup hooks.
- Node positions are anchored using lightweight marker comments.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
