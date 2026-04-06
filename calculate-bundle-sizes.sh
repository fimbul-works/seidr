#!/bin/bash

set -e

echo "Minifying bundle..."

# Create temporary minified versions using terser
npx terser dist/seidr.js -o dist/seidr.min.js --toplevel -c passes=2 -c ecma=2023 -m --module > /dev/null 2>&1 || true
npx terser dist/seidr.ssr.js -o dist/seidr.ssr.min.js --toplevel -c passes=2 -c ecma=2023 -m --module > /dev/null 2>&1 || true
npx terser dist/seidr.core.js -o dist/seidr.core.min.js --toplevel -c passes=2 -c ecma=2023 -m --module > /dev/null 2>&1 || true

# Compress the bundles
gzip -f -k dist/*.min.js
gzip -f -k examples/dist/*.*js
gzip -f -k examples/ssr/dist/*.*js

brotli -f dist/*.min.js
brotli -f examples/dist/*.*js
brotli -f examples/ssr/dist/*.*js

echo ""
echo "=========================================="
echo "Bundle sizes (bytes):"
echo "=========================================="
echo ""
echo "Browser bundle:"
wc -c dist/seidr.*js* | grep -v .cjs | grep -v total
echo ""
echo "Example bundles:"
wc -c examples/dist/*.js* examples/ssr/dist/*.js* | grep -v \.map | grep -v total
echo ""
echo "=========================================="
echo ""

# Remove temporary minified and gzipped files
rm -f dist/*.gz dist/*.min.js dist/*.br
rm -f examples/dist/*.gz examples/dist/*.br
rm -f examples/ssr/dist/*.gz examples/ssr/dist/*.br

echo "Temporary minified files removed. Size report complete."
