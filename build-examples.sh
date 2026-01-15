#!/bin/bash

echo "Building examples with strict tree-shaking..."

# Create temp directory for individual builds
mkdir -p examples/temp

echo "Building Hello World example..."
EXAMPLE=hello-world npx vite build --config vite.examples.config.ts
mv examples/dist/hello-world.js examples/temp/hello-world.js

echo "Building counter example..."
EXAMPLE=counter npx vite build --config vite.examples.config.ts
mv examples/dist/counter.js examples/temp/counter.js

echo "Building Todo app example..."
EXAMPLE=todo npx vite build --config vite.examples.config.ts
mv examples/dist/todo.js examples/temp/todo.js

echo "Building Pomodoro-timer example..."
EXAMPLE=pomodoro npx vite build --config vite.examples.config.ts
mv examples/dist/pomodoro.js examples/temp/pomodoro.js

echo "Building SSR example..."
EXAMPLE=todo npx vite build --config vite.examples-ssr.config.ts

# Copy both files to final location
cp examples/temp/hello-world.js examples/dist/hello-world.js
cp examples/temp/counter.js examples/dist/counter.js
cp examples/temp/todo.js examples/dist/todo.js
cp examples/temp/pomodoro.js examples/dist/pomodoro.js

# Cleanup temp directory
rm -rf examples/temp
