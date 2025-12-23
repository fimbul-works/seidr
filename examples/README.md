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

**Key Concepts:**
- Creating observables
- Reactive props
- Component lifecycle

### ✅ Todo App

**File:** `todo.html`

A complete todo application showcasing:
- Form handling with input binding
- List rendering and updates
- Two-way data binding
- State transformations

**Key Concepts:**
- Form inputs
- Array operations
- Conditional rendering
- Manual DOM updates

## Development

### Adding New Examples

1. Create the example file (e.g., `myexample.ts`)
2. Create the corresponding HTML file (e.g., `myexample.html`)
3. Add a link to `index.html`
4. Build using: `EXAMPLE=myexample pnpm build:examples`

### Example Template

```typescript
import { $div, component, mount, Seidr } from "../src";

function MyExample() {
  return component((scope) => {
    const state = new Seidr(0);

    return $div({}, [
      // Your component here
    ]);
  });
}

mount(MyExample(), document.body);
```

## Testing

Examples are tested alongside the library:
- `counter.test.ts` - Tests for counter example
- `todo.test.ts` - Tests for todo app

This ensures all examples remain functional as the library evolves.
