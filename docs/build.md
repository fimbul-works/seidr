<img src="../public/seidr-logo.svg" alt="Seidr logo" style="height:150px;margin-bottom:-2.5em;"/>

# Build Plugins API (`@fimbul-works/seidr/build`)

Seidr components are isomorphic by construction. To ensure optimal production bundle sizes, `@fimbul-works/seidr/build` provides build-time plugins for Vite and Rolldown that perform dead-code elimination, prune environment-inapplicable branches (`inServer`, `inClient`), and strip orphaned imports.

---

## Vite Plugin: `seidrVitePlugin()`

The official Seidr Vite plugin. It transforms TypeScript and JavaScript sources during bundling:
- Replaces `isServer()` and `isClient()` expressions with compile-time boolean literals (`true` / `false`).
- Eliminates dead blocks from `inServer(() => ...)` when bundling for the browser, and dead blocks from `inClient(() => ...)` when bundling for SSR.
- Removes orphaned imports that become unused after environment-specific code elimination.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { seidrVitePlugin } from '@fimbul-works/seidr/build';

export default defineConfig({
  plugins: [
    seidrVitePlugin({
      disableSSR: false
    })
  ]
});
```

### Options: `SeidrVitePluginOptions`

```typescript
export interface SeidrVitePluginOptions {
  /**
   * Disable server-side rendering support.
   * When true, strips all SSR tracking and hydration code for maximum client-only size optimization.
   * @default false
   */
  disableSSR?: boolean;
}
```

---

## Rolldown Bundle Plugin: `seidrRolldownPlugin()`

A Rolldown-compatible plugin performing compile-time dead-code replacements for standalone component or library bundles.

```typescript
import { defineConfig } from 'rolldown';
import { seidrRolldownPlugin } from '@fimbul-works/seidr/build';

export default defineConfig({
  plugins: [
    seidrRolldownPlugin({
      target: "browser",
      disableSSR: false,
    })
  ]
});
```

### Options: `SeidrRolldownPluginOptions`

```typescript
export interface SeidrRolldownPluginOptions {
  /**
   * Target environment for code stripping.
   * @default "browser"
   */
  target?: "browser" | "server";

  /**
   * Disable server-side rendering support.
   * When true, strips all SSR tracking and hydration code for maximum client-only size optimization.
   * @default false
   */
  disableSSR?: boolean;
}
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
