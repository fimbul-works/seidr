import { describe, expect, it, vi } from "vitest";
import { component, useScope } from "../component";
import { $ } from "../element";
import { Safe } from "./safe";

describe("Safe", () => {
  describe("Basic error boundary functionality", () => {
    it("should render error boundary when factory throws", () => {
      const errorMessage = "Factory error";
      const comp = Safe(
        () => {
          throw new Error(errorMessage);
        },
        (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe(errorMessage);
          return $("div", { textContent: `Error: ${err.message}` });
        },
      );

      expect(comp.element.textContent).toBe(`Error: ${errorMessage}`);
    });

    it("should create new scope for error boundary", () => {
      let errorBoundaryScope: any = null;
      let factoryScope: any = null;

      const comp = Safe(
        () => {
          const scope = useScope();
          factoryScope = scope;
          throw new Error("Error");
        },
        (_err) => {
          const scope = useScope();
          errorBoundaryScope = scope;
          return $("div");
        },
      );

      // Error boundary should receive a different (fresh) scope than the factory
      expect(errorBoundaryScope).not.toBe(factoryScope);
      expect(errorBoundaryScope).toBeDefined();
      expect(factoryScope).toBeDefined();
    });

    it("should destroy original scope before creating error boundary", () => {
      let originalScopeDestroyed = false;

      const comp = Safe(
        () => {
          const scope = useScope();
          scope.track(() => {
            originalScopeDestroyed = true;
          });
          throw new Error("Error");
        },
        (_err) => {
          return $("div");
        },
      );

      // Original scope should be destroyed
      expect(originalScopeDestroyed).toBe(true);
    });
  });

  describe("Root component error handling", () => {
    it("should use error boundary when provided", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const comp = Safe(
        () => {
          throw new Error("Root error");
        },
        (_err) => {
          return $("div", { textContent: "Recovered" });
        },
      );

      // Error boundary should render, no console error
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(comp.element.textContent).toBe("Recovered");

      consoleSpy.mockRestore();
    });

    it("should mark root component even when error occurs", () => {
      const comp = Safe(
        () => {
          throw new Error("Error");
        },
        (_err) => {
          return $("div");
        },
      );

      // Root components have data-seidr-root attribute even when error boundary is used
      expect(comp.element.dataset.seidrRoot).toBeTruthy();
    });
  });

  describe("Nested component error handling", () => {
    it("should catch child errors with error boundary", () => {
      let caughtError: Error | null = null;

      const ErrorChild = Safe(
        () => {
          throw new Error("Child error");
        },
        (err) => {
          caughtError = err;
          return $("div", { textContent: "Child error caught" });
        },
      );

      // Verify Safe component caught the error
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError!.message).toBe("Child error");
      expect(ErrorChild.element.textContent).toContain("Child error caught");
    });

    it("should track error boundary component cleanup", () => {
      let errorBoundaryDestroyed = false;

      const comp = Safe(
        () => {
          throw new Error("Error");
        },
        (_err) => {
          const scope = useScope();
          scope.track(() => {
            errorBoundaryDestroyed = true;
          });
          return $("div");
        },
      );

      comp.destroy();

      // Error boundary cleanup should run
      expect(errorBoundaryDestroyed).toBe(true);
    });
  });

  describe("Error boundary with resources", () => {
    it("should cleanup factory resources before error boundary renders", () => {
      const cleanupLog: string[] = [];

      const comp = Safe(
        () => {
          const scope = useScope();
          scope.track(() => {
            cleanupLog.push("factory cleanup");
          });
          throw new Error("Error");
        },
        (_err) => {
          const scope = useScope();
          scope.track(() => {
            cleanupLog.push("error boundary cleanup");
          });
          return $("div");
        },
      );

      // Factory cleanup should have run
      expect(cleanupLog).toContain("factory cleanup");

      comp.destroy();

      // Both cleanups should have run
      expect(cleanupLog).toEqual(["factory cleanup", "error boundary cleanup"]);
    });

    it("should allow error boundary to create new resources", () => {
      let eventListenerCalled = false;

      const comp = Safe(
        () => {
          throw new Error("Error");
        },
        (_err) => {
          const scope = useScope();
          const button = $("button", { textContent: "Retry" });
          scope.track(
            button.on("click", () => {
              eventListenerCalled = true;
            }),
          );
          return button;
        },
      );

      // Error boundary resources should work correctly
      document.body.appendChild(comp.element);
      (comp.element as HTMLButtonElement).click();

      expect(eventListenerCalled).toBe(true);

      document.body.removeChild(comp.element);
    });
  });

  describe("Error boundary edge cases", () => {
    it("should handle synchronous errors during component creation", () => {
      const comp = Safe(
        () => {
          throw new TypeError("Type error");
        },
        (err) => {
          return $("div", { textContent: err.name });
        },
      );

      expect(comp.element.textContent).toBe("TypeError");
    });

    it("should handle error boundary that throws", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        Safe(
          () => {
            throw new Error("Original error");
          },
          () => {
            throw new Error("Error boundary failed");
          },
        );
      }).toThrow("Error boundary failed");

      consoleSpy.mockRestore();
    });

    it("should handle error boundary returning null/undefined", () => {
      const comp = Safe(
        () => {
          throw new Error("Error");
        },
        () => {
          return null as any;
        },
      );

      // Component will have null element - user's responsibility to return valid element
      expect(comp.element).toBeNull();
    });

    it("should handle errors during child component registration", () => {
      let errorCaught = false;

      const Parent = () =>
        Safe(
          () => {
            throw new Error("Parent error during child registration");
          },
          (err) => {
            errorCaught = true;
            return $("div", { textContent: "Parent error boundary" });
          },
        );

      const parent = Parent();

      expect(errorCaught).toBe(true);
      expect(parent.element.textContent).toBe("Parent error boundary");
    });
  });

  describe("Documentation Examples", () => {
    describe("Basic error boundary example", () => {
      it("should demonstrate basic error boundary usage", () => {
        const comp = Safe(
          () => {
            throw new Error("Component failed to render");
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

            throw new Error("Failed during initialization");
          },
          (_err) => {
            const scope = useScope();
            // Error boundary can set up its own resources
            const button = $("button", { textContent: "Reload" });

            scope.track(
              button.on("click", () => {
                console.log("Reloading...");
              }),
            );

            return button;
          },
        );

        // Original subscription should be cleaned up
        expect(subscriptionActive).toBe(false);

        // Error boundary should have functional button
        document.body.appendChild(comp.element);
        (comp.element as HTMLButtonElement).click();
        document.body.removeChild(comp.element);
      });
    });
  });
});
