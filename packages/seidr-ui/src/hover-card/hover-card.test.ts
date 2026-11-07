import {
  createComponent,
  mount,
  type SeidrChild,
} from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createHoverCard, HoverCard } from "./index.js";

describeDualMode("HoverCard", ({ getDocument, isSSR }) => {
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

  afterEach(() => {
    unmount?.();
    unmount = undefined;
    target?.remove();
  });

  it("renders default structure and semantic data attributes (Tier 1)", () => {
    const root = setup(() =>
      HoverCard({
        id: "test-hovercard",
        defaultOpen: true,
        href: "https://example.com",
        trigger: "@fimbul-works",
        content: "Rich profile preview card",
      }),
    );

    const rootEl = root.querySelector("[data-component='hover-card'][data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.hasAttribute("data-expanded")).toBe(true);

    const triggerEl = root.querySelector("[data-component='hover-card'][data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.tagName).toBe("A");
    expect(triggerEl.getAttribute("href")).toBe("https://example.com");
    expect(triggerEl.textContent).toBe("@fimbul-works");

    const contentEl = root.querySelector("[data-component='hover-card'][data-part='content']") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.textContent).toContain("Rich profile preview card");
  });

  it("supports fine-grained composition via createHoverCard (Tier 2)", () => {
    const root = setup(() => {
      const hc = createHoverCard({ id: "tier2-hc", defaultOpen: true });
      return hc.Root({}, [
        hc.Trigger({ href: "#shader" }, "Shader Preview"),
        hc.Content({}, [
          "GLSL Fragment Shader Preview",
          hc.Arrow(),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    const arrowEl = root.querySelector("[data-part='arrow']") as HTMLElement;

    expect(triggerEl).not.toBeNull();
    expect(contentEl).not.toBeNull();
    expect(arrowEl).not.toBeNull();
    expect(contentEl.textContent).toContain("GLSL Fragment Shader Preview");
  });

  if (!isSSR) {
    describe("Browser Interactivity", () => {
      it("opens after openDelay on pointerenter and cancels opening on early pointerleave", () => {
        vi.useFakeTimers();
        try {
          const root = setup(() =>
            HoverCard({
              id: "hover-hc",
              openDelay: 400,
              closeDelay: 200,
              trigger: "@seidr",
              content: "Seidr Reactive Framework",
            }),
          );

          const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
          expect(root.querySelector("[data-part='content']")).toBeNull();

          // Enter and leave before openDelay completes
          triggerEl.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
          vi.advanceTimersByTime(200);
          triggerEl.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, pointerType: "mouse" }));
          vi.advanceTimersByTime(300);
          expect(root.querySelector("[data-part='content']")).toBeNull();

          // Enter and stay for full 400ms
          triggerEl.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
          vi.advanceTimersByTime(400);
          expect(root.querySelector("[data-part='content']")).not.toBeNull();
        } finally {
          vi.useRealTimers();
        }
      });

      it("stays open when focus moves from trigger into interactive elements inside HoverCardContent", () => {
        vi.useFakeTimers();
        try {
          let innerBtn!: HTMLButtonElement;
          const root = setup(() => {
            const hc = createHoverCard({
              id: "focus-hc",
              openDelay: 200,
              closeDelay: 200,
            });
            innerBtn = getDocument().createElement("button");
            innerBtn.textContent = "Follow";

            return hc.Root({}, [
              hc.Trigger({ href: "#profile" }, "@seidr"),
              hc.Content({}, [innerBtn]),
            ]);
          });

          const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
          triggerEl.dispatchEvent(new FocusEvent("focus"));
          vi.advanceTimersByTime(200);
          expect(root.querySelector("[data-part='content']")).not.toBeNull();

          // Blur trigger with relatedTarget inside HoverCardContent -> stays open!
          triggerEl.dispatchEvent(new FocusEvent("blur", { relatedTarget: innerBtn }));
          vi.advanceTimersByTime(300);
          expect(root.querySelector("[data-part='content']")).not.toBeNull();

          // Blur trigger with relatedTarget outside -> closes after closeDelay
          triggerEl.dispatchEvent(new FocusEvent("blur", { relatedTarget: getDocument().body }));
          vi.advanceTimersByTime(200);
          expect(root.querySelector("[data-part='content']")).toBeNull();
        } finally {
          vi.useRealTimers();
        }
      });

      it("dismisses on Escape keydown", () => {
        const root = setup(() =>
          HoverCard({
            id: "esc-hc",
            defaultOpen: true,
            trigger: "@seidr",
            content: "Card Content",
          }),
        );

        expect(root.querySelector("[data-part='content']")).not.toBeNull();
        getDocument().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        expect(root.querySelector("[data-part='content']")).toBeNull();
      });

      it("supports portaling hover card content via portalTarget", () => {
        vi.useFakeTimers();
        const portalHost = getDocument().createElement("div");
        getDocument().body.appendChild(portalHost);

        try {
          const root = setup(() =>
            HoverCard({
              id: "portal-hc",
              openDelay: 100,
              portalTarget: portalHost,
              trigger: "@seidr",
              content: "Portaled HoverCard Preview",
            }),
          );

          const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
          triggerEl.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true, pointerType: "mouse" }));
          vi.advanceTimersByTime(100);

          expect(root.querySelector("[data-part='content']")).toBeNull();
          expect(portalHost.querySelector("[data-part='content']")).not.toBeNull();
          expect(portalHost.querySelector("[data-part='content']")?.textContent).toContain(
            "Portaled HoverCard Preview",
          );
        } finally {
          portalHost.remove();
          vi.useRealTimers();
        }
      });

      it("has no accessibility violations (axe)", async () => {
        const root = setup(() =>
          HoverCard({
            id: "axe-hc",
            defaultOpen: true,
            href: "https://example.com",
            trigger: "Accessible Link",
            content: "Preview details for link",
          }),
        );

        const results = await axe(root);
        expect(results).toHaveNoViolations();
      });
    });
  }
});
