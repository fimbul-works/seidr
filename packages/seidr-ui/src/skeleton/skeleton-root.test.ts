import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { Skeleton, SkeletonRoot } from "./skeleton-root.js";

describeDualMode("Skeleton", ({ getDocument, isSSR }) => {
  let container: HTMLElement;

  afterEach(() => {
    container?.remove();
  });

  it("should render a div with role='group' and aria-busy='true' by default", () => {
    container = Skeleton();
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("div");
    expect(container.getAttribute("role")).toBe("group");
    expect(container.getAttribute("aria-busy")).toBe("true");
    expect(container.hasAttribute("data-visible")).toBe(true);
    expect(container.hasAttribute("data-animate")).toBe(true);
  });

  it("should support Skeleton.Root namespace alias", () => {
    container = SkeletonRoot();
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("div");
    expect(container.getAttribute("role")).toBe("group");
  });

  it("should omit aria-busy and data-visible when visible is false", () => {
    container = Skeleton({ visible: false });
    getDocument().body.appendChild(container);

    expect(container.getAttribute("aria-busy")).toBeNull();
    expect(container.hasAttribute("data-visible")).toBe(false);
  });

  it("should omit data-animate when animate is false", () => {
    container = Skeleton({ animate: false });
    getDocument().body.appendChild(container);

    expect(container.hasAttribute("data-animate")).toBe(false);
  });

  it("should apply circle dimensions and rounded border-radius", () => {
    container = Skeleton({ circle: true, height: 48 });
    getDocument().body.appendChild(container);

    expect(container.style.borderRadius).toBe("9999px");
    expect(container.style.width).toBe("48px");
    expect(container.style.height).toBe("48px");
  });

  it("should handle custom radius, width, and height", () => {
    container = Skeleton({ width: 200, height: 24, radius: 8 });
    getDocument().body.appendChild(container);

    expect(container.style.width).toBe("200px");
    expect(container.style.height).toBe("24px");
    expect(container.style.borderRadius).toBe("8px");
  });

  if (!isSSR) {
    it("should have no accessibility violations", async () => {
      container = Skeleton({ width: 100, height: 20 });
      getDocument().body.appendChild(container);

      // @ts-expect-error vitest-axe types
      expect(await axe(container)).toHaveNoViolations();
    });
  }
});
