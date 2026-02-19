import { expect, it } from "vitest";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { flushSync } from "../seidr/scheduler";
import { describeDualMode } from "../test-setup/dual-mode";

describeDualMode("App Parity Test", ({ isSSR }) => {
  it("should render a component with attributes, styles, and reactivity perfectly match browser", () => {
    const fontSize = new Seidr("16px");

    const App = () => {
      const el = $(
        "div",
        {
          "data-test-id": "app-root",
          style: {
            color: "blue",
            fontSize: fontSize,
            backgroundColor: "white",
          },
        },
        [$("span", { style: "font-weight: bold;" }, ["Hello World"])],
      );

      el.dataset.customInfo = "123";

      return el;
    };

    const appEl = App();

    expect(appEl.tagName).toBe("DIV");
    expect(appEl.getAttribute("data-test-id")).toBe("app-root");
    expect(appEl.dataset.customInfo).toBe("123");

    const styleAttr = appEl.getAttribute("style");
    expect(styleAttr).toContain("color: blue");
    expect(styleAttr).toContain("font-size: 16px");

    fontSize.value = "20px";
    flushSync();

    const updatedStyle = appEl.getAttribute("style");
    expect(updatedStyle).toContain("font-size: 20px");

    if (isSSR) {
      expect(appEl.toString()).toContain('data-custom-info="123"');
    } else {
      expect(appEl.outerHTML).toContain('data-custom-info="123"');
    }
  });
});
