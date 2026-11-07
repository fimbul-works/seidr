import {
  createComponent,
  createRef,
  mount,
  type SeidrChild,
} from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { createPopper, Popper } from "./index.js";

describeDualMode("Popper", ({ getDocument, isSSR }) => {
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

  it("should render default structure and semantic data attributes", () => {
    const root = setup(() => {
      const anchorRef = createRef<HTMLElement>();
      return Popper({
        anchorRef,
        placement: "bottom",
        showArrow: true,
      });
    });

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const positionerEl = root.querySelector("[data-part='positioner']") as HTMLElement;
    const arrowEl = root.querySelector("[data-part='arrow']") as HTMLElement;

    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("data-component")).toBe("popper");
    expect(rootEl.getAttribute("data-part")).toBe("root");
    expect(rootEl.getAttribute("data-placement")).toBe("bottom");

    expect(positionerEl).not.toBeNull();
    expect(positionerEl.getAttribute("data-component")).toBe("popper");
    expect(positionerEl.getAttribute("data-part")).toBe("positioner");
    expect(positionerEl.hasAttribute("data-popper-positioner")).toBe(true);
    expect(positionerEl.getAttribute("data-placement")).toBe("bottom");

    expect(arrowEl).not.toBeNull();
    expect(arrowEl.getAttribute("data-component")).toBe("popper");
    expect(arrowEl.getAttribute("data-part")).toBe("arrow");
    expect(arrowEl.getAttribute("data-placement")).toBe("bottom");
    expect(arrowEl.getAttribute("aria-hidden")).toBe("true");
  });

  it("supports fine-grained composition via createPopper (Tier 2)", () => {
    const root = setup(() => {
      const popper = createPopper({
        placement: "top-start",
      });

      return popper.Root({}, [
        popper.Positioner({}, [
          popper.Arrow(),
          getDocument().createElement("div"),
        ]),
      ]);
    });

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const positionerEl = root.querySelector("[data-part='positioner']") as HTMLElement;
    const arrowEl = root.querySelector("[data-part='arrow']") as HTMLElement;

    expect(rootEl.getAttribute("data-placement")).toBe("top-start");
    expect(positionerEl.getAttribute("data-placement")).toBe("top-start");
    expect(arrowEl.getAttribute("data-placement")).toBe("top-start");
  });

  it("computes position and updates placement styles in browser", async () => {
    if (isSSR) return;

    const anchor = getDocument().createElement("button");
    anchor.textContent = "Trigger";
    anchor.getBoundingClientRect = () => ({
      x: 100,
      y: 100,
      top: 100,
      bottom: 140,
      left: 100,
      right: 200,
      width: 100,
      height: 40,
      toJSON: () => {},
    });
    getDocument().body.appendChild(anchor);

    let popperInstance!: ReturnType<typeof createPopper>;
    const root = setup(() => {
      popperInstance = createPopper({
        anchorRef: () => anchor,
        placement: "bottom-start",
        gutter: 8,
      });

      return popperInstance.Root({}, [
        popperInstance.Positioner({}, [
          popperInstance.Arrow(),
          getDocument().createElement("div"),
        ]),
      ]);
    });

    const positionerEl = root.querySelector("[data-part='positioner']") as HTMLElement;

    await popperInstance.updatePosition();

    expect(positionerEl.style.transform).toContain("translate3d");
    expect(positionerEl.style.getPropertyValue("--seidr-popper-content-transform-origin")).toBeTruthy();

    anchor.remove();
  });

  it("supports sameWidth option to set anchor width CSS custom property", async () => {
    if (isSSR) return;

    const anchor = getDocument().createElement("button");
    anchor.getBoundingClientRect = () => ({
      x: 50,
      y: 50,
      top: 50,
      bottom: 90,
      left: 50,
      right: 250,
      width: 200,
      height: 40,
      toJSON: () => {},
    });
    getDocument().body.appendChild(anchor);

    let popperInstance!: ReturnType<typeof createPopper>;
    const root = setup(() => {
      popperInstance = createPopper({
        anchorRef: () => anchor,
        sameWidth: true,
      });

      return popperInstance.Root({}, [
        popperInstance.Positioner({}, [
          getDocument().createElement("div"),
        ]),
      ]);
    });

    const positionerEl = root.querySelector("[data-part='positioner']") as HTMLElement;

    await popperInstance.updatePosition();

    expect(positionerEl.style.getPropertyValue("--seidr-popper-anchor-width")).toBe("200px");
    expect(positionerEl.style.width).toBe("200px");

    anchor.remove();
  });

  it("should have no accessibility violations (axe)", async () => {
    if (isSSR) return;

    const root = setup(() =>
      Popper({
        placement: "bottom",
        showArrow: true,
      }),
    );

    const results = await axe(root);
    expect(results).toHaveNoViolations();
  });
});
