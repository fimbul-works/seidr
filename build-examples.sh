#!/bin/bash

echo "Building examples with strict tree-shaking..."

# Clean previous builds
pnpm clean:examples

# Build library first (creates proper Rollup bundles)
pnpm build

# Create temp directory for individual builds
mkdir -p examples/temp

echo "Building counter example..."
EXAMPLE=counter npx vite build --config vite.examples.config.ts
mv examples/dist/counter.js examples/temp/counter.js

echo "Building todo example..."
EXAMPLE=todo npx vite build --config vite.examples.config.ts
mv examples/dist/todo.js examples/temp/todo.js

# Copy both files to final location
cp examples/temp/counter.js examples/dist/counter.js
cp examples/temp/todo.js examples/dist/todo.js

# Cleanup temp directory
rm -rf examples/temp

# Compress the bundles (already minified by Rollup)
gzip -f -k dist/seidr.full.js
gzip -f -k dist/seidr.core.js
gzip -f -k examples/dist/*.js

echo "Example builds complete!"
echo "File sizes:"
ls -la dist/*.js*
ls -la examples/dist/*
echo ""
echo "Bundle sizes (bytes):"
wc -c dist/*.js* | tail -2
wc -c examples/dist/* | tail -2

# Note: .gz files are kept for size verification but excluded from npm via .npmignore
