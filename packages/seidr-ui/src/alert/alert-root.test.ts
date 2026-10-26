import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { Alert, AlertRoot } from "./alert-root.js";

describeDualMode("Alert", ({ getDocument, isSSR }) => {
  let container: HTMLElement;

  afterEach(() => {
    container?.remove();
  });

  it("should render a div with role='alert' by default", () => {
    container = Alert("Warning: check your connection");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("div");
    expect(container.getAttribute("role")).toBe("alert");
    expect(container.textContent).toBe("Warning: check your connection");
  });

  it("should support Alert.Root namespace alias", () => {
    container = AlertRoot("Namespace alert test");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("div");
    expect(container.getAttribute("role")).toBe("alert");
    expect(container.textContent).toBe("Namespace alert test");
  });

  it("should support props and children", () => {
    container = Alert({ id: "my-alert", className: "alert-danger" }, "Error occurred");
    getDocument().body.appendChild(container);

    expect(container.id).toBe("my-alert");
    expect(container.className).toBe("alert-danger");
    expect(container.getAttribute("role")).toBe("alert");
    expect(container.textContent).toBe("Error occurred");
  });

  it("should allow rendering as a different HTML tag via 'as'", () => {
    container = Alert({ as: "section", id: "section-alert" }, "Section alert");
    getDocument().body.appendChild(container);

    expect(container.tagName.toLowerCase()).toBe("section");
    expect(container.getAttribute("role")).toBe("alert");
  });

  if (!isSSR) {
    it("should have no accessibility violations", async () => {
      container = Alert({ ariaLive: "assertive" }, "Important security notice");
      getDocument().body.appendChild(container);

      // @ts-expect-error vitest-axe types
      expect(await axe(container)).toHaveNoViolations();
    });
  }
});
