import { createComponent, mount } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFocusGuard, resetFocusGuards, useFocusGuards } from "./use-focus-guards.js";

function getGuards(): NodeListOf<HTMLSpanElement> {
  return document.querySelectorAll("[data-seidr-focus-guard]");
}

describe("createFocusGuard", () => {
  it("creates a span with proper attributes and styles", () => {
    const guard = createFocusGuard();
    expect(guard.tagName.toLowerCase()).toBe("span");
    expect(guard.hasAttribute("data-seidr-focus-guard")).toBe(true);
    expect(guard.tabIndex).toBe(0);
    expect(guard.style.outline).toBe("none");
    expect(guard.style.opacity).toBe("0");
    expect(guard.style.position).toBe("fixed");
    expect(guard.style.pointerEvents).toBe("none");
  });
});

describe("useFocusGuards (client)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    resetFocusGuards();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    resetFocusGuards();
    vi.restoreAllMocks();
  });

  it("injects a single pair of guards at the edges of <body> when component mounts", () => {
    const Guarded = createComponent(() => {
      useFocusGuards();
      return $div({}, "Guarded Modal");
    });

    const unmount = mount(Guarded, container);
    const guards = getGuards();

    expect(guards).toHaveLength(2);
    expect(document.body.firstElementChild).toBe(guards[0]);
    expect(document.body.lastElementChild).toBe(guards[1]);

    unmount();
    expect(getGuards()).toHaveLength(0);
  });

  it("does not duplicate guards when multiple consumers mount", () => {
    const Guarded1 = createComponent(() => {
      useFocusGuards();
      return $div({}, "Modal 1");
    });
    const Guarded2 = createComponent(() => {
      useFocusGuards();
      return $div({}, "Modal 2");
    });
    const Guarded3 = createComponent(() => {
      useFocusGuards();
      return $div({}, "Modal 3");
    });

    const unmount1 = mount(Guarded1, container);
    const unmount2 = mount(Guarded2, container);
    const unmount3 = mount(Guarded3, container);

    expect(getGuards()).toHaveLength(2);

    unmount1();
    unmount2();
    unmount3();
    expect(getGuards()).toHaveLength(0);
  });

  it("removes guards only after the last consumer unmounts", () => {
    const Guarded1 = createComponent(() => {
      useFocusGuards();
      return $div({}, "Modal 1");
    });
    const Guarded2 = createComponent(() => {
      useFocusGuards();
      return $div({}, "Modal 2");
    });

    const unmount1 = mount(Guarded1, container);
    const unmount2 = mount(Guarded2, container);
    expect(getGuards()).toHaveLength(2);

    unmount1();
    // One consumer is still active, guards should remain in place
    expect(getGuards()).toHaveLength(2);

    unmount2();
    // Last consumer unmounted, guards should be cleaned up
    expect(getGuards()).toHaveLength(0);
  });

  it("does not mutate the DOM when an extra consumer mounts and guards are already in place", () => {
    const Guarded1 = createComponent(() => {
      useFocusGuards();
      return $div({}, "Modal 1");
    });
    const Guarded2 = createComponent(() => {
      useFocusGuards();
      return $div({}, "Modal 2");
    });

    const unmount1 = mount(Guarded1, container);

    const insertSpy = vi.spyOn(document.body, "insertAdjacentElement");
    const unmount2 = mount(Guarded2, container);

    expect(insertSpy).not.toHaveBeenCalled();

    unmount1();
    unmount2();
  });

  it("re-asserts the trailing guard as the last child when a node is appended after it", () => {
    const Guarded1 = createComponent(() => {
      useFocusGuards();
      return $div({}, "Modal 1");
    });
    const Guarded2 = createComponent(() => {
      useFocusGuards();
      return $div({}, "Modal 2");
    });

    const unmount1 = mount(Guarded1, container);
    const trailingGuard = getGuards()[1];

    // Simulate an external node or portal appending content to the end of <body>
    const portal = document.createElement("div");
    document.body.appendChild(portal);
    expect(document.body.lastElementChild).toBe(portal);

    // When the next consumer mounts, the trailing guard is moved back to the end
    const unmount2 = mount(Guarded2, container);

    expect(getGuards()).toHaveLength(2);
    expect(document.body.lastElementChild).toBe(trailingGuard);

    portal.remove();
    unmount1();
    unmount2();
  });

  it("throws when called outside of component scope (warns in tests)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => useFocusGuards()).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });
});

describeDualMode("useFocusGuards SSR and Client safety", () => {
  beforeEach(() => {
    resetFocusGuards();
  });

  afterEach(() => {
    resetFocusGuards();
  });

  it("executes safely in SSR without throwing", () => {
    const App = createComponent(() => {
      useFocusGuards();
      return $div({}, "SSR App");
    });

    expect(() => {
      const comp = App();
      comp.mount();
      comp.unmount();
    }).not.toThrow();
  });
});
