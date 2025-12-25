#!/bin/bash

echo "Building examples with strict tree-shaking..."

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

./calculate-bundle-sizes.sh
