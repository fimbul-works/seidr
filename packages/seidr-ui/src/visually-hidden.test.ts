import { $ } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { VisuallyHidden } from "./visually-hidden";

describeDualMode("VisuallyHidden", ({ getDocument, isSSR }) => {
  let container: HTMLElement;
  let label: HTMLElement;

  beforeEach(() => {
    container = $("div", VisuallyHidden("Label"));

    getDocument().body.appendChild(container);

    label = container.getElementsByTagName("span")[0];
  });

  afterEach(() => container?.remove());

  if (!isSSR) {
    it("should have no accessibility violations", async () => {
      // @ts-expect-error
      expect(await axe(container)).toHaveNoViolations();
    });
  }

  it("should have a label", () => {
    expect(label).toBeTruthy();
    expect(label.textContent).toBe("Label");
  });

  it("supports props object with children", () => {
    const el = VisuallyHidden({ id: "custom-hidden" }, "Hidden text");
    expect(el.id).toBe("custom-hidden");
    expect(el.textContent).toBe("Hidden text");
  });
});
