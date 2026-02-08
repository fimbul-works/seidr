import { beforeEach, describe, expect, it } from "vitest";
import { useScope } from "../component";
import { $ } from "../element";
import { describeDualMode } from "../test-setup";
import { SeidrError } from "../types";
import { Safe } from "./safe";

describeDualMode("Safe component - Documentation Examples", ({ getDOMFactory, isSSR }) => {
  let document: Document;

  beforeEach(() => {
    document = getDOMFactory().getDocument();
  });

  describe("Basic error boundary example", () => {
    it("should demonstrate basic error boundary usage", () => {
      const comp = Safe(
        () => {
          throw new SeidrError("Component failed to render");
        },
        (err) => {
          console.error("Caught error:", err.message);
          return $("div", {
            className: "error-fallback",
            textContent: "Something went wrong",
          });
        },
      );

      expect(comp.element.className).toBe("error-fallback");
      expect(comp.element.textContent).toBe("Something went wrong");
    });
  });

  describe("Error boundary with error details example", () => {
    it("should display error information in error boundary", () => {
      const comp = Safe(
        () => {
          const data = null as any;
          return $("div", { textContent: data.name }); // Throws: Cannot read property 'name' of null
        },
        (err) => {
          return $("div", { className: "error-boundary" }, [
            $("h2", { textContent: "Error Occurred" }),
            $("p", { textContent: `Error: ${err.message}` }),
            $("button", {
              textContent: "Retry",
              onclick: () => {
                // Handle retry logic
              },
            }),
          ]);
        },
      );

      expect(comp.element.className).toBe("error-boundary");
      expect(comp.element.querySelector("h2")?.textContent).toBe("Error Occurred");
      expect(comp.element.querySelector("p")?.textContent).toContain("Error:");
    });
  });

  describe("Component with error boundary and cleanup example", () => {
    it("should demonstrate proper cleanup with error boundary", () => {
      let subscriptionActive = false;

      const comp = Safe(
        () => {
          const scope = useScope();
          // Simulate resource subscription
          scope.track(() => {
            subscriptionActive = false;
          });
          subscriptionActive = true;

          throw new SeidrError("Failed during initialization");
        },
        (_err) => {
          const scope = useScope();
          // Error boundary can set up its own resources
          const button = $("button", { textContent: "Reload" });

          scope.track(button.on("click", () => {}));

          return button;
        },
      );

      // Original subscription should be cleaned up
      expect(subscriptionActive).toBe(false);

      // Error boundary should have functional button
      document.body.appendChild(comp.element);
      if (!isSSR) {
        (comp.element as HTMLButtonElement).click();
      }
      document.body.removeChild(comp.element);
    });
  });
});
