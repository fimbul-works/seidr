import {
  createComponent,
  mount,
  type SeidrChild,
} from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { createDialog, Dialog } from "./index.js";

describeDualMode("Dialog", ({ getDocument, isSSR }) => {
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
      Dialog({
        id: "test-dialog",
        defaultOpen: true,
        trigger: "Open Dialog",
        title: "Test Dialog Title",
        description: "Test Dialog Description",
        content: "Dialog Content Body",
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.getAttribute("data-component")).toBe("dialog");
    expect(triggerEl.getAttribute("aria-haspopup")).toBe("dialog");
    expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

    const contentEl = (isSSR ? root : getDocument()).querySelector(
      "[data-component='dialog'][data-part='content']",
    ) as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.getAttribute("role")).toBe("dialog");
    expect(contentEl.getAttribute("id")).toBe("test-dialog-content");
    expect(String(contentEl.getAttribute("tabindex"))).toBe("-1");
    expect(contentEl.getAttribute("aria-labelledby")).toBe("test-dialog-title");
    expect(contentEl.getAttribute("aria-describedby")).toBe("test-dialog-description");

    const overlayEl = (isSSR ? root : getDocument()).querySelector(
      "[data-component='dialog'][data-part='overlay']",
    ) as HTMLElement;
    expect(overlayEl).not.toBeNull();
    expect(overlayEl.getAttribute("aria-hidden")).toBe("true");

    if (!isSSR) {
      expect(contentEl.parentElement).toBe(getDocument().body);
      expect(overlayEl.parentElement).toBe(getDocument().body);
      expect(root.contains(contentEl)).toBe(false);
    }

    const titleEl = contentEl.querySelector("[data-part='title']") as HTMLElement;
    expect(titleEl).not.toBeNull();
    expect(titleEl.getAttribute("id")).toBe("test-dialog-title");
    expect(titleEl.textContent).toBe("Test Dialog Title");

    const descEl = contentEl.querySelector("[data-part='description']") as HTMLElement;
    expect(descEl).not.toBeNull();
    expect(descEl.getAttribute("id")).toBe("test-dialog-description");
    expect(descEl.textContent).toBe("Test Dialog Description");

    const closeBtn = contentEl.querySelector("[data-part='close-button']") as HTMLElement;
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.getAttribute("aria-label")).toBe("Close");
  });

  it("supports fine-grained composition via createDialog (Tier 2)", () => {
    const root = setup(() => {
      const dlg = createDialog({ id: "fg-dialog", defaultOpen: true });
      return dlg.Root({}, [
        dlg.Trigger({ id: "custom-trigger" }, "Fine Grained Trigger"),
        dlg.Portal({}, [
          dlg.Overlay({ id: "custom-overlay" }),
          dlg.Content({ id: "custom-content" }, [
            dlg.Title({}, "Fine Grained Title"),
            dlg.Description({}, "Fine Grained Description"),
            dlg.CloseButton({ id: "custom-close" }, "Close Me"),
          ]),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("#custom-trigger") as HTMLElement;
    expect(triggerEl).not.toBeNull();

    const contentEl = (isSSR ? root : getDocument()).querySelector("#custom-content") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.getAttribute("role")).toBe("dialog");
  });

  if (!isSSR) {
    describe("Browser Interactivity", () => {
      it("toggles open state when clicking the trigger", () => {
        const root = setup(() =>
          Dialog({
            id: "interactive-dialog",
            defaultOpen: false,
            trigger: "Open",
            title: "Interactive Title",
            content: "Interactive Body",
          }),
        );

        const trigger = root.querySelector("[data-part='trigger']") as HTMLButtonElement;
        expect(getDocument().querySelector("[data-component='dialog'][data-part='content']")).toBeNull();
        expect(trigger.getAttribute("aria-expanded")).toBe("false");

        trigger.click();
        expect(getDocument().querySelector("[data-component='dialog'][data-part='content']")).not.toBeNull();
        expect(trigger.getAttribute("aria-expanded")).toBe("true");

        trigger.click();
        expect(getDocument().querySelector("[data-component='dialog'][data-part='content']")).toBeNull();
        expect(trigger.getAttribute("aria-expanded")).toBe("false");
      });

      it("closes when pressing Escape key", () => {
        setup(() =>
          Dialog({
            id: "escape-dialog",
            defaultOpen: true,
            trigger: "Trigger",
            content: "Content",
          }),
        );

        expect(getDocument().querySelector("[data-component='dialog'][data-part='content']")).not.toBeNull();

        getDocument().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        expect(getDocument().querySelector("[data-component='dialog'][data-part='content']")).toBeNull();
      });

      it("closes when clicking CloseButton", () => {
        setup(() =>
          Dialog({
            id: "close-dialog",
            defaultOpen: true,
            trigger: "Trigger",
            content: "Content",
          }),
        );

        const closeBtn = getDocument().querySelector(
          "[data-component='dialog'][data-part='close-button']",
        ) as HTMLButtonElement;
        expect(closeBtn).not.toBeNull();

        closeBtn.click();
        expect(getDocument().querySelector("[data-component='dialog'][data-part='content']")).toBeNull();
      });

      it("closes when clicking outside the dialog content", async () => {
        const outsideTarget = getDocument().createElement("button");
        outsideTarget.textContent = "Outside Button";
        getDocument().body.appendChild(outsideTarget);

        try {
          setup(() =>
            Dialog({
              id: "outside-dialog",
              defaultOpen: true,
              trigger: "Trigger",
              content: "Click Outside to Close",
            }),
          );

          expect(getDocument().querySelector("[data-component='dialog'][data-part='content']")).not.toBeNull();

          // Wait for useInteractOutside pointerdown listener registration
          await new Promise((resolve) => setTimeout(resolve, 10));

          outsideTarget.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
          expect(getDocument().querySelector("[data-component='dialog'][data-part='content']")).toBeNull();
        } finally {
          outsideTarget.remove();
        }
      });

      it("prevents body scroll while open and restores when closed", () => {
        getDocument().body.style.overflow = "visible";

        let dlgInstance!: ReturnType<typeof createDialog>;
        setup(() => {
          dlgInstance = createDialog({ id: "scroll-dialog", defaultOpen: false });
          return dlgInstance.Root({}, [
            dlgInstance.Trigger({}, "Trigger"),
            dlgInstance.Content({}, "Content"),
          ]);
        });

        expect(getDocument().body.style.overflow).toBe("visible");

        dlgInstance.open();
        expect(getDocument().body.style.overflow).toBe("hidden");

        dlgInstance.close();
        expect(getDocument().body.style.overflow).toBe("visible");
      });

      it("has no accessibility violations (axe)", async () => {
        const root = setup(() =>
          Dialog({
            id: "a11y-dialog",
            defaultOpen: true,
            trigger: "Open Accessible Dialog",
            title: "Accessible Dialog Title",
            description: "Accessible Dialog Description",
            content: "Body content with good contrast.",
          }),
        );

        const results = await axe(root);
        expect(results).toHaveNoViolations();
      });
    });
  }
});
