import { beforeEach, describe, expect, it } from "vitest";
import { component } from "../component/component";
import { rootComponentFeature, rootNodeFeature } from "../dom/feature";
import { mount } from "../dom/mount";
import { $ } from "../element";
import { getRenderContext } from "../render-context";
import { setFeature } from "../render-context/feature";

describe("Component Marker Optimization", () => {
  beforeEach(() => {
    const ctx = getRenderContext();
    setFeature(rootComponentFeature, undefined, ctx);
    setFeature(rootNodeFeature, undefined, ctx);
    ctx.markers.clear();
  });

  it("should not have markers when returning a single HTMLElement", () => {
    const MyComp = component(() => $("div", { textContent: "Hello" }), "MyComp");
    const container = document.createElement("div");
    const comp = MyComp();
    const unmount = mount(comp, container);

    expect(comp.startMarker).toBeUndefined();
    expect(comp.endMarker).toBeUndefined();
    expect(container.innerHTML).toContain('data-seidr-root="0"');
    expect(container.innerHTML).toContain(">Hello</div>");
    unmount();
  });

  it("should not have markers when returning a single Component", () => {
    const Child = component(() => $("div", { textContent: "Child" }), "Child");
    const Parent = component(() => Child(), "Parent");

    const container = document.createElement("div");
    const comp = Parent();
    const unmount = mount(comp, container);

    expect(comp.startMarker).toBeUndefined();
    expect(comp.endMarker).toBeUndefined();
    expect(container.innerHTML).toContain('data-seidr-root="0">');
    expect(container.innerHTML).toContain(">Child</div>");
    unmount();
  });

  it("should have markers when returning an array", () => {
    const MyComp = component(() => [$("div", { textContent: "One" }), $("div", { textContent: "Two" })], "MyComp");
    const container = document.createElement("div");
    const comp = MyComp();
    const unmount = mount(comp, container);

    expect(comp.startMarker).toBeDefined();
    expect(comp.endMarker).toBeDefined();
    expect(container.innerHTML).toContain("<!--MyComp-");
    expect(container.innerHTML).toContain("One</div>");
    expect(container.innerHTML).toContain(">Two</div>");
    unmount();
  });

  it("should have markers when returning null", () => {
    const MyComp = component(() => null, "MyComp");
    const container = document.createElement("div");
    const comp = MyComp();
    const unmount = mount(comp, container);

    expect(comp.startMarker).toBeDefined();
    expect(comp.endMarker).toBeDefined();
    expect(container.innerHTML).toContain("<!--MyComp-");
    unmount();
  });

  it("should have markers when returning text", () => {
    const MyComp = component(() => "Just text", "MyComp");
    const container = document.createElement("div");
    const comp = MyComp();
    const unmount = mount(comp, container);

    expect(comp.startMarker).toBeDefined();
    expect(comp.endMarker).toBeDefined();
    expect(container.textContent).toBe("Just text");
    unmount();
  });
});
