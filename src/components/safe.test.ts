import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { onUnmounted } from "../component/lifecycle/on-unmounted";
import { mount } from "../dom/mount";
import { $ } from "../element";
import { describeDualMode } from "../test-setup";
import { type CleanupFunction, SeidrError } from "../types";
import { Safe } from "./safe";

describeDualMode("Safe", ({ getDocument }) => {
  let container: HTMLElement;
  let document: Document;
  let unmount: CleanupFunction;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    document = getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    unmount?.();
    container?.remove();
    consoleSpy.mockRestore();
  });

  describe("Basic error boundary functionality", () => {
    it("should render error boundary when factory throws", () => {
      const errorMessage = "Factory error";
      const comp = Safe(
        () => {
          throw new SeidrError(errorMessage);
        },
        (err: Error) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe(errorMessage);
          return $("div", { textContent: `Error: ${err.message}` });
        },
      );

      unmount = mount(() => comp, container);

      expect(container.textContent).toBe(`Error: ${errorMessage}`);
    });
  });

  describe("Root component error handling", () => {
    it("should use error boundary when provided", () => {
      const comp = Safe(
        () => {
          throw new SeidrError("Root error");
        },
        () => {
          return $("div", { textContent: "Recovered" });
        },
      );

      unmount = mount(() => comp, container);

      expect(consoleSpy).toHaveBeenCalled();
      expect(container.textContent).toBe("Recovered");
    });
  });

  describe("Nested component error handling", () => {
    it("should catch child errors with error boundary", () => {
      let caughtError: Error | null = null;

      const ErrorChild = Safe(
        () => {
          throw new SeidrError("Child error");
        },
        (err: Error) => {
          caughtError = err;
          return $("div", { textContent: "Child error caught" });
        },
      );

      unmount = mount(() => ErrorChild, container);

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
        () => {
          onUnmounted(() => {
            errorBoundaryDestroyed = true;
          });
          return $("div");
        },
      );

      unmount = mount(() => comp, container);
      unmount();

      expect(errorBoundaryDestroyed).toBe(true);
    });
  });

  describe("Error boundary edge cases", () => {
    it("should handle synchronous errors during component creation", () => {
      const comp = Safe(
        () => {
          throw new TypeError("Type error");
        },
        (err: Error) => {
          return $("div", { textContent: err.name });
        },
      );

      unmount = mount(() => comp, container);
      expect(container.textContent).toBe("TypeError");
    });

    it("should handle error boundary that throws", () => {
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
    });
  });
});
