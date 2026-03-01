import { describe, expect, it } from "vitest";
import { SSRDocument } from "./index";

describe("ServerElement", () => {
  const doc = new SSRDocument();
  it("should stringify simple element", () => {
    const el = doc.createElement("div");
    expect(el.toString()).toBe("<div></div>");
  });

  it("should stringify element with attributes", () => {
    const el = doc.createElement("span");
    el.setAttribute("class", "foo");
    el.setAttribute("id", "bar");
    const str = el.toString();
    expect(str).toContain('class="foo"');
    expect(str).toContain('id="bar"');
    expect(str).toContain("<span");
    expect(str).toContain("></span>");
  });

  it("should handle boolean attributes", () => {
    const el = doc.createElement("input");
    el.setAttribute("disabled", true as unknown as string);
    el.setAttribute("checked", false as unknown as string);
    const str = el.toString();
    expect(str).toContain("disabled");
    expect(str).not.toContain("checked");
    expect(str).toBe("<input disabled />");
  });

  it("should handle self-closing tags", () => {
    const br = doc.createElement("br");
    expect(br.toString()).toBe("<br />");

    const img = doc.createElement("img");
    img.setAttribute("src", "foo.png");
    expect(img.toString()).toBe('<img src="foo.png" />');
  });

  it("should handle style object", () => {
    const el = doc.createElement("div");
    el.style.color = "red";
    el.style.fontSize = "12px";
    expect(el.toString()).toBe('<div style="color: red; font-size: 12px;"></div>');
  });

  it("should handle dataset", () => {
    const el = doc.createElement("div");
    el.dataset.fooBar = "baz";
    expect(el.getAttribute("data-foo-bar")).toBe("baz");
    expect(el.toString()).toBe('<div data-foo-bar="baz"></div>');
  });

  it("should handle nesting", () => {
    const div = doc.createElement("div");
    const span = doc.createElement("span");
    span.textContent = "hello";
    div.appendChild(span);
    expect(div.toString()).toBe("<div><span>hello</span></div>");
  });

  it("should handle innerHTML", () => {
    const div = doc.createElement("div");
    div.innerHTML = "<span>raw</span>";
    expect(div.toString()).toBe("<div><span>raw</span></div>");
    expect(div.innerHTML).toBe("<span>raw</span>");
  });

  it("should escaped text content", () => {
    const p = doc.createElement("p");
    p.textContent = "<b>bold</b>";
    expect(p.toString()).toBe("<p>&lt;b&gt;bold&lt;/b&gt;</p>");
  });

  it("should allow getting/setting arbitrary properties", () => {
    const el = doc.createElement("div") as any;
    el.foo = "bar";
    expect(el.foo).toBe("bar");
    expect(el.getAttribute("foo")).toBe("bar");
    expect(el.toString()).toBe('<div foo="bar"></div>');
  });

  it("should handle boolean properties correctly via proxy", () => {
    const el = doc.createElement("input") as any;
    el.disabled = true;
    expect(el.getAttribute("disabled")).toBe(true);
    expect(el.disabled).toBe(true);

    el.disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
    expect(el.disabled).toBe(false);
  });

  it("should handle classList", () => {
    const el = doc.createElement("div");
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
    const el = doc.createElement("div");
    el.id = "my-id";
    el.className = "my-class";
    expect(el.getAttribute("id")).toBe("my-id");
    expect(el.getAttribute("class")).toBe("my-class");
    expect(el.toString()).toBe('<div class="my-class" id="my-id"></div>');
  });

  it("should handle querySelector and queryAll", () => {
    const div = doc.createElement("div");
    const p1 = doc.createElement("p");
    p1.className = "text";
    const p2 = doc.createElement("p");
    p2.id = "main";
    div.appendChild(p1);
    div.appendChild(p2);

    expect(div.querySelector("p")).toBe(p1);
    expect(div.querySelector(".text")).toBe(p1);
    expect(div.querySelector("#main")).toBe(p2);
    expect(div.querySelectorAll("p").length).toBe(2);
  });

  it("should handle matches", () => {
    const el = doc.createElement("div");
    el.id = "foo";
    el.classList.add("bar");

    expect(el.matches("div")).toBe(true);
    expect(el.matches("#foo")).toBe(true);
    expect(el.matches(".bar")).toBe(true);
    expect(el.matches("span")).toBe(false);
  });

  it("should handle camelCase aria properties via proxy", () => {
    const el = doc.createElement("div") as any;
    el.ariaLabel = "test";
    expect(el.getAttribute("aria-label")).toBe("test");
    expect(el.ariaLabel).toBe("test");
    expect(el.toString()).toBe('<div aria-label="test"></div>');
  });

  it("should handle nextSibling and previousSibling", () => {
    const parent = doc.createElement("div");
    const child1 = doc.createElement("span");
    const child2 = doc.createElement("span");
    const child3 = doc.createElement("span");

    parent.appendChild(child1);
    parent.appendChild(child2);
    parent.appendChild(child3);

    expect(child1.nextSibling).toBe(child2);
    expect(child1.previousSibling).toBe(null);

    expect(child2.nextSibling).toBe(child3);
    expect(child2.previousSibling).toBe(child1);

    expect(child3.nextSibling).toBe(null);
    expect(child3.previousSibling).toBe(child2);
  });

  it("should handle contains recursively", () => {
    const parent = doc.createElement("div");
    const child = doc.createElement("div");
    const grandchild = doc.createTextNode("foo");

    parent.appendChild(child);
    child.appendChild(grandchild);

    expect(parent.contains(child)).toBe(true);
    expect(parent.contains(grandchild)).toBe(true);
    expect(child.contains(grandchild)).toBe(true);
    expect(grandchild.contains(parent)).toBe(false);
    expect(parent.contains(parent)).toBe(true);
  });

  it("should moves node from existing parent", () => {
    const p1 = doc.createElement("div");
    const p2 = doc.createElement("div");
    const child = doc.createElement("span");

    p1.appendChild(child);
    expect(p1.childNodes.length).toBe(1);
    expect(child.parentNode).toBe(p1);

    p2.appendChild(child);
    expect(p1.childNodes.length).toBe(0);
    expect(p2.childNodes.length).toBe(1);
    expect(child.parentNode).toBe(p2);
  });

  it("should detect cycles and hierarchy errors", () => {
    const parent = doc.createElement("div");
    const child = doc.createElement("div");
    parent.appendChild(child);

    expect(() => parent.appendChild(parent)).toThrow("Cycle detected");
    expect(() => child.appendChild(parent)).toThrow("Hierarchy error");
  });

  it("should handle text node merging via normalize", () => {
    const parent = doc.createElement("div");
    const t1 = doc.createTextNode("Hello ");
    const t2 = doc.createTextNode("World");

    parent.appendChild(t1);
    parent.appendChild(t2);

    expect(parent.childNodes.length).toBe(2);
    expect(parent.textContent).toBe("Hello World");

    parent.normalize();
    expect(parent.childNodes.length).toBe(1);
    expect(parent.textContent).toBe("Hello World");
  });

  it("should handle append and prepend", () => {
    const parent = doc.createElement("div");
    const child1 = doc.createElement("span");
    const child2 = doc.createElement("span");

    parent.append(child1);
    parent.prepend(child2);

    expect(parent.childNodes[0]).toBe(child2);
    expect(parent.childNodes[1]).toBe(child1);
  });

  it("should handle replaceChildren", () => {
    const parent = doc.createElement("div");
    const child1 = doc.createElement("span");
    const child2 = doc.createElement("span");

    parent.appendChild(child1);
    parent.replaceChildren(child2);

    expect(parent.childNodes.length).toBe(1);
    expect(parent.childNodes[0]).toBe(child2);
    expect(child1.parentNode).toBe(null);
  });

  it("should handle insertBefore", () => {
    const parent = doc.createElement("div");
    const child1 = doc.createElement("span");
    const child2 = doc.createElement("span");

    parent.appendChild(child1);
    parent.insertBefore(child2, child1);

    expect(parent.childNodes[0]).toBe(child2);
    expect(parent.childNodes[1]).toBe(child1);
  });
});
