# Skill Evaluation & Benchmark Test Prompts

Use these test prompts to evaluate whether an AI agent properly loads and applies the `seidr` skill without falling into React contamination or API hallucination.

---

## Test Prompt 1: Simple Component & Lifecycle
> **Prompt**:
> "Create a Seidr component called `AutoTimer` that counts up every second using `setInterval`. It should display the current seconds count, have a pause/resume button, and cleanly tear down the timer when unmounted."

### Evaluation Criteria:
- [ ] Does it use `createComponent` and `createValue`?
- [ ] Does it clean up the interval via `onUnmounted`?
- [ ] Does it avoid creating `useEffect` mock wrappers?
- [ ] Does it bind the count reactively (`count.as(...)`) to text content?

---

## Test Prompt 2: Headless Primitive Port (Radix Accordion)
> **Prompt**:
> "Port the `@radix-ui/react-accordion` primitive to Seidr. Support multiple or single open items, preserve ARIA attributes (`aria-expanded`, `aria-controls`), and support keyboard navigation (Arrow Up/Down roving focus)."

### Evaluation Criteria:
- [ ] Does it use a **Coordinator Factory** (`createAccordion`) rather than React Context?
- [ ] Does it use `wrapValue` for controlled/uncontrolled state?
- [ ] Does it bind ARIA attributes directly to reactive `Value` observables?
- [ ] Does it avoid React imports or hook abstractions?
- [ ] Is it safe in SSR environments?

---

## Test Prompt 3: Form Input & Two-Way Binding
> **Prompt**:
> "Create a Seidr form with fields for `username` and `email`, plus a submit button that is disabled unless both fields are non-empty."

### Evaluation Criteria:
- [ ] Does it use `bindInput` from `@fimbul-works/seidr` for the form inputs?
- [ ] Does it use `mergeValues` with explicit parents or `.as()` to derive `isSubmitDisabled`?
- [ ] Does it avoid re-running the component on keystrokes?

---

## Test Prompt 4: React Contamination Review
> **Prompt**:
> "Review this code for React mental model leakage and rewrite it to idiomatic Seidr:
> ```typescript
> export const BadComponent = (props: { title: string }) => {
>   const [count, setCount] = useState(0);
>   useEffect(() => { console.log('mounted'); }, []);
>   return <div>{props.title}: {count}</div>;
> };
> ```"

### Evaluation Criteria:
- [ ] Identifies that `useState` and `useEffect` do not exist in Seidr.
- [ ] Identifies that props are not re-read and must use `wrapValue` if dynamic.
- [ ] Rewrites using `createComponent`, `createValue`, `$div`, and `wrapValue`.

---

## Test Prompt 5: Known Framework Gap Detection (Portal / Overlays)
> **Prompt**:
> "Port `@radix-ui/react-popover` to Seidr. The popover content must render into `document.body` using a Portal to float above all surrounding DOM elements."

### Evaluation Criteria:
- [ ] Does the agent recognize that `Portal` (`createPortal` / `<Portal>`) is a **known framework gap** in Seidr?
- [ ] Does the agent **STOP and report the missing capability** instead of inventing or faking a `createPortal` API?
- [ ] Does it decline to improvise hacky `document.body` DOM detaching unless explicitly told?
- [ ] Does it recommend overlay-independent primitives that do not require portals (e.g., Switch, Accordion, Tabs)?

---

## Test Prompt 6: Watch/Bind Cleanup Disambiguation
> **Prompt**:
> "Create a Seidr component that listens to a `searchQuery: Value<string>` and debounces a fetch operation by 300ms using `setTimeout`. Cancel previous timers on new keystrokes, and stop listening when the component unmounts."

### Evaluation Criteria:
- [ ] Does the watcher callback return a per-update teardown (`return () => clearTimeout(timer)`)?
- [ ] Does it capture the unsubscribe handle returned by `searchQuery.watch(...)`?
- [ ] Does it pass the **unsubscribe handle** (not the inner timer teardown) to `onUnmounted(unwatch)`?
- [ ] Does it avoid creating custom hooks like `useDebounce`?
