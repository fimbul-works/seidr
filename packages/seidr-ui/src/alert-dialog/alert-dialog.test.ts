import {
  createComponent,
  mount,
  type SeidrChild,
} from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { AlertDialog, createAlertDialog } from "./index.js";

describeDualMode("AlertDialog", ({ getDocument, isSSR }) => {
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

  it("renders default structure, role='alertdialog', and semantic data attributes (Tier 1)", () => {
    const root = setup(() =>
      AlertDialog({
        id: "test-alert-dialog",
        defaultOpen: true,
        trigger: "Delete Item",
        title: "Confirm Deletion",
        description: "Are you sure you want to permanently delete this item?",
        content: "This action cannot be undone.",
      }),
    );

    const triggerEl = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(triggerEl).not.toBeNull();
    expect(triggerEl.getAttribute("data-component")).toBe("alert-dialog");
    expect(triggerEl.getAttribute("aria-haspopup")).toBe("dialog");
    expect(triggerEl.getAttribute("aria-expanded")).toBe("true");

    const contentEl = (isSSR ? root : getDocument()).querySelector(
      "[data-component='alert-dialog'][data-part='content']",
    ) as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.getAttribute("role")).toBe("alertdialog");
    expect(contentEl.getAttribute("id")).toBe("test-alert-dialog-content");
    expect(String(contentEl.getAttribute("tabindex"))).toBe("-1");
    expect(contentEl.getAttribute("aria-labelledby")).toBe("test-alert-dialog-title");
    expect(contentEl.getAttribute("aria-describedby")).toBe("test-alert-dialog-description");

    const overlayEl = (isSSR ? root : getDocument()).querySelector(
      "[data-component='alert-dialog'][data-part='overlay']",
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
    expect(titleEl.getAttribute("id")).toBe("test-alert-dialog-title");
    expect(titleEl.textContent).toBe("Confirm Deletion");

    const descEl = contentEl.querySelector("[data-part='description']") as HTMLElement;
    expect(descEl).not.toBeNull();
    expect(descEl.getAttribute("id")).toBe("test-alert-dialog-description");
    expect(descEl.textContent).toBe("Are you sure you want to permanently delete this item?");

    const closeBtn = contentEl.querySelector("[data-part='close-button']") as HTMLElement;
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.getAttribute("aria-label")).toBe("Close");
  });

  it("supports fine-grained composition via createAlertDialog (Tier 2)", () => {
    const root = setup(() => {
      const alertDlg = createAlertDialog({ id: "fg-alert-dialog", defaultOpen: true });
      return alertDlg.Root({}, [
        alertDlg.Trigger({ id: "alert-trigger" }, "Critical Action"),
        alertDlg.Portal({}, [
          alertDlg.Overlay({ id: "alert-overlay" }),
          alertDlg.Content({ id: "alert-content" }, [
            alertDlg.Title({}, "Warning"),
            alertDlg.Description({}, "High priority system event."),
            alertDlg.CloseButton({ id: "alert-close" }, "Dismiss"),
          ]),
        ]),
      ]);
    });

    const triggerEl = root.querySelector("#alert-trigger") as HTMLElement;
    expect(triggerEl).not.toBeNull();

    const contentEl = (isSSR ? root : getDocument()).querySelector("#alert-content") as HTMLElement;
    expect(contentEl).not.toBeNull();
    expect(contentEl.getAttribute("role")).toBe("alertdialog");
    expect(contentEl.getAttribute("data-component")).toBe("alert-dialog");
  });

  if (!isSSR) {
    describe("Browser Interactivity", () => {
      it("toggles open state when clicking the trigger", () => {
        const root = setup(() =>
          AlertDialog({
            id: "interactive-alert",
            defaultOpen: false,
            trigger: "Delete",
            title: "Prompt",
            content: "Body",
          }),
        );

        const trigger = root.querySelector("[data-part='trigger']") as HTMLButtonElement;
        expect(getDocument().querySelector("[data-component='alert-dialog'][data-part='content']")).toBeNull();
        expect(trigger.getAttribute("aria-expanded")).toBe("false");

        trigger.click();
        expect(getDocument().querySelector("[data-component='alert-dialog'][data-part='content']")).not.toBeNull();
        expect(trigger.getAttribute("aria-expanded")).toBe("true");

        trigger.click();
        expect(getDocument().querySelector("[data-component='alert-dialog'][data-part='content']")).toBeNull();
        expect(trigger.getAttribute("aria-expanded")).toBe("false");
      });

      it("closes when pressing Escape key", () => {
        setup(() =>
          AlertDialog({
            id: "escape-alert",
            defaultOpen: true,
            trigger: "Trigger",
            content: "Content",
          }),
        );

        expect(getDocument().querySelector("[data-component='alert-dialog'][data-part='content']")).not.toBeNull();

        getDocument().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        expect(getDocument().querySelector("[data-component='alert-dialog'][data-part='content']")).toBeNull();
      });

      it("closes when clicking CloseButton", () => {
        setup(() =>
          AlertDialog({
            id: "close-alert",
            defaultOpen: true,
            trigger: "Trigger",
            content: "Content",
          }),
        );

        const closeBtn = getDocument().querySelector(
          "[data-component='alert-dialog'][data-part='close-button']",
        ) as HTMLButtonElement;
        expect(closeBtn).not.toBeNull();

        closeBtn.click();
        expect(getDocument().querySelector("[data-component='alert-dialog'][data-part='content']")).toBeNull();
      });

      it("does NOT close when clicking outside by default (confirmation safety)", async () => {
        const outsideTarget = getDocument().createElement("button");
        outsideTarget.textContent = "Outside Button";
        getDocument().body.appendChild(outsideTarget);

        try {
          setup(() =>
            AlertDialog({
              id: "outside-alert",
              defaultOpen: true,
              trigger: "Trigger",
              content: "Critical Alert Body",
            }),
          );

          expect(getDocument().querySelector("[data-component='alert-dialog'][data-part='content']")).not.toBeNull();

          // Wait for useInteractOutside pointerdown listener registration
          await new Promise((resolve) => setTimeout(resolve, 10));

          outsideTarget.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
          // Should remain open for safety!
          expect(getDocument().querySelector("[data-component='alert-dialog'][data-part='content']")).not.toBeNull();
        } finally {
          outsideTarget.remove();
        }
      });

      it("prevents body scroll while open and restores when closed", () => {
        getDocument().body.style.overflow = "visible";

        let alertInstance!: ReturnType<typeof createAlertDialog>;
        setup(() => {
          alertInstance = createAlertDialog({ id: "scroll-alert", defaultOpen: false });
          return alertInstance.Root({}, [
            alertInstance.Trigger({}, "Trigger"),
            alertInstance.Content({}, "Content"),
          ]);
        });

        expect(getDocument().body.style.overflow).toBe("visible");

        alertInstance.open();
        expect(getDocument().body.style.overflow).toBe("hidden");

        alertInstance.close();
        expect(getDocument().body.style.overflow).toBe("visible");
      });

      it("has no accessibility violations (axe)", async () => {
        const root = setup(() =>
          AlertDialog({
            id: "a11y-alert",
            defaultOpen: true,
            trigger: "Trigger Delete",
            title: "Confirm Deletion",
            description: "Confirming this action is permanent.",
            content: "Please confirm your action below.",
          }),
        );

        const results = await axe(root);
        expect(results).toHaveNoViolations();
      });
    });
  }
});

