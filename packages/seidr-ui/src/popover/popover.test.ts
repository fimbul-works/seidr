import {
  createComponent,
  mount,
  type SeidrChild,
} from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createPopover, Popover } from "./index.js";

describeDualMode("Popover", ({ getDocument, isSSR }) => {
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

  it("renders default structure, roles, and semantic data attributes (Tier 1)", () => {
    const root = setup(() =>
      Popover({
        id: "test-popover",
        defaultOpen: true,
        trigger: "Open Popover",
        title: "Popover Title",
        description: "Popover Description Text",
        content: "Interactive body content",
        closeButton: true,
        showArrow: true,
      }),
    );

    const rootEl = root.querySelector("[data-component='popover'][data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.hasAttribute("data-expanded")).toBe(true);

    const triggerEl = root.querySelector("[data-component='popover'][data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.tagName).toBe("BUTTON");
    expect(triggerEl.getAttribute("type")).toBe("button");
    expect(triggerEl.getAttribute("aria-haspopup")).toBe("dialog");
    expect(triggerEl.getAttribute("aria-expanded")).toBe("true");
    expect(triggerEl.getAttribute("aria-controls")).toBe("test-popover-content");

    const contentEl = root.querySelector("[data-component='popover'][data-part='content']") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.getAttribute("role")).toBe("dialog");
    expect(contentEl.getAttribute("id")).toBe("test-popover-content");
    expect(String(contentEl.getAttribute("tabindex"))).toBe("-1");
    expect(contentEl.getAttribute("aria-labelledby")).toBe("test-popover-title");
    expect(contentEl.getAttribute("aria-describedby")).toBe("test-popover-description");

    const titleEl = root.querySelector("[data-component='popover'][data-part='title']") as HTMLElement;
    expect(titleEl).not.toBeNull();
    expect(titleEl.tagName).toBe("H2");
    expect(titleEl.getAttribute("id")).toBe("test-popover-title");
    expect(titleEl.textContent).toBe("Popover Title");

    const descEl = root.querySelector("[data-component='popover'][data-part='description']") as HTMLElement;
    expect(descEl).not.toBeNull();
    expect(descEl.tagName).toBe("P");
    expect(descEl.getAttribute("id")).toBe("test-popover-description");
    expect(descEl.textContent).toBe("Popover Description Text");

    const closeBtnEl = root.querySelector("[data-component='popover'][data-part='close-button']") as HTMLElement;
    expect(closeBtnEl).not.toBeNull();
    expect(closeBtnEl.tagName).toBe("BUTTON");
    expect(closeBtnEl.getAttribute("aria-label")).toBe("Dismiss");

    const arrowEl = root.querySelector("[data-component='popover'][data-part='arrow']") as HTMLElement;
    expect(arrowEl).not.toBeNull();
  });

  it("supports fine-grained composition via createPopover (Tier 2)", () => {
    const root = setup(() => {
      const pop = createPopover({ id: "tier2-popover", defaultOpen: true });
      return pop.Root({}, [
        pop.Trigger({}, "Custom Trigger"),
        pop.Content({}, [
          pop.Title({}, "Custom Title"),
          pop.Description({}, "Custom Description"),
          "Body Text",
          pop.CloseButton({}, "Close"),
          pop.Arrow(),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    const contentEl = root.querySelector("[data-part='content']") as HTMLElement;
    const titleEl = root.querySelector("[data-part='title']") as HTMLElement;
    const descEl = root.querySelector("[data-part='description']") as HTMLElement;
    const closeBtnEl = root.querySelector("[data-part='close-button']") as HTMLElement;
    const arrowEl = root.querySelector("[data-part='arrow']") as HTMLElement;

    expect(triggerEl).not.toBeNull();
    expect(contentEl).not.toBeNull();
    expect(titleEl).not.toBeNull();
    expect(descEl).not.toBeNull();
    expect(closeBtnEl).not.toBeNull();
    expect(arrowEl).not.toBeNull();
    expect(contentEl.textContent).toContain("Body Text");
  });

  if (!isSSR) {
    describe("Browser Interactivity", () => {
      it("toggles open state when clicking the trigger", () => {
        const root = setup(() =>
          Popover({
            id: "toggle-popover",
            trigger: "Toggle Me",
            content: "Pop Content",
          }),
        );

        const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
        expect(root.querySelector("[data-part='content']")).toBeNull();
        expect(triggerEl.getAttribute("aria-expanded")).toBe("false");

        // Click to open
        triggerEl.click();
        expect(root.querySelector("[data-part='content']")).not.toBeNull();
        expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

        // Click to close
        triggerEl.click();
        expect(root.querySelector("[data-part='content']")).toBeNull();
        expect(triggerEl.getAttribute("aria-expanded")).toBe("false");
      });

      it("closes when pressing Escape key", () => {
        const root = setup(() =>
          Popover({
            id: "esc-popover",
            defaultOpen: true,
            trigger: "Escape Popover",
            content: "Escapable Content",
          }),
        );

        expect(root.querySelector("[data-part='content']")).not.toBeNull();

        getDocument().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        expect(root.querySelector("[data-part='content']")).toBeNull();
      });

      it("closes when clicking CloseButton", () => {
        const root = setup(() =>
          Popover({
            id: "close-btn-popover",
            defaultOpen: true,
            trigger: "Trigger",
            closeButton: true,
            content: "Has Close Button",
          }),
        );

        const closeBtn = root.querySelector("[data-part='close-button']") as HTMLElement;
        expect(closeBtn).not.toBeNull();

        closeBtn.click();
        expect(root.querySelector("[data-part='content']")).toBeNull();
      });

      it("closes when clicking outside the popover content", async () => {
        const outsideTarget = getDocument().createElement("button");
        outsideTarget.textContent = "Outside Button";
        getDocument().body.appendChild(outsideTarget);

        try {
          const root = setup(() =>
            Popover({
              id: "outside-popover",
              defaultOpen: true,
              trigger: "Trigger",
              content: "Click Outside to Close",
            }),
          );

          expect(root.querySelector("[data-part='content']")).not.toBeNull();

          // Wait for useInteractOutside pointerdown listener registration
          await new Promise((resolve) => setTimeout(resolve, 10));

          outsideTarget.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
          expect(root.querySelector("[data-part='content']")).toBeNull();
        } finally {
          outsideTarget.remove();
        }
      });

      it("supports custom Anchor positioning element", () => {
        const root = setup(() => {
          const pop = createPopover({ id: "anchor-popover", defaultOpen: true });
          return pop.Root({}, [
            pop.Anchor({ id: "custom-anchor" }, "Anchor Target"),
            pop.Trigger({}, "Trigger Button"),
            pop.Content({}, "Anchored Content"),
          ]);
        });

        const anchorEl = root.querySelector("#custom-anchor") as HTMLElement;
        const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
        const contentEl = root.querySelector("[data-part='content']") as HTMLElement;

        expect(anchorEl).not.toBeNull();
        expect(triggerEl).not.toBeNull();
        expect(contentEl).not.toBeNull();
      });

      it("supports portaling popover content via portalTarget", () => {
        const portalHost = getDocument().createElement("div");
        getDocument().body.appendChild(portalHost);

        try {
          const root = setup(() =>
            Popover({
              id: "portal-popover",
              defaultOpen: true,
              portalTarget: portalHost,
              trigger: "Portaled Trigger",
              content: "Portaled Popover Content",
            }),
          );

          expect(root.querySelector("[data-part='content']")).toBeNull();
          expect(portalHost.querySelector("[data-part='content']")).not.toBeNull();
          expect(portalHost.querySelector("[data-part='content']")?.textContent).toContain(
            "Portaled Popover Content",
          );
        } finally {
          portalHost.remove();
        }
      });

      it("has no accessibility violations (axe)", async () => {
        const root = setup(() =>
          Popover({
            id: "axe-popover",
            defaultOpen: true,
            trigger: "Accessible Trigger",
            title: "Accessible Title",
            description: "Accessible Description",
            content: "Accessible Popover Body",
          }),
        );

        const results = await axe(root);
        expect(results).toHaveNoViolations();
      });
    });
  }
});
