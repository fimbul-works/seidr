import { beforeEach, expect, it } from "vitest";
import { component } from "../component/internal";
import { mount } from "../dom/internal";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import { navigate } from "./navigate";
import { Route } from "./route";

describeDualMode("Route Component", ({ getDOMFactory }) => {
  let container: HTMLDivElement;

  beforeEach(() => {
    const document = getDOMFactory().getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  const Page = (name: string) => component(() => $("div", { className: name.toLowerCase(), textContent: name }));

  it("should render when path matches exactly", () => {
    const App = component(() => {
      return $("div", {}, [Route("/", () => Page("Home")()), Route("/about", () => Page("About")())]);
    });

    mount(App(), container);
    expect(container.querySelector(".home")).toBeTruthy();
    expect(container.querySelector(".about")).toBeFalsy();

    navigate("/about");
    expect(container.querySelector(".home")).toBeFalsy();
    expect(container.querySelector(".about")).toBeTruthy();
  });

  it("should handle dynamic parameters", () => {
    const UserPage = (params?: Seidr<{ id: string }>) =>
      component(() => $("div", { className: "user", textContent: params?.as((p) => `User ${p.id}`) }))();

    const App = component(() => {
      return $("div", {}, [Route("/user/:id", UserPage)]);
    });

    navigate("/user/123");
    mount(App(), container);

    expect(container.querySelector(".user")?.textContent).toBe("User 123");

    navigate("/user/456");
    expect(container.querySelector(".user")?.textContent).toBe("User 456");
  });

  it("should support RegExp patterns", () => {
    const PostPage = (params?: Seidr<{ id: string }>) =>
      component(() => $("div", { className: "post", textContent: params?.as((p) => `Post ${p.id}`) }))();

    const App = component(() => {
      return $("div", {}, [Route(/^\/post\/(?<id>\d+)$/, PostPage)]);
    });

    navigate("/post/123");
    mount(App(), container);
    expect(container.querySelector(".post")?.textContent).toBe("Post 123");

    navigate("/post/abc");
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
