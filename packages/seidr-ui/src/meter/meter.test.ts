import { createComponent, createValue, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { createMeter, Meter } from "./index.js";

describeDualMode("Meter", ({ getDocument, isSSR }) => {
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
      const m = createMeter({ id: "test-meter" });
      return m.Root({}, [m.Label({}, "Storage Space"), m.ValueLabel({}), m.Track({}, [m.Fill({})])]);
    });

    const rootEl = root.querySelector("[role='meter']") as HTMLElement;
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
    expect(rootEl.getAttribute("data-component")).toBe("meter");
    expect(rootEl.getAttribute("data-part")).toBe("root");
    expect(labelEl.getAttribute("data-component")).toBe("meter");
    expect(labelEl.getAttribute("data-part")).toBe("label");
    expect(valueLabelEl.getAttribute("data-component")).toBe("meter");
    expect(valueLabelEl.getAttribute("data-part")).toBe("value-label");
    expect(trackEl.getAttribute("data-component")).toBe("meter");
    expect(trackEl.getAttribute("data-part")).toBe("track");
    expect(fillEl.getAttribute("data-component")).toBe("meter");
    expect(fillEl.getAttribute("data-part")).toBe("fill");

    // WAI-ARIA
    expect(String(rootEl.getAttribute("aria-valuemin"))).toBe("0");
    expect(String(rootEl.getAttribute("aria-valuemax"))).toBe("100");
    expect(String(rootEl.getAttribute("aria-valuenow"))).toBe("0");
    expect(rootEl.getAttribute("aria-valuetext")).toBe("0%");
    expect(valueLabelEl.textContent).toBe("0%");
    expect(rootEl.getAttribute("aria-labelledby")).toBe("test-meter-label");
  });

  it("should support callable synchronous getters value() and valuePercent()", () => {
    let capturedVal = 0;
    let capturedPercent = 0;

    setup(() => {
      const m = createMeter({ value: 35, minValue: 0, maxValue: 100 });
      capturedVal = m.value();
      capturedPercent = m.valuePercent();
      return m.Root();
    });

    expect(capturedVal).toBe(35);
    expect(capturedPercent).toBe(0.35);
  });

  it("should clamp values to minValue and maxValue", () => {
    const root = setup(() =>
      Meter({
        id: "clamped-meter",
        value: 120,
        minValue: 10,
        maxValue: 90,
        valueLabel: true,
      }),
    );

    const rootEl = root.querySelector("[role='meter']") as HTMLElement;
    expect(String(rootEl.getAttribute("aria-valuenow"))).toBe("90");
    expect(rootEl.getAttribute("aria-valuetext")).toBe("100%");
  });

  it("should support custom getValueLabel", () => {
    const root = setup(() =>
      Meter({
        value: 64,
        minValue: 0,
        maxValue: 128,
        valueLabel: true,
        getValueLabel: ({ value, max }) => `${value} GB of ${max} GB`,
      }),
    );

    const rootEl = root.querySelector("[role='meter']") as HTMLElement;
    const valueLabelEl = root.querySelector("[data-part='value-label']") as HTMLElement;

    expect(rootEl.getAttribute("aria-valuetext")).toBe("64 GB of 128 GB");
    expect(valueLabelEl.textContent).toBe("64 GB of 128 GB");
  });

  it("should react to reactive value updates", () => {
    const val = createValue(25, { id: "meter-test-val" });

    const root = setup(() =>
      Meter({
        value: val,
        valueLabel: true,
      }),
    );

    const rootEl = root.querySelector("[role='meter']") as HTMLElement;
    const valueLabelEl = root.querySelector("[data-part='value-label']") as HTMLElement;

    expect(String(rootEl.getAttribute("aria-valuenow"))).toBe("25");
    expect(valueLabelEl.textContent).toBe("25%");

    val(75);

    expect(String(rootEl.getAttribute("aria-valuenow"))).toBe("75");
    expect(valueLabelEl.textContent).toBe("75%");
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return; // Axe requires full DOM

    const root = setup(() =>
      Meter({
        id: "axe-meter",
        label: "Storage capacity",
        value: 70,
        valueLabel: true,
      }),
    );

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });

  it("should render Header containing Label and ValueLabel in Tier 1", () => {
    const root = setup(() =>
      Meter({
        id: "header-meter",
        label: "Storage Space",
        value: 40,
        valueLabel: true,
      }),
    );

    const headerEl = root.querySelector("[data-part='header']") as HTMLElement;
    expect(headerEl).not.toBeNull();
    expect(headerEl.getAttribute("data-component")).toBe("meter");
    expect(headerEl.querySelector("[data-part='label']")).not.toBeNull();
    expect(headerEl.querySelector("[data-part='value-label']")).not.toBeNull();
  });
});
