# Seidr Examples

This directory contains interactive examples demonstrating Seidr's capabilities.

## Running Examples

### Development Mode

Start the development server:

```bash
pnpm dev:examples
```

This will:
1. Start Vite dev server on `http://localhost:3000`
2. Open the examples index page in your browser
3. Enable hot module replacement for rapid development

### Building Examples

Build all examples for production:

```bash
pnpm build:examples
```

This creates optimized, minified builds in `examples/dist/`.

## Available Examples

### 🔢 Counter

**File:** `counter.html`

A simple counter demonstrating:
- Reactive state management with `Seidr<T>`
- Derived values using `.as()`
- Automatic DOM binding
- Conditional properties (disabled state)

### ✅ Todo App

**File:** `todo.html`

A complete todo application showcasing:
- Form handling with input binding
- List rendering and updates
- Two-way data binding
- State transformations
