import { beforeEach, describe, expect, it, vi } from "vitest";
import { Seidr } from "../../seidr";
import { component } from "../component";
import { $ } from "../element";
import { mount } from "../mount/mount";
import { getCurrentPath } from "./get-current-path";
import { Route } from "./route";

vi.mock("./get-current-path", () => ({
  getCurrentPath: vi.fn(),
}));

describe("Route Component", () => {
  let container: HTMLDivElement;
  let pathSeidr: Seidr<string>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    pathSeidr = new Seidr("/");
    vi.mocked(getCurrentPath).mockReturnValue(pathSeidr);
  });

  const Page = (name: string) => component(() => $("div", { className: name.toLowerCase(), textContent: name }));

  it("should render when path matches exactly", () => {
    const App = component(() => {
      return $("div", {}, [Route("/", () => Page("Home")()), Route("/about", () => Page("About")())]);
    });

    mount(App(), container);
    expect(container.querySelector(".home")).toBeTruthy();
    expect(container.querySelector(".about")).toBeFalsy();

    pathSeidr.value = "/about";
    expect(container.querySelector(".home")).toBeFalsy();
    expect(container.querySelector(".about")).toBeTruthy();
  });

  it("should handle dynamic parameters", () => {
    const UserPage = (params?: Seidr<{ id: string }>) =>
      component(() => $("div", { className: "user", textContent: params?.as((p) => `User ${p.id}`) }))();

    const App = component(() => {
      return $("div", {}, [Route("/user/:id", UserPage)]);
    });

    pathSeidr.value = "/user/123";
    mount(App(), container);

    expect(container.querySelector(".user")?.textContent).toBe("User 123");

    pathSeidr.value = "/user/456";
    expect(container.querySelector(".user")?.textContent).toBe("User 456");
  });

  it("should support RegExp patterns", () => {
    const PostPage = (params?: Seidr<{ id: string }>) =>
      component(() => $("div", { className: "post", textContent: params?.as((p) => `Post ${p.id}`) }))();

    const App = component(() => {
      return $("div", {}, [Route(/^\/post\/(?<id>\d+)$/, PostPage)]);
    });

    pathSeidr.value = "/post/123";
    mount(App(), container);
    expect(container.querySelector(".post")?.textContent).toBe("Post 123");

    pathSeidr.value = "/post/abc";
    expect(container.querySelector(".post")).toBeFalsy();
  });

  it("should use provide pathState if provided", () => {
    const customPath = new Seidr("/custom");
    const App = component(() => {
      return $("div", {}, [Route("/custom", () => Page("Custom")(), customPath)]);
    });

    mount(App(), container);
    expect(container.querySelector(".custom")).toBeTruthy();

    customPath.value = "/other";
    expect(container.querySelector(".custom")).toBeFalsy();
  });
});
