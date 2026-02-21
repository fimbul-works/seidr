import { expect, it } from "vitest";
import { TYPE_ELEMENT, TYPE_PROP } from "../constants";
import { $ } from "../element";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup/dual-mode";

describeDualMode("Dual-Mode PoC", ({ isSSR, getDocument }) => {
  it("should create elements with correct attributes", () => {
    // strict use of className for property assignment compatibility across modes
    const el = $("div", { id: "test-id", className: "btn primary" });

    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el.getAttribute("id")).toBe("test-id");
    expect(el.className).toBe("btn primary");
    expect(el[TYPE_PROP]).toBe(TYPE_ELEMENT);
  });

  it("should handle text content", () => {
    const el = $("span", { textContent: "Hello World" });
    expect(el.textContent).toBe("Hello World");

    // Test update
    el.textContent = "Updated";
    expect(el.textContent).toBe("Updated");
  });

  it("should render reacting to signals", () => {
    const count = new Seidr(0); // Assuming Seidr is the signal implementation
    const el = $("span", {}, [count as any]);

    expect(el.textContent).toBe("0");

    count.value = 1;

    // Reactivity should work synchronously
    expect(el.textContent).toBe("1");
  });

  it("should have correct node connection state", () => {
    const el = $("div");
    expect(el.isConnected).toBe(false);

    if (isSSR) {
      // In SSR, we can't append to global document (JSDOM)
      // Create a server document to test connection logic
      const doc = getDocument();
      doc.body.appendChild(el);
      expect(el.isConnected).toBe(true);
      doc.body.removeChild(el);
      expect(el.isConnected).toBe(false);
    } else {
      document.body.appendChild(el);
      expect(el.isConnected).toBe(true);
      document.body.removeChild(el);
      expect(el.isConnected).toBe(false);
    }
  });

  it("should serialize to string correctly", () => {
    const el = $("div", { className: "container" }, [$("span", { textContent: "Content" })]);

    if (isSSR) {
      // SSR uses toString(), and static elements don't have hydration IDs by default using $
      const html = el.toString();
      expect(html).toBe('<div class="container"><span>Content</span></div>');
    } else {
      expect(el.outerHTML).toBe('<div class="container"><span>Content</span></div>');
    }
  });
});
