import { beforeEach, describe, expect, it } from "vitest";
import { component, useScope } from "../component";
import { $ } from "../element";
import { mount } from "./mount";

describe("mount", () => {
  let container: HTMLElement;

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
});
