#!/bin/bash

set -e

# Minify the browser bundles for size reporting
echo "Minifying bundles for size calculation..."
npx rollup -c rollup.bundles.js  > /dev/null 2>&1 || true

# Create temporary minified versions using terser
npx terser dist/seidr.js -c passes=2 -c ecma=2023 -c pure_funcs=[isUndefined,isBool,isNum,isStr,isFn,isObj,isSeidr,isSeidrElement,isSeidrComponent,isHTMLElement,isServer,isBrowser] -m -o dist/seidr.min.js --module  > /dev/null 2>&1 || true
npx terser dist/bundle/router.js -o dist/bundle/router.min.js --toplevel -c passes=2 -c ecma=2023 -c pure_funcs=[isUndefined,isBool,isNum,isStr,isFn,isObj,isSeidr,isSeidrElement,isSeidrComponent,isHTMLElement,isServer,isBrowser] -m --module  > /dev/null 2>&1 || true
npx terser dist/bundle/animation.js -o dist/bundle/animation.min.js --toplevel -c passes=2 -c ecma=2023 -c pure_funcs=[isUndefined,isBool,isNum,isStr,isFn,isObj,isSeidr,isSeidrElement,isSeidrComponent,isHTMLElement,isServer,isBrowser] -m --module  > /dev/null 2>&1 || true
npx terser dist/bundle/ssr.js -o dist/bundle/ssr.min.js --toplevel -c passes=2 -c ecma=2023 -c pure_funcs=[isUndefined,isBool,isNum,isStr,isFn,isObj,isSeidr,isSeidrElement,isSeidrComponent,isHTMLElement,isServer,isBrowser] -m --module  > /dev/null 2>&1 || true

# Compress the bundles
gzip -f -k dist/seidr.min.js
gzip -f -k examples/dist/*.*js
gzip -f -k dist/bundle/*.*js

echo ""
echo "=========================================="
echo "Bundle sizes (bytes):"
echo "=========================================="
echo ""
echo "Browser bundle:"
wc -c dist/seidr.*.js* | grep -v .node. | grep -v total
echo ""
echo "Example bundles:"
wc -c examples/dist/*.js* | grep -v \.map | grep -v total
echo ""
echo "Feature bundles:"
wc -c dist/bundle/*.js* | grep -v \.map | grep -v total
echo ""
echo "=========================================="
echo ""

# Remove temporary minified and gzipped files
rm -f dist/seidr.min.js dist/seidr.min.cjs
rm -f dist/seidr.min.js.gz dist/seidr.min.cjs.gz
rm -f examples/dist/*.gz
rm -rf dist/bundle

echo "Temporary minified files removed. Size report complete."
