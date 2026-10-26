import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { Separator, SeparatorRoot } from "./separator-root.js";

describeDualMode("Separator", ({ getDocument, isSSR }) => {
  let container: HTMLElement;

  afterEach(() => {
    container?.remove();
  });

  it("should render an hr with horizontal orientation by default", () => {
    container = Separator();
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("hr");
    expect(container.getAttribute("role")).toBeNull();
    expect(container.getAttribute("data-orientation")).toBe("horizontal");
    expect(container.getAttribute("aria-orientation")).toBeNull();
  });

  it("should support Separator.Root namespace alias", () => {
    container = SeparatorRoot();
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("hr");
    expect(container.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("should assign role='separator' when rendered as a non-hr element", () => {
    container = Separator({ as: "div" });
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("div");
    expect(container.getAttribute("role")).toBe("separator");
    expect(container.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("should handle vertical orientation attributes", () => {
    container = Separator({ orientation: "vertical" });
    getDocument().body.appendChild(container);

    expect(container.getAttribute("data-orientation")).toBe("vertical");
    expect(container.getAttribute("aria-orientation")).toBe("vertical");
  });

  if (!isSSR) {
    it("should have no accessibility violations with default hr", async () => {
      container = Separator();
      getDocument().body.appendChild(container);

      // @ts-expect-error vitest-axe types
      expect(await axe(container)).toHaveNoViolations();
    });

    it("should have no accessibility violations with custom div separator", async () => {
      container = Separator({ as: "div", orientation: "vertical" });
      getDocument().body.appendChild(container);

      // @ts-expect-error vitest-axe types
      expect(await axe(container)).toHaveNoViolations();
    });
  }
});
