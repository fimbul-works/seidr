import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { Badge, BadgeRoot } from "./badge-root.js";

describeDualMode("Badge", ({ getDocument, isSSR }) => {
  let container: HTMLElement;

  afterEach(() => {
    container?.remove();
  });

  it("should render a span with role='status' by default", () => {
    container = Badge("New");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("span");
    expect(container.getAttribute("role")).toBe("status");
    expect(container.textContent).toBe("New");
  });

  it("should support Badge.Root namespace alias", () => {
    container = BadgeRoot("Status");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("span");
    expect(container.getAttribute("role")).toBe("status");
    expect(container.textContent).toBe("Status");
  });

  it("should support textValue for accessible labelling", () => {
    container = Badge({ textValue: "3 unread messages" }, "3");
    getDocument().body.appendChild(container);

    expect(container.getAttribute("aria-label")).toBe("3 unread messages");
    expect(container.textContent).toBe("3");
  });

  it("should allow overriding tag via 'as'", () => {
    container = Badge({ as: "div", className: "badge-pill" }, "Pro");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("div");
    expect(container.className).toBe("badge-pill");
    expect(container.getAttribute("role")).toBe("status");
  });

  if (!isSSR) {
    it("should have no accessibility violations", async () => {
      container = Badge({ textValue: "5 notifications" }, "5");
      getDocument().body.appendChild(container);

      // @ts-expect-error vitest-axe types
      expect(await axe(container)).toHaveNoViolations();
    });
  }
});
