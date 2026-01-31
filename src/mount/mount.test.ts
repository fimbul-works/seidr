import { beforeEach, describe, expect, it } from "vitest";
import { component } from "../component";
import { $, type SeidrElement } from "../element";
import { Seidr } from "../seidr";
import { mount } from "./mount";

describe("mount", () => {
  let container: SeidrElement;

  beforeEach(() => {
    container = $("div");
  });

  it("should mount component into container", () => {
    const mockElement = $("div");
    const createComp = component(() => {
      return mockElement;
    });
    const comp = createComp();

    mount(comp, container);

    expect(container.contains(mockElement)).toBe(true);
  });

  it("should return unmount function", () => {
    const mockElement = $("div");
    const createComp = component(() => {
      return mockElement;
    });
    const comp = createComp();

    const unmount = mount(comp, container);

    expect(typeof unmount).toBe("function");
    expect(container.contains(mockElement)).toBe(true);

    unmount();

    expect(container.contains(mockElement)).toBe(false);
  });

  it("should cleanup all reactive observers after unmount", () => {
    const text = new Seidr("test");
    const App = () => $("div", { textContent: text });

    expect(text.observerCount()).toBe(0);
    const unmount = mount(App, container);
    expect(text.observerCount()).toBe(1);

    unmount();
    expect(text.observerCount()).toBe(0);
  });
});
