import { describe, expect, it } from "vitest";
import { Seidr } from "../../seidr";
import { $div } from "../elements";
import { mount } from "../mount/mount";
import { wrapComponent } from "../wrap-component";
import { createRoute } from "./create-route";
import { matchRoute } from "./match-route";

describe("matchRoute", () => {
  const comp = () => $div();

  it("should match simple path", () => {
    const route = createRoute("/home", comp);
    const match = matchRoute("/home", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.index).toBe(0);
    expect(match?.params).toEqual({});
  });

  it("should match route with parameters", () => {
    const route = createRoute("/user/:id", (params?: Seidr<{ id: string }>) =>
      $div({ textContent: params?.as((p) => p.id) }),
    );
    const match = matchRoute("/user/123", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.params).toEqual({ id: "123" });
  });

  it("should match regex route", () => {
    const route = createRoute(/^\/post\/(?<slug>[a-z-]+)$/, (params?: Seidr<{ slug: string }>) =>
      $div({ textContent: params?.as((p) => p.slug) }),
    );
    const match = matchRoute("/post/hello-world", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
    expect(match?.params).toEqual({ slug: "hello-world" });
  });

  it("should prioritize earlier routes", () => {
    const route1 = createRoute("/user/new", comp);
    const route2 = createRoute("/user/:id", (params?: Seidr<{ id: string }>) =>
      $div({ textContent: params?.as((p) => p.id) }),
    );

    const match = matchRoute("/user/new", [route1, route2]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route1);
    expect(match?.params).toEqual({});
  });

  it("should return null for no match", () => {
    const route = createRoute("/home", comp);
    const match = matchRoute("/about", [route]);

    expect(match).toBeNull();
  });

  it("should handle trailing slashes", () => {
    const route = createRoute("/home", comp);
    const match = matchRoute("/home/", [route]);

    expect(match).not.toBeNull();
    expect(match?.route).toBe(route);
  });

  it("should render component with captured params", async () => {
    const route = createRoute("/user/:id", (params?: Seidr<{ id: string }>) =>
      $div({ textContent: params?.as((p) => `User: ${p.id}`) }),
    );

    const match = matchRoute("/user/42", [route]);
    expect(match).not.toBeNull();

    if (match) {
      // We need to simulate how Router creates the component
      // Typically Router creates a Seidr for params and passes it
      const paramsSeidr = new Seidr(match.params);

      const container = document.createElement("div");
      const factory = wrapComponent(match.route.componentFactory);

      // Pass the reactive params to the factory wrapper
      // wrapComponent returns (props?: any) => Component
      const component = factory(paramsSeidr);
      mount(component, container);

      expect(container.textContent).toBe("User: 42");
    }
  });
});
