import { describe, expect, it } from "vitest";
import { createServerElement } from "./server-element";

describe("ServerElement", () => {
  it("should stringify simple element", () => {
    const el = createServerElement("div");
    expect(el.toString()).toBe("<div></div>");
  });

  it("should stringify element with attributes", () => {
    const el = createServerElement("span");
    el.setAttribute("class", "foo");
    el.setAttribute("id", "bar");
    const str = el.toString();
    expect(str).toContain('class="foo"');
    expect(str).toContain('id="bar"');
    expect(str).toContain("<span");
    expect(str).toContain("></span>");
  });

  it("should handle boolean attributes", () => {
    const el = createServerElement("input");
    el.setAttribute("disabled", true);
    el.setAttribute("checked", false);
    const str = el.toString();
    expect(str).toContain("disabled");
    expect(str).not.toContain("checked");
    expect(str).toBe("<input disabled />");
  });

  it("should handle self-closing tags", () => {
    const br = createServerElement("br");
    expect(br.toString()).toBe("<br />");

    const img = createServerElement("img");
    img.setAttribute("src", "foo.png");
    expect(img.toString()).toBe('<img src="foo.png" />');
  });

  it("should handle style object", () => {
    const el = createServerElement("div");
    el.style.color = "red";
    el.style.fontSize = "12px";
    expect(el.toString()).toBe('<div style="color: red; font-size: 12px;"></div>');
  });

  it("should handle dataset", () => {
    const el = createServerElement("div");
    el.dataset.fooBar = "baz";
    expect(el.getAttribute("data-foo-bar")).toBe("baz");
    expect(el.toString()).toBe('<div data-foo-bar="baz"></div>');
  });

  it("should handle nesting", () => {
    const div = createServerElement("div");
    const span = createServerElement("span");
    span.textContent = "hello";
    div.appendChild(span);
    expect(div.toString()).toBe("<div><span>hello</span></div>");
  });

  it("should handle innerHTML", () => {
    const div = createServerElement("div");
    div.innerHTML = "<span>raw</span>";
    expect(div.toString()).toBe("<div><span>raw</span></div>");
    expect(div.innerHTML).toBe("<span>raw</span>");
  });

  it("should escaped text content", () => {
    const p = createServerElement("p");
    p.textContent = "<b>bold</b>";
    expect(p.toString()).toBe("<p>&lt;b&gt;bold&lt;/b&gt;</p>");
  });

  it("should allow getting/setting arbitrary properties", () => {
    const el = createServerElement("div") as any;
    el.foo = "bar";
    expect(el.foo).toBe("bar");
    expect(el.getAttribute("foo")).toBe("bar");
    expect(el.toString()).toBe('<div foo="bar"></div>');
  });

  it("should handle boolean properties correctly via proxy", () => {
    const el = createServerElement("input");
    el.disabled = true;
    expect(el.getAttribute("disabled")).toBe(true);
    expect(el.disabled).toBe(true);

    el.disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
    expect(el.disabled).toBe(false);
  });

  it("should handle classList", () => {
    const el = createServerElement("div");
    el.classList.add("foo", "bar");
    expect(el.className).toBe("foo bar");
    expect(el.classList.contains("foo")).toBe(true);
    expect(el.classList.contains("baz")).toBe(false);

    el.classList.remove("foo");
    expect(el.className).toBe("bar");

    el.classList.toggle("baz");
    expect(el.className).toBe("bar baz");
    el.classList.toggle("baz", false);
    expect(el.className).toBe("bar");
  });

  it("should handle id and className properties", () => {
    const el = createServerElement("div");
    el.id = "my-id";
    el.className = "my-class";
    expect(el.getAttribute("id")).toBe("my-id");
    expect(el.getAttribute("class")).toBe("my-class");
    expect(el.toString()).toBe('<div class="my-class" id="my-id"></div>');
  });

  it("should handle style methods and cssText", () => {
    const el = createServerElement("div");
    el.style.cssText = "color: red; margin: 10px;";
    expect(el.style.color).toBe("red");
    expect(el.style.margin).toBe("10px");
    expect(el.style.cssText).toBe("color: red; margin: 10px;");

    el.style.setProperty("background-color", "blue");
    expect(el.style.getPropertyValue("background-color")).toBe("blue");

    el.style.removeProperty("color");
    expect(el.style.color).toBe("");
  });

  it("should handle querySelector and queryAll", () => {
    const div = createServerElement("div");
    const p1 = createServerElement("p");
    p1.className = "text";
    const p2 = createServerElement("p");
    p2.id = "main";
    div.appendChild(p1);
    div.appendChild(p2);

    expect(div.querySelector("p")).toBe(p1);
    expect(div.querySelector(".text")).toBe(p1);
    expect(div.querySelector("#main")).toBe(p2);
    expect(div.querySelectorAll("p").length).toBe(2);
  });

  it("should handle matches", () => {
    const el = createServerElement("div");
    el.id = "foo";
    el.classList.add("bar");

    expect(el.matches("div")).toBe(true);
    expect(el.matches("#foo")).toBe(true);
    expect(el.matches(".bar")).toBe(true);
    expect(el.matches("span")).toBe(false);
  });

  it("should not leak internal attributes", () => {
    const el = createServerElement("div");
    // tagName is internal
    expect(el.toString()).toBe("<div></div>");

    // Setting an internal prop like innerHTML should not add it as attribute
    el.innerHTML = "<span></span>";
    expect(el.toString()).toBe("<div><span></span></div>");
    expect(el.getAttribute("innerHTML")).toBeNull();
  });

  it("should handle camelCase aria properties via proxy", () => {
    const el = createServerElement("div");
    el.ariaLabel = "test";
    expect(el.getAttribute("aria-label")).toBe("test");
    expect(el.ariaLabel).toBe("test");
    expect(el.toString()).toBe('<div aria-label="test"></div>');
  });
});
