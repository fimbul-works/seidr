import { beforeEach, expect, it } from "vitest";
import { component } from "../component/internal";
import { mount } from "../dom/internal";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import { getCurrentPath } from "./get-current-path";
import { initRouter } from "./init-router";
import { Link } from "./link";
import { navigate } from "./navigate";

describeDualMode("Link Component", ({ getDOMFactory, mode }) => {
  let container: HTMLDivElement;

  beforeEach(() => {
    const document = getDOMFactory().getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
    initRouter("/");
  });

  it("should render an anchor tag by default", () => {
    const App = component(() => Link({ to: "/about" }, ["About"]));
    mount(App, container);

    const link = container.querySelector("a")!;
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/about");
    expect(link.textContent).toBe("About");
  });

  it("should render with custom tag name", () => {
    const App = component(() => Link({ to: "/about", tagName: "button" }, ["About"]));
    mount(App, container);

    const link = container.querySelector("button")!;
    expect(link).toBeTruthy();
    expect(link.textContent).toBe("About");
  });

  if (mode !== "SSR") {
    it("should call navigate on click", () => {
      const App = component(() => Link({ to: "/about" }, ["About"]));
      mount(App, container);

      const link = container.querySelector("a")!;
      link.click();

      expect(getCurrentPath().value).toBe("/about");
    });
  }

  it("should apply active class when path matches", () => {
    const App = component(() => Link({ to: "/about", activeClass: "is-active" }, ["About"]));
    mount(App, container);

    const link = container.querySelector("a")!;
    expect(link.classList.contains("is-active")).toBe(false);

    navigate("/about");
    expect(link.classList.contains("is-active")).toBe(true);

    navigate("/");
    expect(link.classList.contains("is-active")).toBe(false);
  });

  it("should support custom active property", () => {
    const App = component(() =>
      Link(
        {
          to: "/about",
          activeProp: "aria-current",
          activeValue: "page",
        },
        ["About"],
      ),
    );
    mount(App, container);

    const link = container.querySelector("a")!;
    expect(link.getAttribute("aria-current")).toBeNull();

    navigate("/about");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("should support reactive 'to' prop", () => {
    const target = new Seidr("/initial");
    const App = component(() => Link({ to: target }, ["Link"]));
    mount(App, container);

    const link = container.querySelector("a")!;
    expect(link.getAttribute("href")).toBe("/initial");

    target.value = "/updated";
    expect(link.getAttribute("href")).toBe("/updated");
  });
});
