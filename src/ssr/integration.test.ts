import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../core/dom/element";
import { Seidr } from "../core/seidr";

// Store original SSR env var
const originalSSREnv = process.env.SEIDR_TEST_SSR;

describe("SSR Integration Tests", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Enable SSR mode for all tests
    // @ts-expect-error
    process.env.SEIDR_TEST_SSR = true;
  });

  afterEach(() => {
    // Restore original SSR env var
    if (originalSSREnv) {
      process.env.SEIDR_TEST_SSR = originalSSREnv;
    } else {
      delete process.env.SEIDR_TEST_SSR;
    }

    // Restore original values
    if (originalWindow) {
      (global as any).window = originalWindow;
    } else {
      delete (global as any).window;
    }
  });

  describe("Basic Element Creation in SSR", () => {
    it("should create ServerHTMLElement instead of DOM element", () => {
      const div = $("div", { className: "test" });
      expect(div.constructor.name).toBe("ServerHTMLElement");
      expect(div.tagName).toBe("DIV");
    });

    it("should generate HTML string via toString", () => {
      const div = $("div", { className: "container", id: "main" });
      const html = div.toString();
      expect(html).toBe('<div id="main" class="container"></div>');
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
      expect(html).toBe('<div class="container"><h1>Title</h1><p>Paragraph</p></div>');
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
      const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

      const element = $("div", { textContent: fullName });
      expect(element.toString()).toContain("John Doe");
    });

    it("should handle boolean attributes", () => {
      const isLoading = new Seidr(false);
      const button = $("button", { disabled: isLoading });

      // Initially disabled is false, so attribute shouldn't be present
      expect(button.toString()).not.toContain("disabled");

      isLoading.value = true;
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

      // Create a computed observable for the className
      const alertClass = Seidr.computed(
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
        // @ts-expect-error
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

    it("should escape HTML in attributes", () => {
      const div = $("div", {
        "data-html": '<script>alert("xss")</script>',
      });

      const html = div.toString();
      expect(html).toContain("&lt;script&gt;");
      expect(html).not.toContain("<script>");
    });

    it("should handle boolean attributes", () => {
      const input = $("input", { disabled: true, readOnly: true, required: false });

      const html = input.toString();
      expect(html).toContain("disabled");
      expect(html).toContain("readOnly");
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

    it("should handle function children", () => {
      let callCount = 0;
      const div = $("div", {}, [
        () => {
          callCount++;
          return $("span", { textContent: "Dynamic" });
        },
      ]);

      // Function should be called immediately
      expect(callCount).toBe(1);
      const html = div.toString();
      expect(html).toContain("<span>Dynamic</span>");
    });

    it("should handle deeply nested structures", () => {
      const tree = $("div", { className: "level-1" }, [
        $("div", { className: "level-2" }, [$("div", { className: "level-3" }, [$("span", { textContent: "Deep" })])]),
      ]);

      const html = tree.toString();
      expect(html).toContain("level-1");
      expect(html).toContain("level-2");
      expect(html).toContain("level-3");
      expect(html).toContain(">Deep<");
    });
  });

  describe("Style Handling in SSR", () => {
    it("should handle inline styles", () => {
      const div = $("div");
      (div as any)._style = "color: red; background: blue";

      const html = div.toString();
      expect(html).toContain('style="color: red; background: blue"');
    });

    it("should escape CSS in style attributes", () => {
      const div = $("div");
      (div as any)._style = 'content: "test";';

      const html = div.toString();
      // CSS content property should be escaped in HTML
      expect(html).toContain('style="content: &quot;test&quot;;"');
    });
  });

  describe("classList in SSR", () => {
    it("should support classList methods", () => {
      const div = $("div");
      div.classList.add("foo");
      div.classList.add("bar");

      expect(div.classList.contains("foo")).toBe(true);
      expect(div.classList.contains("bar")).toBe(true);

      div.classList.remove("foo");
      expect(div.classList.contains("foo")).toBe(false);
    });

    it("should sync className with classList", () => {
      const div = $("div");
      div.className = "foo bar";

      expect(div.classList.contains("foo")).toBe(true);
      expect(div.classList.contains("bar")).toBe(true);

      div.classList.add("baz");
      expect(div.className).toBe("foo bar baz");
    });
  });

  describe("cleanup and destroy in SSR", () => {
    it("should support clear method", () => {
      const parent = $("div", {}, [$("div", { textContent: "Child 1" }), $("div", { textContent: "Child 2" })]);

      expect(parent.children.length).toBe(2);
      parent.clear();
      expect(parent.children.length).toBe(0);
    });

    it("should support remove method", () => {
      const parent = $("div", {}, [$("div", { textContent: "Child" })]);
      const child = parent.children[0] as any;

      expect(child.parentElement).toBeDefined();
      child.remove();
      expect(child.parentElement).toBeUndefined();
    });

    it("should support destroy method", () => {
      const element = $("div", {}, [$("div", { textContent: "Child" })]);
      element.remove();

      expect(element.children.length).toBe(0);
    });
  });
});
