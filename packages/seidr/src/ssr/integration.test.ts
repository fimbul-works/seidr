import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../element/create-element.js";
import { createValue, mergeValues } from "../observable/value.js";
import { enableSSRMode } from "../test-setup/index.js";
import { createComponent, getDocument, mount } from "../index.core.js";
import { SSRElement } from "./dom/ssr-element.js";
import { isHTMLElement } from "../dom/type-guards.js";
import { renderToString } from "./render-to-string.js";

describe("SSR Integration Tests", () => {
  let cleanup: () => void;
  let document: Document;

  beforeEach(() => {
    cleanup = enableSSRMode();
    document = getDocument();
  });

  afterEach(() => {
    cleanup?.();
  });

  describe("Basic Element Creation in SSR", () => {
    it("should create ServerHTMLElement instead of DOM element", () => {
      const div = $("div", { className: "test" });

      expect(isHTMLElement(div)).toBeTruthy();
      expect(div).toBeInstanceOf(SSRElement);
      expect(div.tagName).toBe("DIV");
    });

    it("should generate HTML string via toString", () => {
      const div = $("div", { className: "container", id: "main" });

      const html = div.toString();
      expect(html).toContain('id="main"');
      expect(html).toContain('class="container"');
    });

    it("should handle textContent correctly", () => {
      const h1 = $("h1", { textContent: "Hello World" });

      expect(h1.toString()).toBe("<h1>Hello World</h1>");
    });

    it("should handle nested elements", () => {
      const container = $("div", { className: "container" }, [
        $("h1", { textContent: "Title" }),
        $("p", { textContent: "Paragraph" }),
      ]);

      const html = container.toString();
      expect(html).toContain('<div class="container">');
      expect(html).toContain("<h1>Title</h1>");
      expect(html).toContain("<p>Paragraph</p>");
    });
  });

  describe("Reactive Bindings in SSR", () => {
    it("should handle initial value from Value observable", async () => {
      const { html } = await renderToString(() => {
        const count = createValue(42);
        return $("span", { textContent: count.as((n) => `Count: ${n}`) });
      });

      expect(html).toContain("Count: 42");
    });

    it("should handle derived values", async () => {
      const { html } = await renderToString(() => {
        const firstName = createValue("John");
        const lastName = createValue("Doe");
        const fullName = mergeValues(() => `${firstName()} ${lastName()}`);
        return $("div", { textContent: fullName });
      });

      expect(html).toContain("John Doe");
    });

    it("should handle boolean attributes", () => {
      const isLoading = createValue(false);

      const unmount = mount(() => {
        return $("button", { disabled: isLoading });
      }, document.body);

      // Initially disabled is false, so attribute shouldn't be present
      expect(document.body.toString()).not.toContain("disabled");

      isLoading(true);

      // In SSR, the binding updates the ServerHTMLElement
      expect(document.body.toString()).toContain("disabled");

      unmount();
      isLoading.destroy();
    });

    it("should handle class binding", async () => {
      const { html } = await renderToString(() => {
        const isActive = createValue(true);
        return $("button", { className: isActive.as<string>((a) => (a ? "active" : "")) });
      });

      expect(html).toContain("active");
    });

    it("should handle multiple reactive props", async () => {
      const { html } = await renderToString(() => {
        const theme = createValue("dark");
        const count = createValue(5);

        return $("div", {
          className: theme.as((t) => `card theme-${t}`),
          "data-count": count,
        });
      });

      expect(html).toContain('class="card theme-dark"');
      expect(html).toContain('data-count="5"');
    });
  });

  describe("Form Elements in SSR", () => {
    it("should handle input element with value and type", async () => {
      const { html } = await renderToString(() => {
        return $("input", { type: "text", value: "test value", placeholder: "Enter text" });
      }, document.body);

      expect(html).toContain('type="text"');
      expect(html).toContain('value="test value"');
      expect(html).toContain('placeholder="Enter text"');
      expect(html).toMatch(/<input\s+.*\s+\/>/);
    });

    it("should handle checkbox with checked state", async () => {
      const { html } = await renderToString(() => {
        const isChecked = createValue(true);
        return $("input", { type: "checkbox", checked: isChecked });
      }, document.body);

      expect(html).toContain('type="checkbox"');
      expect(html).toContain("checked");
    });

    it("should handle disabled button", async () => {
      const { html } = await renderToString(() => {
        const isDisabled = createValue(true);
        return $("button", { disabled: isDisabled, textContent: "Click me" });
      }, document.body);

      expect(html).toContain("disabled");
      expect(html).toContain(">Click me<");
    });
  });

  describe("Complex SSR Scenarios", () => {
    it("should render a complete user profile", async () => {
      const { html } = await renderToString(() => {
        const user = createValue({ name: "Alice", email: "alice@example.com", age: 30 });
        return $("div", { className: "user-profile" }, [
          $("h2", { textContent: user.as((u) => u.name) }),
          $("p", { textContent: user.as((u) => `Email: ${u.email}`) }),
          $("p", { textContent: user.as((u) => `Age: ${u.age}`) }),
        ]);
      }, document.body);

      expect(html).toContain("Alice");
      expect(html).toContain("alice@example.com");
      expect(html).toContain("Age: 30");
    });

    it("should render a todo list", async () => {
      const { html } = await renderToString(() => {
        const todos = createValue([
          { id: 1, text: "Learn Seidr", completed: false },
          { id: 2, text: "Build SSR app", completed: true },
        ]);

        return $("ul", { className: "todo-list" }, [
          ...todos().map((todo) =>
            $("li", {
              className: todo.completed ? "completed" : "",
              textContent: todo.text,
            }),
          ),
        ]);
      });

      expect(html).toContain("Learn Seidr");
      expect(html).toContain("Build SSR app");
      expect(html).toContain("completed");
    });

    it("should render a navigation menu", async () => {
      const { html } = await renderToString(() => {
        const isActive = createValue("home");

        return $("nav", { className: "main-nav" }, [
          $("a", {
            href: "/home",
            className: isActive.as<string>((a) => (a === "home" ? "active" : "")),
            textContent: "Home",
          }),
          $("a", {
            href: "/about",
            className: isActive.as<string>((a) => (a === "about" ? "active" : "")),
            textContent: "About",
          }),
          $("a", {
            href: "/contact",
            className: isActive.as<string>((a) => (a === "contact" ? "active" : "")),
            textContent: "Contact",
          }),
        ]);
      });

      expect(html).toContain('class="active"');
      expect(html).toContain("Home");
      expect(html).toContain('href="/home"');
    });

    it("should handle show class binding based on multiple states", async () => {
      const { html } = await renderToString(() => {
        const isLoading = createValue(false);
        const hasError = createValue(false);
        const isSuccess = createValue(true);

        // Create a merge observable for the className
        const alertClass = mergeValues(() =>
          ["alert", isLoading() && "loading", hasError() && "error", isSuccess() && "success"]
            .filter(Boolean)
            .join(" "),
        );

        const alert = $("div", {
          className: alertClass,
        });
        return alert;
      }, document.body);

      expect(html).toContain("alert");
      expect(html).toContain("success");
      expect(html).not.toContain("loading");
      expect(html).not.toContain("error");
    });
  });

  describe("Self-Closing Tags in SSR", () => {
    it("should render void elements correctly", () => {
      const img = $("img", { src: "/image.png", alt: "Test image" });
      const html = img.toString();
      expect(html).toContain('src="/image.png"');
      expect(html).toContain('alt="Test image"');
      expect(html).toMatch(/<img\s+.*\s+\/>/);
    });

    it("should render input elements", () => {
      const input = $("input", { type: "text", id: "name" });
      const html = input.toString();
      expect(html).toContain('type="text"');
      expect(html).toContain('id="name"');
      expect(html).toMatch(/<input\s+.*\s+\/>/);
    });

    it("should render br elements", () => {
      const br = $("br");
      expect(br.toString()).toBe("<br />");
    });
  });

  describe("Attribute Handling in SSR", () => {
    it("should handle aria attributes", () => {
      const button1 = $("button", {
        "aria-label": "Close dialog",
        "aria-expanded": "false",
      });

      const button2 = $("button", {
        ariaLabel: "Close dialog",
        ariaExpanded: "false",
      });

      const html1 = button1.toString();
      expect(html1).toContain('aria-label="Close dialog"');
      expect(html1).toContain('aria-expanded="false"');
      expect(button2.toString()).toEqual(html1);
    });

    it("should handle data attributes", () => {
      const div1 = $("div", {
        "data-id": "123",
        "data-name": "test",
      });

      const div2 = $("div", {
        dataId: "123",
        dataName: "test",
      });

      const html1 = div1.toString();
      expect(html1).toContain('data-id="123"');
      expect(html1).toContain('data-name="test"');
      expect(div2.toString()).toEqual(html1);
    });

    it("should allow HTML in attributes for now", () => {
      const div = $("div", {
        "data-html": '<script>alert("xss")</script>',
      });

      const html = div.toString();
      expect(html).toContain('data-html="<script>alert(&quot;xss&quot;)</script>"');
    });

    it("should handle boolean attributes", () => {
      const input = $("input", { disabled: true, readOnly: true, required: false });

      const html = input.toString();
      expect(html).toContain("disabled");
      expect(html).toContain("readonly");
      expect(html).not.toContain("required");
    });
  });

  describe("Children Handling in SSR", () => {
    it("should handle mixed text and element children", () => {
      const p = $("p", {}, ["Text before ", $("strong", { textContent: "bold" }), " text after"]);

      const html = p.toString();
      expect(html).toContain("Text before <strong>bold</strong> text after");
    });
  });

  describe("Style Handling in SSR", () => {
    it("should handle inline styles", () => {
      const div = $("div");
      div.style = "color: red; background: blue";

      const html = div.toString();
      expect(html).toContain('style="background: blue; color: red;"');
    });

    it("should not escape CSS in style attributes", () => {
      const div = $("div");
      div.style = 'content: "test";';

      const html = div.toString();
      // CSS content property MUST be escaped in HTML attributes
      expect(html).toContain('style="content: &quot;test&quot;;"');
    });
  });

  describe("classList in SSR", () => {
    it("should support classList methods", () => {
      const div = $("div");
      div.classList.add("active", "visible");
      expect(div.className).toContain("active");
      expect(div.className).toContain("visible");

      div.classList.remove("visible");
      expect(div.className).toContain("active");
      expect(div.className).not.toContain("visible");

      div.classList.toggle("toggled");
      expect(div.className).toContain("toggled");

      div.classList.toggle("toggled");
      expect(div.className).not.toContain("toggled");
    });

    it("should sync className with classList", () => {
      const div = $("div", { className: "initial" });
      expect(div.classList.contains("initial")).toBe(true);

      div.className = "updated";
      expect(div.classList.contains("updated")).toBe(true);
      expect(div.classList.contains("initial")).toBe(false);
    });
  });

  describe("cleanup and destroy in SSR", () => {
    it("should support remove method", () => {
      const parent = $("div");
      const child = $("div");
      parent.appendChild(child);
      expect(parent.children.length).toBe(1);

      child.remove();
      expect(parent.children.length).toBe(0);
    });
  });
});
