import { defineConfig } from 'vite';
import { join } from 'path';

export default defineConfig(({ command, mode }) => {
  const example = process.env.EXAMPLE || 'counter';

  return {
    build: {
      outDir: 'examples/dist',
      emptyOutDir: true,
      sourcemap: true,
      minify: 'terser',
      target: 'es2020',
      rollupOptions: {
        input: `examples/${example}.ts`,
        output: {
          dir: 'examples/dist',
          format: 'iife',
          entryFileNames: `${example}.js`,
          inlineDynamicImports: true,
          compact: true
        },
        treeshake: 'smallest'
      }
    },
    server: {
      port: 3000,
      open: '/examples/index.html'
    }
  };
});