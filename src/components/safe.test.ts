import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type Component, useScope } from "../component";
import { appendChild } from "../dom/append-child";
import { mount } from "../dom/mount";
import { $ } from "../element";
import { describeDualMode } from "../test-setup";
import { type CleanupFunction, SeidrError } from "../types";
import { Safe } from "./safe";

describeDualMode("Safe", ({ getDocument, isSSR }) => {
  let container: HTMLElement;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    document = getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmount?.();
    document.body.removeChild(container);
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

      unmount = mount(comp, container);

      expect(container.textContent).toBe(`Error: ${errorMessage}`);
    });

    it("should create new scope for error boundary", () => {
      let errorBoundaryScope: any = null;
      let factoryScope: any = null;

      const comp = Safe(
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

      unmount = mount(comp, container);

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
          throw new SeidrError("Error");
        },
        (_err) => {
          return $("div");
        },
      );

      unmount = mount(comp, container);

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

      unmount = mount(comp, container);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(container.textContent).toBe("Recovered");

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

      unmount = mount(comp, container);
      expect(container.querySelector("[data-seidr-root]")).toBeTruthy();
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

      unmount = mount(ErrorChild, container);

      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError!.message).toBe("Child error");
      expect(container.textContent).toContain("Child error caught");
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

      expect(cleanupLog).toContain("factory cleanup");

      comp.unmount();

      expect(cleanupLog).toEqual(["factory cleanup", "error boundary cleanup"]);
    });

    it("should allow error boundary to create new resources", () => {
      let eventListenerCalled = false;

      const comp = Safe(
        () => {
          throw new SeidrError("Error");
        },
        (_err) => {
          const button = $("button", { textContent: "Retry" });
          button.onclick = () => {
            eventListenerCalled = true;
          };
          return button;
        },
      );

      appendChild(document.body, comp.element);
      if (!isSSR) {
        ((comp.element as Component).element as HTMLElement).click();
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

      unmount = mount(comp, container);
      expect(container.textContent).toBe("TypeError");
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
      unmount = mount(parent, container);
      expect(container.textContent).toBe("Parent error boundary");
    });
  });
});
