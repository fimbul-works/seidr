import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../element/create-element";
import { flushSync } from "../seidr/scheduler";
import { Seidr } from "../seidr/seidr";
import { enableSSRMode } from "../test-setup";

describe("SSR Integration Tests", () => {
  let cleanup: () => void;
  beforeEach(() => {
    cleanup = enableSSRMode();
  });

  afterEach(() => {
    cleanup?.();
  });

  describe("Basic Element Creation in SSR", () => {
    it("should create ServerHTMLElement instead of DOM element", () => {
      const div = $("div", { className: "test" });
      expect(div.nodeType).toBe(1);
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
    it("should handle initial value from Seidr observable", () => {
      const count = new Seidr(42);
      const display = $("span", { textContent: count.as((n) => `Count: ${n}`) });

      // SSR should capture the initial value
      expect(display.toString()).toContain("Count: 42");
    });

    it("should handle derived values", () => {
      const firstName = new Seidr("John");
      const lastName = new Seidr("Doe");
      const fullName = Seidr.merge(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

      const element = $("div", { textContent: fullName });
      expect(element.toString()).toContain("John Doe");
    });

    it("should handle boolean attributes", () => {
      const isLoading = new Seidr(false);
      const button = $("button", { disabled: isLoading });

      // Initially disabled is false, so attribute shouldn't be present
      expect(button.toString()).not.toContain("disabled");

      isLoading.value = true;
      flushSync();
      // In SSR, the binding updates the ServerHTMLElement
      expect(button.toString()).toContain("disabled");
    });

    it("should handle class binding", () => {
      const isActive = new Seidr(true);
      // @ts-expect-error
      const button = $("button", { className: isActive.as((a) => (a ? "active" : "")) });

      expect(button.toString()).toContain("active");
    });

    it("should handle multiple reactive props", () => {
      const theme = new Seidr("dark");
      const count = new Seidr(5);

      const card = $("div", {
        className: theme.as((t) => `card theme-${t}`),
        "data-count": count,
      });

      const html = card.toString();
      expect(html).toContain('class="card theme-dark"');
      expect(html).toContain('data-count="5"');
    });
  });

  describe("Form Elements in SSR", () => {
    it("should handle input element with value and type", () => {
      const input = $("input", { type: "text", value: "test value", placeholder: "Enter text" });

      const html = input.toString();
      expect(html).toContain('type="text"');
      expect(html).toContain('value="test value"');
      expect(html).toContain('placeholder="Enter text"');
      expect(html).toMatch(/<input\s+.*\s+\/>/);
    });

    it("should handle checkbox with checked state", () => {
      const isChecked = new Seidr(true);
      const checkbox = $("input", { type: "checkbox", checked: isChecked });

      const html = checkbox.toString();
      expect(html).toContain('type="checkbox"');
      expect(html).toContain("checked");
    });

    it("should handle disabled button", () => {
      const isDisabled = new Seidr(true);
      const button = $("button", { disabled: isDisabled, textContent: "Click me" });

      const html = button.toString();
      expect(html).toContain("disabled");
      expect(html).toContain(">Click me<");
    });
  });

  describe("Complex SSR Scenarios", () => {
    it("should render a complete user profile", () => {
      const user = new Seidr({ name: "Alice", email: "alice@example.com", age: 30 });

      const profile = $("div", { className: "user-profile" }, [
        $("h2", { textContent: user.as((u) => u.name) }),
        $("p", { textContent: user.as((u) => `Email: ${u.email}`) }),
        $("p", { textContent: user.as((u) => `Age: ${u.age}`) }),
      ]);

      const html = profile.toString();
      expect(html).toContain("Alice");
      expect(html).toContain("alice@example.com");
      expect(html).toContain("Age: 30");
    });

    it("should render a todo list", () => {
      const todos = new Seidr([
        { id: 1, text: "Learn Seidr", completed: false },
        { id: 2, text: "Build SSR app", completed: true },
      ]);

      const list = $("ul", { className: "todo-list" }, [
        ...(todos.value.map((todo) =>
          $("li", {
            className: todo.completed ? "completed" : "",
            textContent: todo.text,
          }),
        ) as any),
      ]);

      const html = list.toString();
      expect(html).toContain("Learn Seidr");
      expect(html).toContain("Build SSR app");
      expect(html).toContain("completed");
    });

    it("should render a navigation menu", () => {
      const isActive = new Seidr("home");

      const nav = $("nav", { className: "main-nav" }, [
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

      const html = nav.toString();
      expect(html).toContain('class="active"');
      expect(html).toContain("Home");
      expect(html).toContain('href="/home"');
    });

    it("should handle conditional class binding based on multiple states", () => {
      const isLoading = new Seidr(false);
      const hasError = new Seidr(false);
      const isSuccess = new Seidr(true);

      // Create a merge observable for the className
      const alertClass = Seidr.merge(
        () =>
          ["alert", isLoading.value && "loading", hasError.value && "error", isSuccess.value && "success"]
            .filter(Boolean)
            .join(" "),
        [isLoading, hasError, isSuccess],
      );

      const alert = $("div", {
        className: alertClass,
      });

      const html = alert.toString();
      expect(html).toContain("alert");
      expect(html).toContain("success");
      expect(html).not.toContain("loading");
      expect(html).not.toContain("error");
    });
  });

  describe("Event Handlers in SSR", () => {
    it("should return cleanup function from on() method", () => {
      const button = $("button");
      const cleanup = button.on("click", () => {});

      expect(typeof cleanup).toBe("function");
      expect(cleanup()).toBeUndefined();
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
      const button = $("button", {
        "aria-label": "Close dialog",
        "aria-expanded": "false",
      });

      const html = button.toString();
      expect(html).toContain('aria-label="Close dialog"');
      expect(html).toContain('aria-expanded="false"');
    });

    it("should handle data attributes", () => {
      const div = $("div", {
        "data-id": "123",
        "data-name": "test",
      });

      const html = div.toString();
      expect(html).toContain('data-id="123"');
      expect(html).toContain('data-name="test"');
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
      expect(html).toContain("Text before ");
      expect(html).toContain("<strong>bold</strong>");
      expect(html).toContain(" text after");
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
    it("should support clearChildren method", () => {
      const element = $("div", {}, [$("div", { textContent: "Child 1" }), $("div", { textContent: "Child 2" })]);
      expect(element.children.length).toBe(2);

      (element as any).clearChildren();
      expect(element.children.length).toBe(0);
    });

    it("should support remove method", () => {
      const parent = $("div");
      const child = $("div");
      parent.appendChild(child);
      expect(parent.children.length).toBe(1);

      child.remove();
      expect(parent.children.length).toBe(0);
    });

    it("should support destroy method", () => {
      const element = $("div", {}, [$("div", { textContent: "Child" })]);
      element.remove();

      // Structure remains, but it's officially "unmounted" and cleaned up
      expect(element.children.length).toBe(1);
    });
  });
});
