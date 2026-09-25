#!/bin/bash
rm -rf examples/build

EXAMPLE=hello-world npx vite build
EXAMPLE=dom-only npx vite build
EXAMPLE=counter npx vite build
EXAMPLE=pomodoro npx vite build
EXAMPLE=todo-mvc npx vite build
npx vite build

npx vite build --config vite.ssr.config.ts
