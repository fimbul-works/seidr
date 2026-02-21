import { afterEach, beforeEach, expect, it } from "vitest";
import { component } from "../../component";
import { mount } from "../../dom";
import { $ } from "../../element";
import { Seidr } from "../../seidr";
import { describeDualMode } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { useNavigate } from "../hooks/use-navigate";
import { useParams } from "../hooks/use-params";
import { Route } from "./route";

describeDualMode("Route Component", ({ getDocument, isSSR }) => {
  if (isSSR) {
    it("should be covered by router-ssr.test.ts", () => {
      expect(true).toBe(true);
    });
    return;
  }

  let container: HTMLDivElement;
  let unmount: CleanupFunction;

  beforeEach(() => {
    const document = getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmount?.();
  });

  const Page = (name: string) =>
    component(() => $("div", { className: name.toLowerCase(), textContent: name }), "Page");

  it("should render when path matches exactly", () => {
    const App = component(() => {
      return $("div", {}, [Route("/", Page("Home")), Route("/about", Page("About"))]);
    }, "App");

    const navigate = useNavigate();
    navigate("/");
    unmount = mount(App, container);
    expect(container.querySelector(".home")).toBeTruthy();
    expect(container.querySelector(".about")).toBeFalsy();

    navigate("/about");
    expect(container.querySelector(".home")).toBeFalsy();
    expect(container.querySelector(".about")).toBeTruthy();
  });

  it("should handle dynamic parameters via useParams hook", () => {
    const UserPage = component(() => {
      const params = useParams();
      return $("div", { className: "user", textContent: params.as((p) => `User ${p.id}`) });
    }, "UserPage");

    const App = component(() => {
      return $("div", {}, [Route("/user/:id", UserPage)]);
    }, "App");

    const navigate = useNavigate();
    navigate("/user/123");
    unmount = mount(App, container);

    expect(container.querySelector(".user")?.textContent).toBe("User 123");

    navigate("/user/456");
    expect(container.querySelector(".user")?.textContent).toBe("User 456");
  });

  it("should support RegExp patterns", () => {
    const PostPage = component(() => {
      const params = useParams();
      return $("div", { className: "post", textContent: params.as((p) => `Post ${p.id}`) });
    }, "PostPage");

    const App = component(() => {
      return $("div", {}, [Route(/^\/post\/(?<id>\d+)$/, PostPage)]);
    }, "App");

    const navigate = useNavigate();
    navigate("/post/123");
    unmount = mount(App, container);
    expect(container.querySelector(".post")?.textContent).toBe("Post 123");

    navigate("/post/abc");
    expect(container.querySelector(".post")).toBeFalsy();
  });

  it("should use provide pathState if provided", () => {
    const customPath = new Seidr("/custom");

    const App = component(() => {
      return $("div", {}, [Route("/custom", Page("Custom"), customPath)]);
    }, "App");

    unmount = mount(App, container);
    expect(container.querySelector(".custom")).toBeTruthy();

    customPath.value = "/other";
    expect(container.querySelector(".custom")).toBeFalsy();
  });
});
