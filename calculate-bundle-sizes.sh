#!/bin/bash

set -e

# Minify the browser bundle for size reporting
echo "Minifying bundles for size calculation..."
npx rollup -c rollup.config.js --environment MINIFY:true > /dev/null 2>&1 || true

# Create temporary minified versions using terser
npx terser dist/seidr.js -c -m -o dist/seidr.min.js --module
npx terser dist/seidr.cjs -c -m -o dist/seidr.min.cjs

# Compress the bundles
gzip -f -k dist/seidr.min.js
gzip -f -k dist/seidr.min.cjs
gzip -f -k examples/dist/*.*js

echo ""
echo "=========================================="
echo "Bundle sizes (bytes):"
echo "=========================================="
echo ""
echo "Browser bundle:"
wc -c dist/seidr.js dist/seidr.min.js dist/seidr.min.js.gz | grep -v total
echo ""
echo "Node bundle:"
wc -c dist/seidr.node.js dist/seidr.node.cjs | grep -v total
echo ""
echo "Example bundles:"
wc -c examples/dist/*.*js* | grep -v \.map | grep -v total
echo ""
echo "=========================================="
echo ""

# Remove temporary minified and gzipped files
rm -f dist/seidr.min.js dist/seidr.min.cjs
rm -f dist/seidr.min.js.gz dist/seidr.min.cjs.gz
rm -f examples/dist/*.gz

echo "Temporary minified files removed. Size report complete."
