import { createValue } from "@fimbul-works/seidr";
import { describe, expect, it, vi } from "vitest";
import { useRegisterId } from "./use-register-id.js";

describe("useRegisterId", () => {
  it("registers ID with a plain setter function and unregisters with returned cleanup", () => {
    const setter = vi.fn();
    const register = useRegisterId(setter);

    const unregister = register("elem-123");
    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledWith("elem-123");

    unregister();
    expect(setter).toHaveBeenCalledTimes(2);
    expect(setter).toHaveBeenCalledWith(undefined);
  });

  it("registers and unregisters with a reactive Value", () => {
    const idVal = createValue<string | undefined>(undefined);
    const register = useRegisterId(idVal);

    expect(idVal()).toBeUndefined();

    const unregister = register("field-456");
    expect(idVal()).toBe("field-456");

    unregister();
    expect(idVal()).toBeUndefined();
  });
});
