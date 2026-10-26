import { createValue } from "@fimbul-works/seidr";
import { describe, expect, it, vi } from "vitest";
import { useDisclosureState } from "./use-disclosure-state.js";

describe("useDisclosureState", () => {
  it("defaults to closed when defaultOpen is not specified", () => {
    const state = useDisclosureState();
    expect(state.isOpen()).toBe(false);
  });

  it("can be default open (uncontrolled)", () => {
    const state = useDisclosureState({ defaultOpen: true });
    expect(state.isOpen()).toBe(true);
  });

  it("can be controlled", () => {
    const onChange = vi.fn();
    const controlled = createValue(true);
    const state = useDisclosureState({
      open: controlled,
      onOpenChange: onChange,
    });

    expect(state.isOpen()).toBe(true);
    state.toggle();
    expect(state.isOpen()).toBe(false);
    expect(controlled()).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false, true);
  });

  it("sets isOpen state with setIsOpen", () => {
    const state = useDisclosureState({ defaultOpen: false });
    expect(state.isOpen()).toBe(false);

    state.setIsOpen(true);
    expect(state.isOpen()).toBe(true);

    state.setIsOpen(false);
    expect(state.isOpen()).toBe(false);
  });

  it("opens with open()", () => {
    const state = useDisclosureState({ defaultOpen: false });
    expect(state.isOpen()).toBe(false);

    state.open();
    expect(state.isOpen()).toBe(true);
  });

  it("closes with close()", () => {
    const state = useDisclosureState({ defaultOpen: true });
    expect(state.isOpen()).toBe(true);

    state.close();
    expect(state.isOpen()).toBe(false);
  });

  it("toggles with toggle()", () => {
    const state = useDisclosureState({ defaultOpen: false });
    expect(state.isOpen()).toBe(false);

    state.toggle();
    expect(state.isOpen()).toBe(true);

    state.toggle();
    expect(state.isOpen()).toBe(false);
  });
});
