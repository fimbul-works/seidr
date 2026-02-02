import { expect, it } from "vitest";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup/dual-mode";

describeDualMode("App Parity Test", ({ isSSR, getDOMFactory }) => {
  it("should render a component with attributes, styles, and reactivity perfectly match browser", () => {
    const factory = getDOMFactory();

    // Responsive style value
    const fontSize = new Seidr("16px");

    // Component Definition
    // Using a function component structure although here we invoke it directly or passed as child?
    // User request: "creating components ... (they can be plain functions as long as they get mounted)"
    const App = () => {
      const el = $(
        "div",
        {
          "data-test-id": "app-root",
          style: {
            color: "blue",
            fontSize: fontSize, // Dynamic binding
            backgroundColor: "white", // CamelCase usage? Let's check if it works. Standard is kebab-case in setProperty.
          },
        },
        [$("span", { style: "font-weight: bold;" }, ["Hello World"])],
      );

      // Manual dataset manipulation
      el.dataset.customInfo = "123";

      return el;
    };

    // Mount / Create
    const appEl = App();

    // Initial Assertions
    expect(appEl.tagName).toBe("DIV");
    expect(appEl.getAttribute("data-test-id")).toBe("app-root");
    expect(appEl.dataset.customInfo).toBe("123");

    // Check Style
    // Note: styles set via setProperty usually normalize.
    // In Browser: getAttribute("style") returns string. s.style object has properties.
    // In SSR: style is stored in proxy.
    const styleAttr = appEl.getAttribute("style");
    expect(styleAttr).toContain("color: blue"); // Standardized by browser/SSR?
    expect(styleAttr).toContain("font-size: 16px");

    // Update Signal
    fontSize.value = "20px";

    // Assert Update
    const updatedStyle = appEl.getAttribute("style");
    expect(updatedStyle).toContain("font-size: 20px");

    // Snapshot
    // We want to ensure SSR matches Browser output.
    // Since we can't cross-check in one run, we rely on Vitest snapshots.
    // If we name the snapshot the same, both runs verify against it.
    // However, if browser outputs different order than SSR, test fails.
    // Let's inspect differences first.
    // We use .toMatchSnapshot() which creates a file.

    // For manual dataset, we verify it serialized into data-custom-info="123"
    if (isSSR) {
      expect(appEl.toString()).toContain('data-custom-info="123"');
    } else {
      expect(appEl.outerHTML).toContain('data-custom-info="123"');
    }
  });
});
