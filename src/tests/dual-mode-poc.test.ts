import { describe, expect, it } from "vitest";
import { $ } from "../element/element";
import { describeDualMode, itHasParity, renderToHtml } from "../test-setup/dual-mode";

describeDualMode("Dual Mode POC", ({ mode }) => {
  it(`should render the same HTML in ${mode}`, () => {
    const el = $("div", { className: "test", id: "foo" }, ["Hello"]);
    const html = renderToHtml(el);

    // We expect basic elements to look the same, but attribute order might vary.
    // Our ServerElement implementation sorts attributes for consistency.
    // JSDOM might not.
    if (mode === "SSR") {
      expect(html).toBe('<div class="test" id="foo">Hello</div>');
    } else {
      // JSDOM usually sorts or maintains order.
      expect(html).toContain('class="test"');
      expect(html).toContain('id="foo"');
    }
  });
});

describe("Parity Helper", () => {
  itHasParity("should have parity for a simple div", () => {
    return $("div", { className: "test" }, ["Hello"]);
  });

  itHasParity("should have parity for nested elements", () => {
    return $("div", { className: "container" }, [
      $("h1", { textContent: "Title" }),
      $("p", { textContent: "Content" }),
    ]);
  });
});
