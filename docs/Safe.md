## Safe()

Create a component with error boundary protection. `Safe` wraps a component factory with error handling. If the factory throws an error during initialization, the error boundary factory is called to create fallback UI.

**Parameters:**
- `factory` - Function that creates the component element: `() => Node`
- `errorBoundaryFactory` - Error handler that returns fallback UI: `(err: Error) => Node`

**Returns:** [`SeidrComponent`](../component/README.md#seidrcomponent-type)

```typescript
import { Safe, useScope, $div, $h2, $p } from '@fimbul-works/seidr';

const UserProfile = Safe(
  () => {
    // Initialization that might fail
    const data = JSON.parse('invalid json');
    return $div({ textContent: data.name });
  },
  (err) => {
    // Error boundary: return fallback UI
    return $div({ className: 'error' }, [
      $h2({ textContent: 'Error Occurred' }),
      $p({ textContent: err.message })
    ]);
  }
);
```

**Error Boundary Behavior**:

- **Scope Cleanup**: Original component scope is destroyed before error boundary is called
- **Fresh Scope**: Error boundary receives a new [`ComponentScope`](types.md#componentscope-type) for tracking its own resources (via [`useScope`](useScope.md#usescope))
- **Root Components**: Errors in root components without `Safe` wrapper are logged to console
- **Resource Tracking**: Error boundary can track its own cleanup functions via [`scope.track`](../component/README.md#componentscope-type)

```typescript
import { Safe, useScope, $div } from '@fimbul-works/seidr';

const SafeComponent = Safe(
  () => {
    const scope = useScope();
    // Track resources
    scope.track(() => console.log('Component cleanup'));

    throw new SeidrError('Failed');
    return $div();
  },
  (err) => {
    const scope = useScope();
    // Error boundary gets its own scope for resource tracking
    scope.track(() => console.log('Error boundary cleanup'));

    return $div({ textContent: 'Fallback UI' });
  }
);

SafeComponent.unmount();
// Logs:
// - "Component cleanup" (from failed component)
// - "Error boundary cleanup" (from error boundary)
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
