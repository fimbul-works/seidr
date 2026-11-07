import {
  createComponent,
  mount,
  type SeidrChild,
} from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createTooltip, Tooltip } from "./index.js";
import { resetTooltipGlobalState } from "./use-tooltip.js";

describeDualMode("Tooltip", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: (() => void) | undefined;

  const setup = (factory: () => SeidrChild) => {
    const doc = getDocument();
    target = doc.createElement("div");
    doc.body.appendChild(target);
    const App = createComponent(factory, "App");
    unmount = mount(App, target);
    return target;
  };

  beforeEach(() => {
    resetTooltipGlobalState();
  });

  afterEach(() => {
    unmount?.();
    unmount = undefined;
    target?.remove();
    resetTooltipGlobalState();
  });

  it("renders default structure, roles, and semantic data attributes (Tier 1)", () => {
    const root = setup(() =>
      Tooltip({
        id: "test-tooltip",
        defaultOpen: true,
        trigger: "Hover me",
        content: "Helpful hint",
      }),
    );

    const rootEl = root.querySelector("[data-component='tooltip'][data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.hasAttribute("data-expanded")).toBe(true);

    const triggerEl = root.querySelector("[data-component='tooltip'][data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.tagName).toBe("BUTTON");
    expect(triggerEl.getAttribute("type")).toBe("button");
    expect(triggerEl.getAttribute("aria-describedby")).toBe("test-tooltip-content");

    const contentEl = root.querySelector("[data-component='tooltip'][data-part='content']") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.getAttribute("role")).toBe("tooltip");
    expect(contentEl.getAttribute("id")).toBe("test-tooltip-content");
    expect(contentEl.textContent).toContain("Helpful hint");
  });

  it("supports fine-grained composition via createTooltip (Tier 2)", () => {
    const root = setup(() => {
      const tip = createTooltip({ id: "tier2-tooltip", defaultOpen: true });
      return tip.Root({}, [
        tip.Trigger({}, "Button Trigger"),
        tip.Content({}, [
          "Custom tooltip body",
          tip.Arrow(),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    const arrowEl = root.querySelector("[data-part='arrow']") as HTMLElement;

    expect(triggerEl).not.toBeNull();
    expect(contentEl).not.toBeNull();
    expect(arrowEl).not.toBeNull();
    expect(contentEl.textContent).toContain("Custom tooltip body");
  });

  if (!isSSR) {
    describe("Browser Interactivity", () => {
      it("opens after openDelay on pointerenter and closes after closeDelay on pointerleave", () => {
        vi.useFakeTimers();
        try {
          const root = setup(() =>
            Tooltip({
              id: "hover-tooltip",
              openDelay: 500,
              closeDelay: 200,
              trigger: "Hover Target",
              content: "Tooltip Content",
            }),
          );

          const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
          expect(root.querySelector("[data-part='content']")).toBeNull();

          triggerEl.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
          vi.advanceTimersByTime(300);
          expect(root.querySelector("[data-part='content']")).toBeNull();

          vi.advanceTimersByTime(200);
          expect(root.querySelector("[data-part='content']")).not.toBeNull();
          expect(triggerEl.getAttribute("aria-describedby")).toBe("hover-tooltip-content");

          // Pointer leaves trigger
          triggerEl.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, pointerType: "mouse" }));
          vi.advanceTimersByTime(100);
          expect(root.querySelector("[data-part='content']")).not.toBeNull();

          vi.advanceTimersByTime(100);
          expect(root.querySelector("[data-part='content']")).toBeNull();
          expect(triggerEl.getAttribute("aria-describedby")).toBeNull();
        } finally {
          vi.useRealTimers();
        }
      });

      it("opens immediately on keyboard focus and closes immediately on blur", () => {
        const root = setup(() =>
          Tooltip({
            id: "focus-tooltip",
            openDelay: 700,
            trigger: "Focus Target",
            content: "Keyboard Tooltip",
          }),
        );

        const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
        expect(root.querySelector("[data-part='content']")).toBeNull();

        triggerEl.dispatchEvent(new FocusEvent("focus"));
        expect(root.querySelector("[data-part='content']")).not.toBeNull();

        triggerEl.dispatchEvent(new FocusEvent("blur"));
        expect(root.querySelector("[data-part='content']")).toBeNull();
      });

      it("closes immediately when trigger is clicked or Escape is pressed", () => {
        const root = setup(() =>
          Tooltip({
            id: "esc-tooltip",
            defaultOpen: true,
            trigger: "Click or Esc",
            content: "Dismissible Tooltip",
          }),
        );

        expect(root.querySelector("[data-part='content']")).not.toBeNull();

        getDocument().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        expect(root.querySelector("[data-part='content']")).toBeNull();

        // Reopen via focus, then close via click
        const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
        triggerEl.dispatchEvent(new FocusEvent("focus"));
        expect(root.querySelector("[data-part='content']")).not.toBeNull();

        triggerEl.click();
        expect(root.querySelector("[data-part='content']")).toBeNull();
      });

      it("skips openDelay when moving between multiple tooltips within skipDelayDuration", () => {
        vi.useFakeTimers();
        try {
          const root = setup(() => {
            const t1 = createTooltip({ id: "t1", openDelay: 600, closeDelay: 200, skipDelayDuration: 300 });
            const t2 = createTooltip({ id: "t2", openDelay: 600, closeDelay: 200, skipDelayDuration: 300 });
            return getDocument().createElement("div");
          });

          unmount?.();
          target?.remove();

          const container = setup(() => {
            const t1 = createTooltip({ id: "t1", openDelay: 600, closeDelay: 200, skipDelayDuration: 300 });
            const t2 = createTooltip({ id: "t2", openDelay: 600, closeDelay: 200, skipDelayDuration: 300 });
            return t1.Root({}, [
              t1.Trigger({ id: "btn-1" }, "One"),
              t1.Content({ id: "cnt-1" }, "Tip One"),
              t2.Trigger({ id: "btn-2" }, "Two"),
              t2.Content({ id: "cnt-2" }, "Tip Two"),
            ]);
          });

          const btn1 = container.querySelector("#btn-1") as HTMLElement;
          const btn2 = container.querySelector("#btn-2") as HTMLElement;

          // Hover first tooltip -> waits full 600ms
          btn1.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
          vi.advanceTimersByTime(600);
          expect(container.querySelector("#cnt-1")).not.toBeNull();

          // Move to second tooltip -> opens immediately (0ms) and closes first tooltip!
          btn1.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, pointerType: "mouse" }));
          btn2.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));

          expect(container.querySelector("#cnt-1")).toBeNull();
          expect(container.querySelector("#cnt-2")).not.toBeNull();
        } finally {
          vi.useRealTimers();
        }
      });

      it("supports portaling tooltip content via portalTarget", () => {
        const portalHost = getDocument().createElement("div");
        getDocument().body.appendChild(portalHost);

        try {
          const root = setup(() =>
            Tooltip({
              id: "portal-tooltip",
              portalTarget: portalHost,
              trigger: "Portaled",
              content: "Portaled Tooltip Text",
            }),
          );

          const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
          triggerEl.dispatchEvent(new FocusEvent("focus"));

          expect(root.querySelector("[data-part='content']")).toBeNull();
          expect(portalHost.querySelector("[data-part='content']")).not.toBeNull();
          expect(portalHost.querySelector("[data-part='content']")?.textContent).toContain("Portaled Tooltip Text");
        } finally {
          portalHost.remove();
        }
      });

      it("has no accessibility violations (axe)", async () => {
        const root = setup(() =>
          Tooltip({
            id: "axe-tooltip",
            defaultOpen: true,
            trigger: "Accessible Trigger",
            content: "Accessible Tooltip Description",
          }),
        );

        const results = await axe(root);
        expect(results).toHaveNoViolations();
      });
    });
  }
});
