<img src="../public/seidr-logo.svg" alt="Seidr logo" style="height:150px;margin-bottom:-2.5em;"/>

# Show Component

The `Show` function conditionally renders content or components based on a reactive condition [`Value`](Value.md).

---

## `Show()`

**Parameters:**
- `condition: Value<any>` — Reactive condition observable.
- `whenTrue: () => SeidrChild` — Factory function returning the elements or component to display when `condition` is truthy.
- `whenFalse?: () => SeidrChild` — Optional fallback factory function returning elements to display when `condition` is falsy.

**Returns:** `Value<SeidrChild>` — A reactive derived `Value` representing the currently active branch.

```typescript
import { Show, createValue, mount } from '@fimbul-works/seidr';
import { $button, $div, $p } from '@fimbul-works/seidr/html';

const App = () => {
  const isVisible = createValue(false);
  
  return $div({ className: 'container' }, [
    $button({
      textContent: isVisible.as((v) => (v ? 'Hide Details' : 'Show Details')),
      onclick: () => isVisible((v) => !v)
    }),
    Show(isVisible, () => $p({ textContent: '🎉 This is a conditionally rendered message!' })
  ]);
};

mount(App, document.body);
```

### Fallback Content with `whenFalse`

You can supply an optional third callback to render fallback content when `condition` is falsy:

```typescript
import { Show, createValue } from '@fimbul-works/seidr';
import { $p } from '@fimbul-works/seidr/html';

const isLoggedIn = createValue(false);

const UserGreeting = () =>
  Show(
    isLoggedIn,
    () => $p({ textContent: 'Welcome back, authenticated user!' }),
    () => $p({ textContent: 'Please log in to continue.' })
  );
```

### Behavior & Semantics
- **Derived Value Return:** `Show` returns a reactive `Value<SeidrChild>` (implemented via `condition.as(...)`). It can be passed directly as a child inside any Seidr element creator (like `$div`, `$section`), and the DOM automatically updates when the condition changes.
- **Truthiness:** Evaluates the JavaScript truthiness of `condition()`. Any truthy value displays `whenTrue()`.
- **Falsy Handling:** When falsy, renders `whenFalse()` if provided, or `null` (rendering nothing).
- **Automatic Lifecycle Cleanup:** When components are conditionally unmounted, all registered `onUnmounted` cleanup hooks are executed.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
