import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScope } from "../component";
import { appendChild } from "../dom/append-child";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "../dom/internal";
import { $ } from "../element";
import { describeDualMode } from "../test-setup";
import { SeidrError } from "../types";
import { Safe } from "./safe";

describeDualMode("Safe", ({ getDOMFactory, isSSR }) => {
  let container: HTMLElement;
  let document: Document;

  beforeEach(() => {
    document = getDOMFactory().getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  describe("Basic error boundary functionality", () => {
    it("should render error boundary when factory throws", () => {
      const errorMessage = "Factory error";
      const comp = Safe(
        () => {
          throw new SeidrError(errorMessage);
        },
        (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe(errorMessage);
          return $("div", { textContent: `Error: ${err.message}` });
        },
      );

      expect((comp.element as HTMLElement).textContent).toBe(`Error: ${errorMessage}`);
      expect(comp.startMarker).toBeDefined();
      expect(comp.startMarker.textContent).toContain(`${SEIDR_COMPONENT_START_PREFIX}Safe-`);
      expect(comp.endMarker).toBeDefined();
      expect(comp.endMarker.textContent).toContain(`${SEIDR_COMPONENT_END_PREFIX}Safe-`);
    });

    it("should create new scope for error boundary", () => {
      let errorBoundaryScope: any = null;
      let factoryScope: any = null;

      const _comp = Safe(
        () => {
          const scope = useScope();
          factoryScope = scope;
          throw new SeidrError("Error");
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

      const _comp = Safe(
        () => {
          const scope = useScope();
          scope.track(() => {
            originalScopeDestroyed = true;
          });
          throw new SeidrError("Error");
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
          throw new SeidrError("Root error");
        },
        (_err) => {
          return $("div", { textContent: "Recovered" });
        },
      );

      // Error boundary should render, no console error
      expect(consoleSpy).not.toHaveBeenCalled();
      expect((comp.element as HTMLElement).textContent).toBe("Recovered");

      consoleSpy.mockRestore();
    });

    it("should mark root component even when error occurs", () => {
      const comp = Safe(
        () => {
          throw new SeidrError("Error");
        },
        (_err) => {
          return $("div");
        },
      );

      // Root components have data-seidr-root attribute even when error boundary is used
      expect((comp.element as HTMLElement).dataset.seidrRoot).toBeTruthy();
    });
  });

  describe("Nested component error handling", () => {
    it("should catch child errors with error boundary", () => {
      let caughtError: Error | null = null;

      const ErrorChild = Safe(
        () => {
          throw new SeidrError("Child error");
        },
        (err) => {
          caughtError = err;
          return $("div", { textContent: "Child error caught" });
        },
      );

      // Verify Safe component caught the error
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError!.message).toBe("Child error");
      expect((ErrorChild.element as HTMLElement).textContent).toContain("Child error caught");
    });

    it("should track error boundary component cleanup", () => {
      let errorBoundaryDestroyed = false;

      const comp = Safe(
        () => {
          throw new SeidrError("Error");
        },
        (_err) => {
          const scope = useScope();
          scope.track(() => {
            errorBoundaryDestroyed = true;
          });
          return $("div");
        },
      );

      comp.unmount();

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
          throw new SeidrError("Error");
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

      comp.unmount();

      // Both cleanups should have run
      expect(cleanupLog).toEqual(["factory cleanup", "error boundary cleanup"]);
    });

    it("should allow error boundary to create new resources", () => {
      let eventListenerCalled = false;

      const comp = Safe(
        () => {
          throw new SeidrError("Error");
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
      appendChild(document.body, comp.element);
      if (!isSSR) {
        (comp.element as HTMLButtonElement).click();
        expect(eventListenerCalled).toBe(true);
      }

      comp.unmount();
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

      expect((comp.element as HTMLElement).textContent).toBe("TypeError");
    });

    it("should handle error boundary that throws", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        Safe(
          () => {
            throw new SeidrError("Original error");
          },
          () => {
            throw new SeidrError("Error boundary failed");
          },
        );
      }).toThrow("Error boundary failed");

      consoleSpy.mockRestore();
    });

    it("should handle errors during child component registration", () => {
      let errorCaught = false;

      const Parent = () =>
        Safe(
          () => {
            throw new SeidrError("Parent error during child registration");
          },
          (_err) => {
            errorCaught = true;
            return $("div", { textContent: "Parent error boundary" });
          },
        );

      const parent = Parent();

      expect(errorCaught).toBe(true);
      expect((parent.element as HTMLElement).textContent).toBe("Parent error boundary");
    });
  });
});
