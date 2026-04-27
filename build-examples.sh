#!/bin/bash

echo "Building examples with strict tree-shaking..."

# Create temp directory for individual builds
mkdir -p examples/temp

echo "Building Hello World example..."
EXAMPLE=hello-world npx vite build --config vite.examples.config.ts
mv examples/build/hello-world.js examples/temp/hello-world.js

echo "Building counter example..."
EXAMPLE=counter npx vite build --config vite.examples.config.ts
mv examples/build/counter.js examples/temp/counter.js

echo "Building TodoMVC example..."
EXAMPLE=todo npx vite build --config vite.examples.config.ts
mv examples/build/todo.js examples/temp/todo.js

echo "Building Pomodoro-timer example..."
EXAMPLE=pomodoro npx vite build --config vite.examples.config.ts
mv examples/build/pomodoro.js examples/temp/pomodoro.js

# Copy both files to final location
cp examples/temp/hello-world.js examples/build/hello-world.js
cp examples/temp/counter.js examples/build/counter.js
cp examples/temp/todo.js examples/build/todo.js
cp examples/temp/pomodoro.js examples/build/pomodoro.js

# Cleanup temp directory
rm -rf examples/temp
