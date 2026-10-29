import { createComponent, mount, type SeidrChild } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { createSlider, Slider } from "./index.js";

describeDualMode("Slider", ({ getDocument, isSSR }) => {
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
      const slider = createSlider({ id: "test-slider", defaultValue: 40 });
      return slider.Root({}, [
        slider.Label({}, "Volume"),
        slider.ValueLabel({}),
        slider.Track({}, [slider.Fill({}), slider.Thumb({ index: 0 }, slider.Input({ index: 0 }))]),
      ]);
    });

    const rootEl = root.querySelector("#test-slider") as HTMLElement;
    const labelEl = root.querySelector("label") as HTMLLabelElement;
    const valueLabelEl = root.querySelector("[data-part='value-label']") as HTMLElement;
    const trackEl = root.querySelector("[data-part='track']") as HTMLElement;
    const fillEl = root.querySelector("[data-part='fill']") as HTMLElement;
    const thumbEl = root.querySelector("[role='slider']") as HTMLElement;
    const inputEl = root.querySelector("[data-part='input']") as HTMLInputElement;

    expect(rootEl).not.toBeNull();
    expect(labelEl).not.toBeNull();
    expect(valueLabelEl).not.toBeNull();
    expect(trackEl).not.toBeNull();
    expect(fillEl).not.toBeNull();
    expect(thumbEl).not.toBeNull();
    expect(inputEl).not.toBeNull();

    // Semantic data-component and data-part annotations
    expect(rootEl.getAttribute("data-component")).toBe("slider");
    expect(rootEl.getAttribute("data-part")).toBe("root");
    expect(labelEl.getAttribute("data-component")).toBe("slider");
    expect(labelEl.getAttribute("data-part")).toBe("label");
    expect(valueLabelEl.getAttribute("data-component")).toBe("slider");
    expect(valueLabelEl.getAttribute("data-part")).toBe("value-label");
    expect(trackEl.getAttribute("data-component")).toBe("slider");
    expect(trackEl.getAttribute("data-part")).toBe("track");
    expect(fillEl.getAttribute("data-component")).toBe("slider");
    expect(fillEl.getAttribute("data-part")).toBe("fill");
    expect(thumbEl.getAttribute("data-component")).toBe("slider");
    expect(thumbEl.getAttribute("data-part")).toBe("thumb");
    expect(inputEl.getAttribute("data-component")).toBe("slider");
    expect(inputEl.getAttribute("data-part")).toBe("input");

    // WAI-ARIA roles & attributes
    expect(rootEl.getAttribute("role")).toBe("group");
    expect(rootEl.getAttribute("data-orientation")).toBe("horizontal");
    expect(thumbEl.getAttribute("role")).toBe("slider");
    expect(String(thumbEl.getAttribute("tabindex"))).toBe("0");
    expect(String(thumbEl.getAttribute("aria-valuemin"))).toBe("0");
    expect(String(thumbEl.getAttribute("aria-valuemax"))).toBe("100");
    expect(String(thumbEl.getAttribute("aria-valuenow"))).toBe("40");
    expect(thumbEl.getAttribute("aria-orientation")).toBe("horizontal");

    // Native hidden input
    expect(String(inputEl.getAttribute("tabindex"))).toBe("-1");
    expect(String(inputEl.getAttribute("min"))).toBe("0");
    expect(String(inputEl.getAttribute("max"))).toBe("100");
    expect(String(inputEl.getAttribute("value"))).toBe("40");
  });

  it("should support values() as a callable synchronous getter", () => {
    let capturedValues: number[] = [];

    setup(() => {
      const slider = createSlider({ id: "callable-slider", defaultValue: [25, 75] });
      capturedValues = slider.values();
      return slider.Root({}, [
        slider.Track({}, [slider.Fill({}), slider.Thumb({ index: 0 }), slider.Thumb({ index: 1 })]),
      ]);
    });

    expect(capturedValues).toEqual([25, 75]);
  });

  it("should handle keyboard navigation on thumb", () => {
    let instanceRef: any;

    const root = setup(() => {
      const slider = createSlider({ id: "kb-slider", defaultValue: 50, step: 5 });
      instanceRef = slider;
      return slider.Root({}, [slider.Track({}, [slider.Fill({}), slider.Thumb({ index: 0 })])]);
    });

    const thumb = root.querySelector("[role='slider']") as HTMLElement;

    if (!isSSR) {
      // ArrowRight: 50 -> 55
      thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(instanceRef.values()).toEqual([55]);
      expect(thumb.getAttribute("aria-valuenow")).toBe("55");

      // ArrowLeft: 55 -> 50
      thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      expect(instanceRef.values()).toEqual([50]);

      // PageUp: 50 -> 60 (pageSize is 10)
      thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true }));
      expect(instanceRef.values()).toEqual([60]);

      // PageDown: 60 -> 50
      thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true }));
      expect(instanceRef.values()).toEqual([50]);

      // End: 50 -> 100
      thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      expect(instanceRef.values()).toEqual([100]);

      // Home: 100 -> 0
      thumb.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      expect(instanceRef.values()).toEqual([0]);
    }
  });

  it("should support vertical orientation", () => {
    const root = setup(() => {
      const slider = createSlider({ id: "vert-slider", orientation: "vertical", defaultValue: 30 });
      return slider.Root({}, [slider.Track({}, [slider.Fill({}), slider.Thumb({ index: 0 })])]);
    });

    const rootEl = root.querySelector("#vert-slider") as HTMLElement;
    const thumbEl = root.querySelector("[role='slider']") as HTMLElement;

    expect(rootEl.getAttribute("data-orientation")).toBe("vertical");
    expect(thumbEl.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("should enforce disabled state", () => {
    let instanceRef: any;

    const root = setup(() => {
      const slider = createSlider({ id: "dis-slider", disabled: true, defaultValue: 50 });
      instanceRef = slider;
      return slider.Root({}, [slider.Track({}, [slider.Fill({}), slider.Thumb({ index: 0 })])]);
    });

    const rootEl = root.querySelector("#dis-slider") as HTMLElement;
    const thumbEl = root.querySelector("[role='slider']") as HTMLElement;

    expect(rootEl.hasAttribute("data-disabled")).toBe(true);
    expect(thumbEl.getAttribute("aria-disabled")).toBe("true");
    expect(thumbEl.hasAttribute("tabindex")).toBe(false);

    if (!isSSR) {
      thumbEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      expect(instanceRef.values()).toEqual([50]);
    }
  });

  it("should support all-in-one Slider component", () => {
    const root = setup(() =>
      Slider({
        id: "aio-slider",
        label: "Brightness",
        valueLabel: true,
        defaultValue: 65,
        description: "Adjust screen brightness",
      }),
    );

    const rootEl = root.querySelector("#aio-slider") as HTMLElement;
    const labelEl = root.querySelector("label");
    const thumbEl = root.querySelector("[role='slider']");
    const valueLabelEl = root.querySelector("[data-part='value-label']");
    const descEl = root.querySelector("[data-part='description']");

    expect(rootEl).not.toBeNull();
    expect(labelEl?.textContent).toBe("Brightness");
    expect(valueLabelEl?.textContent).toBe("65");
    expect(String(thumbEl?.getAttribute("aria-valuenow"))).toBe("65");
    expect(descEl?.textContent).toBe("Adjust screen brightness");
  });

  it("should support multi-thumb range slider", () => {
    const root = setup(() =>
      Slider({
        id: "range-slider",
        defaultValue: [20, 80],
        thumbs: 2,
      }),
    );

    const thumbs = root.querySelectorAll("[role='slider']");
    expect(thumbs.length).toBe(2);
    expect(String(thumbs[0]?.getAttribute("aria-valuenow"))).toBe("20");
    expect(String(thumbs[1]?.getAttribute("aria-valuenow"))).toBe("80");
  });

  it("should pass axe accessibility checks", async () => {
    if (isSSR) return; // Axe requires full DOM

    const root = setup(() =>
      Slider({
        id: "axe-slider",
        label: "Contrast",
        defaultValue: 50,
      }),
    );

    const results = await axe(root);
    // @ts-expect-error vitest-axe types
    expect(results).toHaveNoViolations();
  });
});
