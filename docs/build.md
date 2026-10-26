![@fimbul-works/seidr](../public/seidr-logo.svg)

# Build Plugins API (`@fimbul-works/seidr-build-tools`)

Seidr components are isomorphic by construction. To ensure optimal production bundle sizes across any build pipeline, `@fimbul-works/seidr-build-tools` uses **[unplugin](https://github.com/unplugin/unplugin)** to provide unified build-time plugins for **Vite**, **Webpack**, **Rollup**, **Rolldown**, **Esbuild**, **Rspack**, and **Babel**.

The plugins automatically perform:
- Dead-code elimination of environment-inapplicable branches (`inServer(() => ...)`, `inClient(() => ...)`).
- Compile-time boolean replacements for `isServer()`, `isClient()`, `isHydrating()`, and `import.meta.env.SSR`.
- Automatic pruning of orphaned imports that become unreferenced after branch elimination.

---

## Supported Build Systems

### 1. Vite: `seidrVitePlugin()`

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { seidrVitePlugin } from '@fimbul-works/seidr-build-tools/vite';

export default defineConfig({
  plugins: [
    seidrVitePlugin({
      target: "browser",
      disableSSR: false,
    }),
  ],
});
```

### 2. Webpack: `seidrWebpackPlugin()`

```typescript
// webpack.config.js
import { seidrWebpackPlugin } from '@fimbul-works/seidr-build-tools/webpack';

export default {
  plugins: [
    seidrWebpackPlugin({
      target: "browser",
    }),
  ],
};
```

### 3. Rollup: `seidrRollupPlugin()`

```typescript
// rollup.config.js
import { seidrRollupPlugin } from '@fimbul-works/seidr-build-tools/rollup';

export default {
  plugins: [
    seidrRollupPlugin({
      target: "browser",
    }),
  ],
};
```

### 4. Rolldown: `seidrRolldownPlugin()`

```typescript
// rolldown.config.ts / tsdown.config.ts
import { defineConfig } from 'rolldown';
import { seidrRolldownPlugin } from '@fimbul-works/seidr-build-tools/rolldown';

export default defineConfig({
  plugins: [
    seidrRolldownPlugin({
      target: "browser",
      disableSSR: false,
    }),
  ],
});
```

### 5. Esbuild: `seidrEsbuildPlugin()`

```typescript
// build.js
import esbuild from 'esbuild';
import { seidrEsbuildPlugin } from '@fimbul-works/seidr-build-tools/esbuild';

await esbuild.build({
  entryPoints: ['src/entry-client.ts'],
  bundle: true,
  outfile: 'dist/client.js',
  plugins: [seidrEsbuildPlugin({ target: "browser" })],
});
```

### 6. Rspack: `seidrRspackPlugin()`

```typescript
// rspack.config.js
import { seidrRspackPlugin } from '@fimbul-works/seidr-build-tools/rspack';

export default {
  plugins: [
    seidrRspackPlugin({ target: "browser" }),
  ],
};
```

### 7. Babel: `seidrBabelPlugin`

```json
{
  "plugins": [
    ["@fimbul-works/seidr-build-tools/babel", { "target": "browser" }]
  ]
}
```

---

## Options: `SeidrBuildPluginOptions`

```typescript
export interface SeidrBuildPluginOptions {
  /**
   * Target environment for code stripping and AST pruning.
   * @default "browser"
   */
  target?: "browser" | "ssr";

  /**
   * Disable server-side rendering support.
   * When true, strips all SSR tracking and hydration code for maximum client-only size optimization.
   * @default false
   */
  disableSSR?: boolean;

  /**
   * Include filter pattern for modules to transform.
   */
  include?: string | RegExp | Array<string | RegExp>;

  /**
   * Exclude filter pattern for modules to exclude from transformation.
   */
  exclude?: string | RegExp | Array<string | RegExp>;
}
```

---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
