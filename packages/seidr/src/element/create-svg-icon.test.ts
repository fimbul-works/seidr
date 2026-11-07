import { describeDualMode } from "../test-setup/index.js";
import { createComponent } from "../component/index.js";
import { mount } from "../dom/mount.js";
import { createValue } from "../observable/value.js";
import { beforeEach, expect, it, vi } from "vitest";
import { createSvgIcon, parseSvgAttributes } from "./create-svg-icon.js";

const SAMPLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <!-- comment inside svg -->
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
</svg>
`.trim();

describeDualMode("createSvgIcon", ({ getDocument, isSSR }) => {
  let container: HTMLDivElement;
  let document: Document;

  beforeEach(() => {
    document = getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("parseSvgAttributes extracts attributes properly", () => {
    const attrs = parseSvgAttributes(
      'xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"',
    );
    expect(attrs.xmlns).toBe("http://www.w3.org/2000/svg");
    expect(attrs.width).toBe("24");
    expect(attrs.height).toBe("24");
    expect(attrs.viewBox).toBe("0 0 24 24");
    expect(attrs.fill).toBe("none");
  });

  it("creates a direct SVG element without any wrapper", () => {
    const CheckIcon = createSvgIcon(SAMPLE_SVG);
    const App = createComponent(() => CheckIcon());
    mount(App, container);

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(container.firstElementChild).toBe(svg);
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    if (isSSR) {
      expect(svg?.innerHTML).toContain("<path");
    } else {
      expect(svg?.querySelector("path")).toBeTruthy();
    }
  });

  it("applies passed props and overrides base attributes", () => {
    const CheckIcon = createSvgIcon(SAMPLE_SVG);
    const App = createComponent(() =>
      CheckIcon({
        className: "custom-icon",
        width: 32,
        height: 32,
        "aria-hidden": "true",
      }),
    );
    mount(App, container);

    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toBe("custom-icon");
    expect(String(svg?.getAttribute("width"))).toBe("32");
    expect(String(svg?.getAttribute("height"))).toBe("32");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  it("supports reactive class and style bindings", () => {
    const activeClass = createValue("icon-default");
    const CheckIcon = createSvgIcon(SAMPLE_SVG);
    const App = createComponent(() => CheckIcon({ className: activeClass }));
    mount(App, container);

    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toBe("icon-default");

    activeClass("icon-active");
    expect(svg?.getAttribute("class")).toBe("icon-active");
  });

  it("creates independent instances when called multiple times", () => {
    const CheckIcon = createSvgIcon(SAMPLE_SVG);
    const App = createComponent(() => [
      CheckIcon({ className: "first-icon" }),
      CheckIcon({ className: "second-icon" }),
    ]);
    mount(App, container);

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
    expect(svgs[0].getAttribute("class")).toBe("first-icon");
    expect(svgs[1].getAttribute("class")).toBe("second-icon");
    expect(svgs[0]).not.toBe(svgs[1]);
  });

  it("strips xml declaration and comments correctly", () => {
    const xmlSvg = `<?xml version="1.0" encoding="UTF-8"?>
    <!-- Generator: Adobe Illustrator -->
    <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>`;

    const CircleIcon = createSvgIcon(xmlSvg);
    const App = createComponent(() => CircleIcon({ className: "circle" }));
    mount(App, container);

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 100 100");
    if (isSSR) {
      expect(svg?.innerHTML).toContain("<circle");
    } else {
      expect(svg?.querySelector("circle")).toBeTruthy();
    }
  });

  if (!isSSR) {
    it("handles click event listeners on the SVG element", () => {
      const clickSpy = vi.fn();
      const CheckIcon = createSvgIcon(SAMPLE_SVG);
      const App = createComponent(() => CheckIcon({ onclick: clickSpy }));
      mount(App, container);

      const svg = container.querySelector("svg")!;
      svg.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  }
});
