import terser from '@rollup/plugin-terser';

const library = process.env.LIBRARY || 'full';
const entry = `dist/esm/${library === 'core' ? 'index.core.js' : 'index.js'}`;

export default {
  input: entry,
  output: {
    file: `dist/seidr.${library}.js`,
    format: 'es',
    sourcemap: true,
    compact: true
  },
  plugins: [
    terser({
      module: true,
      mangle: {
        properties: false,
        // Preserve class names for instanceof checks
        reserved: ['Seidr']
      },
      compress: {
        passes: 2
      }
    })
  ],
  external: [],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false
  }
};
