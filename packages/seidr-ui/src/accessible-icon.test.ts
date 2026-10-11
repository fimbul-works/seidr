import { $ } from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { AccessibleIcon } from "./accessible-icon";

describeDualMode("AccessibleIcon", ({ getDocument, isSSR }) => {
  let container: HTMLElement;
  let svg: SVGElement;
  let label: HTMLElement;

  beforeEach(() => {
    const icon = $(
      "svg",
      {
        id: "icon",
        viewBox: "0 0 32 32",
        width: 24,
        height: 24,
        fill: "none",
        stroke: "currentColor",
      },
      $("path", { d: "M2 30 L30 2 M30 30 L2 2" }),
    );

    container = $("div", AccessibleIcon(icon, "Close"));
    getDocument().body.appendChild(container);

    svg = container.getElementsByTagName("svg")[0];
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
  });

  it("should add an aria-hidden attribute to the child", () => {
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("should set focusable attribute on the child to false", () => {
    expect(svg.getAttribute("focusable")).toBe("false");
  });
});
