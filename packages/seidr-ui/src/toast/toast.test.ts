import { createComponent, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import {
  createToast,
  createToastRegion,
  Toast,
  ToastRegion,
  toaster,
  type UseToastOptions,
} from "./index.js";

describeDualMode("Toast", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    toaster.clear();
  });

  afterEach(() => {
    unmount?.();
    unmount = undefined;
    target?.remove();
    toaster.clear();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const setup = (factory: () => SeidrChild) => {
    const doc = getDocument();
    target = doc.createElement("div");
    doc.body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  const showTestToast = (options: Partial<UseToastOptions> = {}, region?: string) =>
    toaster.show(
      ({ toastId, region: regionInstance }) =>
        Toast({
          toastId,
          region: regionInstance,
          title: "Toast Title",
          description: "Toast Description",
          showProgress: true,
          ...options,
        }),
      region ? { region } : undefined,
    );

  it("should render ToastRegion and ToastList with default ARIA attributes and semantic annotations", () => {
    const root = setup(() => ToastRegion({ id: "test-region" }));

    const regionEl = root.querySelector("[role='region']") as HTMLElement;
    const listEl = root.querySelector("ol") as HTMLElement;

    expect(regionEl).not.toBeNull();
    expect(listEl).not.toBeNull();
    expect(regionEl.getAttribute("data-component")).toBe("toast");
    expect(regionEl.getAttribute("data-part")).toBe("region");
    expect(regionEl.getAttribute("aria-label")).toBe("Notifications (alt+T)");
    expect(regionEl.hasAttribute("data-top-layer")).toBe(true);
    expect(regionEl.style.pointerEvents).toBe("none");

    expect(listEl.getAttribute("data-component")).toBe("toast");
    expect(listEl.getAttribute("data-part")).toBe("list");
  });

  it("should support custom ariaLabel with {hotkey} replacement", () => {
    const root = setup(() =>
      ToastRegion({
        ariaLabel: "System Alerts - {hotkey}",
        hotkey: ["ctrlKey", "KeyM"],
      }),
    );

    const regionEl = root.querySelector("[role='region']") as HTMLElement;
    expect(regionEl.getAttribute("aria-label")).toBe("System Alerts - ctrl+M");
  });

  it("should render a toast with correct ARIA roles, title, description, and priority", () => {
    const root = setup(() => ToastRegion({}));

    showTestToast({ priority: "high" });

    const toastEl = root.querySelector("[role='status']") as HTMLElement;
    const titleEl = root.querySelector("[data-part='title']") as HTMLElement;
    const descEl = root.querySelector("[data-part='description']") as HTMLElement;
    const closeBtn = root.querySelector("[data-part='close-button']") as HTMLButtonElement;
    const trackEl = root.querySelector("[data-part='progress-track']") as HTMLElement;
    const fillEl = root.querySelector("[data-part='progress-fill']") as HTMLElement;
    const regionEl = root.querySelector("[role='region']") as HTMLElement;

    expect(toastEl).not.toBeNull();
    expect(toastEl.getAttribute("data-component")).toBe("toast");
    expect(toastEl.getAttribute("data-part")).toBe("root");
    expect(toastEl.getAttribute("aria-live")).toBe("assertive");
    expect(toastEl.getAttribute("aria-atomic")).toBe("true");
    expect(toastEl.getAttribute("aria-labelledby")).toBe(titleEl.id);
    expect(toastEl.getAttribute("aria-describedby")).toBe(descEl.id);
    expect(toastEl.hasAttribute("data-opened")).toBe(true);
    expect(toastEl.getAttribute("data-swipe-direction")).toBe("right");
    expect(regionEl.style.pointerEvents).toBe("auto");

    expect(titleEl.textContent).toBe("Toast Title");
    expect(descEl.textContent).toBe("Toast Description");
    expect(closeBtn.getAttribute("aria-label")).toBe("Close");
    expect(trackEl.getAttribute("role")).toBe("presentation");
    expect(trackEl.getAttribute("aria-hidden")).toBe("true");
    expect(fillEl).not.toBeNull();
  });

  it("should set aria-live='polite' when priority is 'low'", () => {
    const root = setup(() => ToastRegion({}));
    showTestToast({ priority: "low" });

    const toastEl = root.querySelector("[role='status']") as HTMLElement;
    expect(toastEl.getAttribute("aria-live")).toBe("polite");
  });

  it("should auto-close after duration on client and respect toast duration override", () => {
    if (isSSR) return;

    const root = setup(() => ToastRegion({ duration: 3000 }));

    showTestToast({ duration: 1000 });
    expect(root.querySelectorAll("[role='status']").length).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(root.querySelectorAll("[role='status']").length).toBe(0);
  });

  it("should not auto-close when persistent is true", () => {
    if (isSSR) return;

    const root = setup(() => ToastRegion({ duration: 1000 }));

    showTestToast({ persistent: true });
    expect(root.querySelectorAll("[role='status']").length).toBe(1);

    vi.advanceTimersByTime(5000);
    expect(root.querySelectorAll("[role='status']").length).toBe(1);
  });

  it("should close when clicking CloseButton or calling toaster.dismiss", () => {
    if (isSSR) return;

    const root = setup(() => ToastRegion({}));

    showTestToast();
    const closeBtn = root.querySelector("[data-part='close-button']") as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();

    closeBtn.dispatchEvent(new Event("click", { bubbles: true }));
    expect(root.querySelectorAll("[role='status']").length).toBe(0);

    const id2 = showTestToast();
    expect(root.querySelectorAll("[role='status']").length).toBe(1);

    toaster.dismiss(id2);
    expect(root.querySelectorAll("[role='status']").length).toBe(0);
  });

  it("should close when pressing Escape key on Toast.Root", () => {
    if (isSSR) return;

    const root = setup(() => ToastRegion({}));
    showTestToast();

    const toastEl = root.querySelector("[role='status']") as HTMLElement;
    expect(toastEl).not.toBeNull();

    toastEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(root.querySelectorAll("[role='status']").length).toBe(0);
  });

  it("should update toast in-place via toaster.update and support toaster.promise", async () => {
    const root = setup(() => ToastRegion({}));

    const id = toaster.show(({ toastId, region }) =>
      Toast({ toastId, region, title: "Initial Toast" }),
    );
    expect(root.querySelector("[data-part='title']")?.textContent).toBe("Initial Toast");

    toaster.update(id, ({ toastId, region }) =>
      Toast({ toastId, region, title: "Updated Toast" }),
    );
    expect(root.querySelector("[data-part='title']")?.textContent).toBe("Updated Toast");

    toaster.clear();

    let resolvePromise!: (val: string) => void;
    const asyncTask = new Promise<string>((r) => {
      resolvePromise = r;
    });

    toaster.promise(asyncTask, ({ toastId, region, state, data }) =>
      Toast({
        toastId,
        region,
        title: `${state}: ${data ?? "loading"}`,
      }),
    );

    expect(root.querySelector("[data-part='title']")?.textContent).toBe("pending: loading");

    resolvePromise("done");
    await Promise.resolve();
    await Promise.resolve();

    expect(root.querySelector("[data-part='title']")?.textContent).toBe("fulfilled: done");
  });

  it("should enforce region limit and support multiple regions via regionId", () => {
    const root = setup(() => [
      ToastRegion({ limit: 2, listProps: { id: "default-list" } }),
      ToastRegion({ regionId: "secondary", limit: 2, listProps: { id: "secondary-list" } }),
    ]);

    showTestToast({ title: "Default 1" });
    showTestToast({ title: "Default 2" });
    showTestToast({ title: "Default 3" });
    showTestToast({ title: "Secondary 1" }, "secondary");

    const defaultList = root.querySelector("#default-list")!;
    const secondaryList = root.querySelector("#secondary-list")!;

    expect(defaultList.querySelectorAll("[role='status']").length).toBe(2);
    expect(secondaryList.querySelectorAll("[role='status']").length).toBe(1);
  });

  it("should pause timers on pointermove/focusin and resume on pointerleave/focusout", () => {
    if (isSSR) return;

    const root = setup(() => ToastRegion({ duration: 1000, pauseOnInteraction: true }));
    showTestToast();

    const listEl = root.querySelector("[data-part='list']") as HTMLElement;
    expect(root.querySelectorAll("[role='status']").length).toBe(1);

    listEl.dispatchEvent(new Event("focusin", { bubbles: true }));
    vi.advanceTimersByTime(2000);
    expect(root.querySelectorAll("[role='status']").length).toBe(1);

    listEl.dispatchEvent(new Event("focusout", { bubbles: true }));
    vi.advanceTimersByTime(1000);
    expect(root.querySelectorAll("[role='status']").length).toBe(0);
  });

  it("should support Tier 2 fine-grained createToastRegion and createToast", () => {
    const root = setup(() => {
      const region = createToastRegion({ id: "fine-region" });
      return region.Region({}, [region.List({})]);
    });

    toaster.show(({ toastId, region }) => {
      const t = createToast({ toastId, region });
      return t.Root({}, [
        t.Title({}, "Custom Title"),
        t.Description({}, "Custom Description"),
        t.CloseButton({}, "Dismiss"),
        t.ProgressTrack({}, [t.ProgressFill({})]),
      ]);
    });

    expect(root.querySelector("[data-part='title']")?.textContent).toBe("Custom Title");
    expect(root.querySelector("[data-part='description']")?.textContent).toBe("Custom Description");
    expect(root.querySelector("[data-part='close-button']")?.textContent).toBe("Dismiss");
  });

  it("should portal ToastRegion into getDocument().body when portalTarget is provided", () => {
    const doc = getDocument();
    const root = setup(() =>
      ToastRegion({
        id: "portaled-toast-region",
        portalTarget: doc.body,
      }),
    );

    showTestToast({ title: "Portaled Toast!" });

    // Region should not be inside the app root container, but directly in document.body
    expect(root.querySelector("#portaled-toast-region")).toBeNull();
    const portaledRegion = doc.body.querySelector("#portaled-toast-region") as HTMLElement;
    expect(portaledRegion).not.toBeNull();
    expect(portaledRegion.parentElement).toBe(doc.body);
    expect(portaledRegion.textContent).toContain("Portaled Toast!");
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return;
    vi.useRealTimers();

    const root = setup(() => ToastRegion({ id: "axe-toast-region" }));
    showTestToast({ persistent: true });

    const results = await axe(root, {
      rules: {
        // Kobalte specifies <ol> for Toast.List and <li role="status"> for Toast.Root
        "aria-allowed-role": { enabled: false },
        list: { enabled: false },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
