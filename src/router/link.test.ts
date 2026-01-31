import { beforeEach, describe, expect, it, vi } from "vitest";
import { component } from "../component";
import { mount } from "../mount";
import { Seidr } from "../seidr";
import { getCurrentPath } from "./get-current-path";
import { Link } from "./link";
import { navigate } from "./navigate";

vi.mock("./get-current-path", () => ({
  getCurrentPath: vi.fn(),
}));

vi.mock("./navigate", () => ({
  navigate: vi.fn(),
}));

describe("Link Component", () => {
  let container: HTMLDivElement;
  let pathSeidr: Seidr<string>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    pathSeidr = new Seidr("/");
    vi.mocked(getCurrentPath).mockReturnValue(pathSeidr);
  });

  it("should render an anchor tag by default", () => {
    const App = component(() => Link({ to: "/about" }, ["About"]));
    mount(App(), container);

    const link = container.querySelector("a")!;
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/about");
    expect(link.textContent).toBe("About");
  });

  it("should render with custom tag name", () => {
    const App = component(() => Link({ to: "/about", tagName: "button" }, ["About"]));
    mount(App(), container);

    const link = container.querySelector("button")!;
    expect(link).toBeTruthy();
    expect(link.textContent).toBe("About");
  });

  it("should call navigate on click", () => {
    const App = component(() => Link({ to: "/about" }, ["About"]));
    mount(App(), container);

    const link = container.querySelector("a")!;
    link.click();

    expect(navigate).toHaveBeenCalledWith("/about");
  });

  it("should apply active class when path matches", () => {
    const App = component(() => Link({ to: "/about", activeClass: "is-active" }, ["About"]));
    mount(App(), container);

    const link = container.querySelector("a")!;
    expect(link.classList.contains("is-active")).toBe(false);

    pathSeidr.value = "/about";
    expect(link.classList.contains("is-active")).toBe(true);

    pathSeidr.value = "/";
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
    mount(App(), container);

    const link = container.querySelector("a")!;
    expect(link.getAttribute("aria-current")).toBeNull();

    pathSeidr.value = "/about";
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("should support reactive 'to' prop", () => {
    const target = new Seidr("/initial");
    const App = component(() => Link({ to: target }, ["Link"]));
    mount(App(), container);

    const link = container.querySelector("a")!;
    expect(link.getAttribute("href")).toBe("/initial");

    target.value = "/updated";
    expect(link.getAttribute("href")).toBe("/updated");
  });
});
