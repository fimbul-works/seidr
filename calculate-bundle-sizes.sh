#!/bin/bash

set -e

# Create temporary minified versions using terser
npx terser bundles/seidr.js -o bundles/seidr.min.js --toplevel -c passes=2 -c ecma=2023 -m --module > /dev/null 2>&1 || true
npx terser bundles/seidr.core.js -o bundles/seidr.core.min.js --toplevel -c passes=2 -c ecma=2023 -m --module > /dev/null 2>&1 || true

# Compress the bundles
gzip -f -k bundles/*.min.js
gzip -f -k examples/dist/*.*js
# gzip -f -k examples/ssr/dist/*.*js

brotli -f bundles/*.min.js
brotli -f examples/dist/*.*js
# brotli -f examples/ssr/dist/*.*js

echo ""
echo "=========================================="
echo "Bundle sizes (bytes):"
echo "=========================================="
echo ""
echo "Browser bundle:"
wc -c bundles/*js* | grep -v .cjs | grep -v total
echo ""
echo "Example bundles:"
#wc -c examples/dist/*.js* examples/ssr/dist/*.js* | grep -v \.map | grep -v total
wc -c examples/dist/*.js* | grep -v \.map | grep -v total
echo ""
echo "=========================================="
echo ""

# Remove temporary minified and gzipped files
rm -f bundles/*.gz bundles/*.min.js bundles/*.br
rm -f examples/dist/*.gz examples/dist/*.br
rm -f examples/ssr/dist/*.gz examples/ssr/dist/*.br
