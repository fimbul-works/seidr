# Switch Component

The `Switch` function selects and renders different element or component branches based on the current state of a reactive [`Value`](Value.md).

---

## `Switch()`

**Generic Types:**
- `K extends string | number` — Discriminant key type.
- `B extends SwitchBranches<K>` — Record or Map of branch render functions.

**Parameters:**
- `value: Value<K>` — Reactive `Value` to switch on.
- `branches: B | Value<B>` — Record or `Map` mapping keys to factory functions returning `SeidrChild` (can also be a reactive `Value`).
- `fallback?: () => SeidrChild` — Optional fallback factory function invoked when no branch matches.

**Returns:** `Value<SeidrChild>` — A reactive derived `Value` representing the currently active branch.

```typescript
import { Switch, createValue, mount } from '@fimbul-works/seidr';
import { $button, $div, $p } from '@fimbul-works/seidr/html';

type Tab = 'home' | 'profile' | 'settings';

const activeTab = createValue<Tab>('home');

const TabContent = () => {
  return $div({ className: 'tab-content' }, [
    Switch(
      activeTab,
      {
        home: () => $p({ textContent: 'Welcome to the Home tab!' }),
        profile: () => $p({ textContent: 'User profile and details.' }),
        settings: () => $p({ textContent: 'Application settings.' })
      },
      () => $p({ textContent: 'Page not found.' })
    )
  ]);
};

const TabNavigation = () => {
  return $div({ className: 'tabs-container' }, [
    $div({ className: 'tab-buttons' }, [
      $button({ textContent: 'Home', onclick: () => activeTab('home') }),
      $button({ textContent: 'Profile', onclick: () => activeTab('profile') }),
      $button({ textContent: 'Settings', onclick: () => activeTab('settings') })
    ]),
    TabContent
  ]);
};

mount(TabNavigation, document.body);
```

### Key Features
- **Composable Derived Value:** `Switch` returns a `Value<SeidrChild>`, allowing it to be embedded directly as a child inside any element array or component.
- **Dynamic Branches:** You can pass either a static record/Map or a reactive `Value<SwitchBranches<K>>` if branches change dynamically.
- **Component Scope Preservation:** Branch factories execute with the caller's component scope preserved for accurate lifecycle tracking and automatic cleanup.

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
