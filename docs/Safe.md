# Safe Component

The `Safe` component acts as an error boundary, catching synchronous initialization errors thrown within a component subtree and displaying a fallback UI instead of crashing the application.

---

## `Safe()`

**Parameters:**
- `factory: () => SeidrChild` — Function that creates and returns the protected component or element tree.
- `errorBoundary: (error: Error) => SeidrChild` — Error handler function that receives the caught error and returns fallback UI.
- `name?: string` (default: `"Safe"`) — Optional name for the component boundary.

**Returns:** [`SeidrComponent`](components.md#seidrcomponent-type)

```typescript
import { Safe, onUnmounted, mount, SeidrError } from '@fimbul-works/seidr';
import { $div, $h2, $p } from '@fimbul-works/seidr/html';

const DangerousWidget = () => {
  onUnmounted(() => console.log('Cleaning up dangerous widget'));

  // Code that might fail (e.g., malformed JSON or corrupted storage)
  const rawData = '{ invalid json }';
  const parsed = JSON.parse(rawData);

  return $div({ textContent: parsed.title });
};

const SafeWidget = Safe(
  DangerousWidget,
  (err) => $div({ className: 'error-card' }, [
    $h2({ textContent: 'Failed to load widget' }),
    $p({ textContent: err.message })
  ]),
  'SafeWidget'
);

mount(SafeWidget, document.body);
```

### Behavior & Features
- **Error Interception:** Catches errors thrown during the synchronous creation pass of `factory()`.
- **Automatic Normalization:** Normalizes thrown values into standard `Error` instances via `wrapError()`.
- **Isolated Fallback:** Renders the fallback elements safely inside the component boundary.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
