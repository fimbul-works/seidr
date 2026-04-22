import { describe, test, expect, vi, beforeEach } from "vitest";
import { Safe, mount, useScope } from "@fimbul-works/seidr";
import { $div, $h2, $p } from "@fimbul-works/seidr/html";

describe("docs/Safe.md Examples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  test("Basic Safe Example", () => {
    const UserProfile = Safe(
      () => {
        // Initialization that might fail
        JSON.parse("invalid json");
        return $div({ textContent: "Success" });
      },
      (err) => {
        // Error boundary: return fallback UI
        return $div({ className: "error" }, [$h2({ textContent: "Error Occurred" }), $p({ textContent: err.message })]);
      },
    );

    mount(UserProfile, document.body);
    expect(document.body.querySelector(".error")).not.toBeNull();
    expect(document.body.textContent).toContain("Unexpected token");
  });

  test("Safe with onUnmount tracking", () => {
    const componentCleanup = vi.fn();
    const errorBoundaryCleanup = vi.fn();

    const SafeComponent = Safe(
      () => {
        useScope().onUnmount(componentCleanup);
        throw new Error("Failed");
      },
      (err) => {
        useScope().onUnmount(errorBoundaryCleanup);
        return $div({ textContent: "Fallback UI" });
      },
    );

    const unmount = mount(SafeComponent, document.body);
    expect(document.body.textContent).toContain("Fallback UI");
    expect(componentCleanup).toHaveBeenCalled(); // Original scope cleaned up immediately on error

    unmount();
    expect(errorBoundaryCleanup).toHaveBeenCalled();
  });
});
