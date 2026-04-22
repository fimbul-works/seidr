import { component, mount, Seidr, useScope, wrapComponent } from "@fimbul-works/seidr";
import { $button, $div, $header, $img, $span } from "@fimbul-works/seidr/html";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("docs/components.md Examples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("Component Props Example", () => {
    const Counter = ({ initialCount = 0, step = 1, label = "Counter" } = {}) => {
      const count = new Seidr(initialCount, { sync: true });

      return $div({ className: "counter" }, [
        $span({ textContent: label }),
        $span({ textContent: count.as((n) => `: ${n}`) }),
        $button({
          textContent: `+${step}`,
          onclick: () => (count.value += step),
        }),
      ]);
    };

    const container1 = document.createElement("div");
    const container2 = document.createElement("div");
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    mount(
      component(() => Counter({ initialCount: 5, step: 2, label: "Steps" }), "StepsCounter"),
      container1,
    );
    mount(
      component(() => Counter({ initialCount: 0 }), "DefaultCounter"),
      container2,
    );

    expect(container1.textContent).toContain("Steps: 5");
    expect(container2.textContent).toContain("Counter: 0");

    const btn1 = container1.querySelector("button")!;
    btn1.click();
    expect(container1.textContent).toContain("Steps: 7");
    expect(container2.textContent).toContain("Counter: 0"); // Isolated
  });

  test("Component Hierarchy Example", () => {
    const Header = component(() => $header({ textContent: "User Profile" }));
    const Avatar = component(() => $img({ src: "/avatar.png", alt: "User Avatar" }));

    const UserProfile = () => {
      return $div({ className: "profile" }, [Header(), Avatar()]);
    };

    mount(UserProfile, document.body);

    expect(document.body.querySelector("header")).not.toBeNull();
    expect(document.body.querySelector("img")).not.toBeNull();
    expect(document.body.textContent).toContain("User Profile");
  });

  test("mount() and unmount()", () => {
    const App = () => $div({ textContent: "Hello Seidr" });
    const container = document.createElement("div");
    document.body.appendChild(container);

    const unmount = mount(App, container);
    expect(container.textContent).toBe("Hello Seidr");

    unmount();
    expect(container.innerHTML).toBe("");
  });

  test("useScope().onMount()", () => {
    const onMount = vi.fn();
    const Example = () => {
      useScope().onMount(onMount);
      return $div({ textContent: "Example" });
    };

    mount(Example, document.body);
    expect(onMount).toHaveBeenCalled();
  });

  test("useScope().onUnmount() / Timer Example", () => {
    vi.useFakeTimers();
    const Timer = () => {
      const count = new Seidr(0, { sync: true });
      const interval = setInterval(() => count.value++, 1000);
      useScope().onUnmount(() => clearInterval(interval));
      return $div({ textContent: count });
    };

    const unmount = mount(Timer, document.body);
    const div = document.querySelector("div")!;

    expect(div.textContent).toBe("0");
    vi.advanceTimersByTime(1000);
    expect(div.textContent).toBe("1");

    unmount();
    vi.advanceTimersByTime(1000);
    expect(div.textContent).toBe("1"); // Stopped
    vi.useRealTimers();
  });

  test("wrapComponent()", () => {
    const SimpleComp = () => $div({ textContent: "Hello" });
    const factory = wrapComponent(SimpleComp);
    const component = factory();

    expect(component.element).toBeInstanceOf(HTMLDivElement);
    expect((component.element as HTMLElement)?.textContent).toBe("Hello");
  });
});
