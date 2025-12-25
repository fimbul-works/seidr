import { beforeEach, describe, expect, it } from "vitest";
import { component } from "../component.js";
import { $ } from "../element.js";
import { mount } from "./mount.js";

describe("mount", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = $("div");
  });

  it("should mount component into container", () => {
    const mockElement = $("div");
    const comp = component(() => mockElement);

    mount(comp, container);

    expect(container.contains(mockElement)).toBe(true);
  });

  it("should return unmount function", () => {
    const mockElement = $("div");
    const comp = component(() => mockElement);

    const unmount = mount(comp, container);

    expect(typeof unmount).toBe("function");
    expect(container.contains(mockElement)).toBe(true);

    unmount();

    expect(container.contains(mockElement)).toBe(false);
  });
});
