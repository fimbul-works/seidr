# @fimbul-works/seidr-build-tools

Official build plugins and transform utilities for Seidr (Vite, Rolldown).

## Installation

```bash
pnpm add -D @fimbul-works/seidr-build-tools
```

## Vite Plugin Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { seidrVitePlugin } from '@fimbul-works/seidr-build-tools/vite';

export default defineConfig({
  plugins: [seidrVitePlugin({ disableSSR: false })],
});
```

## Rolldown Plugin Usage

```ts
// rolldown.config.ts / tsdown.config.ts
import { seidrRolldownPlugin } from '@fimbul-works/seidr-build-tools/rolldown';

export default {
  plugins: [seidrRolldownPlugin({ target: 'browser' })],
};
```
