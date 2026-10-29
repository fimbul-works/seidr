import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { createProgress, Progress } from "./index.js";

describeDualMode("Progress", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => SeidrChild) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  it("should render default structure, roles, and semantic data attributes", () => {
    const root = setup(() => {
      const p = createProgress({ id: "test-progress" });
      return p.Root({}, [p.Label({}, "Task Progress"), p.ValueLabel({}), p.Track({}, [p.Fill({})])]);
    });

    const rootEl = root.querySelector("[role='progressbar']") as HTMLElement;
    const labelEl = root.querySelector("[data-part='label']") as HTMLElement;
    const valueLabelEl = root.querySelector("[data-part='value-label']") as HTMLElement;
    const trackEl = root.querySelector("[data-part='track']") as HTMLElement;
    const fillEl = root.querySelector("[data-part='fill']") as HTMLElement;

    expect(rootEl).not.toBeNull();
    expect(labelEl).not.toBeNull();
    expect(valueLabelEl).not.toBeNull();
    expect(trackEl).not.toBeNull();
    expect(fillEl).not.toBeNull();

    // Semantic data attributes
    expect(rootEl.getAttribute("data-component")).toBe("progress");
    expect(rootEl.getAttribute("data-part")).toBe("root");
    expect(labelEl.getAttribute("data-component")).toBe("progress");
    expect(labelEl.getAttribute("data-part")).toBe("label");
    expect(valueLabelEl.getAttribute("data-component")).toBe("progress");
    expect(valueLabelEl.getAttribute("data-part")).toBe("value-label");
    expect(trackEl.getAttribute("data-component")).toBe("progress");
    expect(trackEl.getAttribute("data-part")).toBe("track");
    expect(fillEl.getAttribute("data-component")).toBe("progress");
    expect(fillEl.getAttribute("data-part")).toBe("fill");

    // WAI-ARIA
    expect(String(rootEl.getAttribute("aria-valuemin"))).toBe("0");
    expect(String(rootEl.getAttribute("aria-valuemax"))).toBe("100");
    expect(String(rootEl.getAttribute("aria-valuenow"))).toBe("0");
    expect(rootEl.getAttribute("aria-valuetext")).toBe("0%");
    expect(valueLabelEl.textContent).toBe("0%");
    expect(rootEl.getAttribute("aria-labelledby")).toBe("test-progress-label");
    expect(rootEl.getAttribute("data-progress")).toBe("loading");
  });

  it("should support callable synchronous getters value() and valuePercent()", () => {
    let capturedVal = 0;
    let capturedPercent = 0;

    setup(() => {
      const p = createProgress({ value: 45, minValue: 0, maxValue: 100 });
      capturedVal = p.value();
      capturedPercent = p.valuePercent();
      return p.Root();
    });

    expect(capturedVal).toBe(45);
    expect(capturedPercent).toBe(0.45);
  });

  it("should clamp values to minValue and maxValue", () => {
    const root = setup(() =>
      Progress({
        id: "clamped-progress",
        value: 150,
        minValue: 10,
        maxValue: 80,
        valueLabel: true,
      }),
    );

    const rootEl = root.querySelector("[role='progressbar']") as HTMLElement;
    expect(String(rootEl.getAttribute("aria-valuenow"))).toBe("80");
    expect(rootEl.getAttribute("data-progress")).toBe("complete");
  });

  it("should support custom getValueLabel", () => {
    const root = setup(() =>
      Progress({
        value: 3,
        minValue: 0,
        maxValue: 10,
        valueLabel: true,
        getValueLabel: ({ value, max }) => `${value} of ${max} completed`,
      }),
    );

    const rootEl = root.querySelector("[role='progressbar']") as HTMLElement;
    const valueLabelEl = root.querySelector("[data-part='value-label']") as HTMLElement;

    expect(rootEl.getAttribute("aria-valuetext")).toBe("3 of 10 completed");
    expect(valueLabelEl.textContent).toBe("3 of 10 completed");
  });

  it("should handle indeterminate state", () => {
    const root = setup(() =>
      Progress({
        id: "indet-progress",
        indeterminate: true,
        label: "Syncing...",
        valueLabel: true,
      }),
    );

    const rootEl = root.querySelector("[role='progressbar']") as HTMLElement;
    const fillEl = root.querySelector("[data-part='fill']") as HTMLElement;

    expect(rootEl.hasAttribute("aria-valuenow")).toBe(false);
    expect(rootEl.hasAttribute("aria-valuetext")).toBe(false);
    expect(rootEl.hasAttribute("data-indeterminate")).toBe(true);
    expect(rootEl.hasAttribute("data-progress")).toBe(false);
    expect(fillEl.style.width).toBe("");
  });

  it("should react to reactive value updates", () => {
    const val = createValue(20, { id: "progress-test-val" });

    const root = setup(() =>
      Progress({
        value: val,
        valueLabel: true,
      }),
    );

    const rootEl = root.querySelector("[role='progressbar']") as HTMLElement;
    const valueLabelEl = root.querySelector("[data-part='value-label']") as HTMLElement;

    expect(String(rootEl.getAttribute("aria-valuenow"))).toBe("20");
    expect(valueLabelEl.textContent).toBe("20%");

    val(100);

    expect(String(rootEl.getAttribute("aria-valuenow"))).toBe("100");
    expect(valueLabelEl.textContent).toBe("100%");
    expect(rootEl.getAttribute("data-progress")).toBe("complete");
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return; // Axe requires full DOM

    const root = setup(() =>
      Progress({
        id: "axe-progress",
        label: "Download progress",
        value: 50,
        valueLabel: true,
      }),
    );

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });

  it("should render Header containing Label and ValueLabel in Tier 1", () => {
    const root = setup(() =>
      Progress({
        id: "header-progress",
        label: "Storage Space",
        value: 40,
        valueLabel: true,
      }),
    );

    const headerEl = root.querySelector("[data-part='header']") as HTMLElement;
    expect(headerEl).not.toBeNull();
    expect(headerEl.getAttribute("data-component")).toBe("progress");
    expect(headerEl.querySelector("[data-part='label']")).not.toBeNull();
    expect(headerEl.querySelector("[data-part='value-label']")).not.toBeNull();
  });
});
