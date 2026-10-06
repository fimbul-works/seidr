# Seidr Skill Development TODO & Progress Tracker

This document tracks the phased development of the `seidr` agent skill (`.agents/skills/seidr/`).
Because sessions may span multiple days or encounter system reboots, this file acts as the source of truth for completed items and next steps.

---

## Progress Overview

- [x] **Phase 0: Research & Ground Truth Verification**
  - [x] Inspected Seidr documentation (`docs/*.md`) for API accuracy.
  - [x] Analyzed dogfooded patterns in `examples/ssr/` (pages, routing, SSR boundaries, suspense, switch).
  - [x] Verified core source signatures in `src/` (`observable`, `dom`, `component`, `hooks`, `router`, `util`).

- [x] **Phase 1: Skill Entry Point & Constitution**
  - [x] Create `.agents/skills/seidr/SKILL.md`
    - [x] YAML frontmatter (`name: seidr`, clear trigger description).
    - [x] The Seidr Constitution: Single-pass SolidJS-like execution model.
    - [x] The Intent-First Rule: Map intent, never mechanically substitute React APIs.
    - [x] The 12-Step Porting Workflow.
    - [x] The React Contamination Review Checklist.
    - [x] References index & progressive disclosure links.

- [x] **Phase 2: Mental Model & React Translation Guides**
  - [x] Create `references/mental-model.md`
    - [x] Component lifecycle: Component factory runs *once* (no re-render loop).
    - [x] Fine-grained reactivity: Signals / `Value<T>` drive DOM directly.
    - [x] Props handling: Static props vs reactive `Value` props (`wrapValue`).
    - [x] DOM updates: Direct bindings without VDOM diffing.
  - [x] Create `references/react-to-seidr-mapping.md`
    - [x] React Hooks -> Seidr Equivalents (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useContext`, `useId`).
    - [x] Control Flow (`{cond ? A : B}` -> `Show`, arrays -> `List`, switch -> `Switch`).
    - [x] Elements & Events (JSX -> `$element` / `@fimbul-works/seidr/html`, standard DOM events).
  - [x] Create `references/anti-patterns.md`
    - [x] "React wearing a fake moustache" (recreating hooks unnecessarily).
    - [x] Re-reading props expecting component re-runs.
    - [x] Inventing non-existent APIs (SolidJS/Vue name confusion).
    - [x] Leaking client globals (`window`, `document`) into SSR execution.

- [x] **Phase 3: Ground-Truth API & SSR Cheatsheet**
  - [x] Create `references/api-cheatsheet.md`
    - [x] Verified API signatures: `createValue`, `mergeValues`, `wrapValue`, `unwrapValue`, `withStorage`, `bindInput`.
    - [x] DOM API: `$`, `$factory`, `@fimbul-works/seidr/html` helpers, `useRef`, DOM queries.
    - [x] Components: `createComponent`, `mount`, `onMounted`, `onUnmounted`, `Show`, `List`, `Switch`, `Suspense`, `Safe`, `lazy`.
    - [x] Router: `Router`, `Link`, `useNavigate`, `usePathname`, `useRouteParams`, `useSearchParams`, `interceptLinks`.
  - [x] Create `references/server-client-boundaries.md`
    - [x] SSR execution model: `inServer()`, `inClient()`, `isServer()`, `isClient()`.
    - [x] Deterministic hydration: Value IDs, component IDs.
    - [x] Storage precedence gotcha during client restoration.

- [x] **Phase 4: Headless UI & Radix Porting Manual**
  - [x] Create `references/porting-radix-headless.md`
    - [x] Behavioral contracts: Accessibility, ARIA state attributes (`aria-expanded`, `aria-checked`, etc.).
    - [x] Keyboard navigation: roving tabindex, Escape handling, Arrow navigation.
    - [x] Controlled vs Uncontrolled state patterns with `wrapValue(props.value ?? default)`.
    - [x] Compound component pattern: Coordinator Factory (`createDialog()`, `createAccordion()`).
    - [x] Invisible state & SSR: `AppState` data API (`getData`/`setData`) + `registerDataStrategy`.
    - [x] Missing Radix primitives roadmap: DOM helpers (`getActiveElement`, `getOwnerDocument`) and `createPortal` plan.

- [x] **Phase 5: Concrete Porting Examples & Skill Evaluation**
  - [x] Create `examples/toggle-switch-port.md` (React/Radix Switch -> Idiomatic Seidr Switch).
  - [x] Create `examples/dialog-modal-port.md` (Coordinator Factory, focus trapping, portal plan).
  - [x] Define test evaluation prompts to test the skill against real coding tasks (`examples/eval-prompts.md`).

---

## Architectural Decisions & Standards

1. **Props Contract for Dynamic Values**:
   - Standardize on `wrapValue(props.value)` for dynamic props so callers can pass either static `T` or reactive `Value<T>`.
   - Strict `Value<T>` only when an API contract strictly requires mutual two-way binding.

2. **Compound Component Pattern**:
   - Use **Coordinator Factories** (e.g. `const dialog = createDialog(options)` returning `{ isOpen, Trigger, Content, Close }`).
   - For invisible/cross-tree shared state, use `AppState` data API (`getAppState().getData(KEY)` / `setData(KEY)`).
   - For SSR state serialization across server-client boundary, implement `registerDataStrategy()` on `AppState`.

3. **DOM & Radix Primitives Gap**:
   - `getOwnerDocument()` -> `element?.ownerDocument ?? getDocument()`.
   - `getOwnerWindow()` -> `element?.ownerDocument?.defaultView ?? (isServer() ? null : window)`.
   - `getActiveElement()` -> `getDocument().activeElement`.
   - **Portals (`createPortal`)**: Implement easier primitives first (Toggle, Switch, Accordion, Slider, RadioGroup); build `createPortal()` when reaching Dialog/Popover/Tooltip.

4. **Monorepo Ecosystem**:
   - Standardize on `pnpm` workspaces + **Turborepo** for packages (`packages/seidr`, `packages/seidr-random`, `packages/seidr-router`, `packages/seidr-ui`, `packages/seidr-form`, `packages/seidr-drag-and-drop`).

---

## Current Step

- **Active**: All phases (0–5) fully drafted and active! Ready for real-world usage, evaluations, and porting libraries.

---

## Reference Links

- [OpenAI — Skills](https://developers.openai.com/api/docs/guides/tools-skills?utm_source=chatgpt.com) — the current OpenAI documentation for the `SKILL.md` format and how skills are packaged/loaded.
    
- [Anthropic — Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills?utm_source=chatgpt.com) — particularly good conceptual explanation of progressive disclosure and why skills shouldn't become giant always-loaded prompts.
    
- [Claude — Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices?utm_source=chatgpt.com) — probably the most useful practical authoring guide I found. It specifically discusses descriptions, progressive disclosure, concrete examples, validation, and testing.
    
- [Microsoft — Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills?utm_source=chatgpt.com) — useful for seeing the broader portable/open format and the `SKILL.md` + `references/` + `scripts/` structure.