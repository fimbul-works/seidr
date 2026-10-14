import { createValue } from "@fimbul-works/seidr";
import { describe, expect, it, vi } from "vitest";
import { useToggleState } from "./use-toggle-state.js";

describe("useToggleState", () => {
  it("defaults to false when defaultIsSelected is not provided", () => {
    const state = useToggleState();
    expect(state.isSelected()).toBe(false);
  });

  it("can be default selected (uncontrolled)", () => {
    const state = useToggleState({ defaultIsSelected: true });
    expect(state.isSelected()).toBe(true);
  });

  it("can be controlled", () => {
    const onChange = vi.fn();
    const isSelected = createValue(true);
    const state = useToggleState({
      isSelected,
      onSelectedChange: onChange,
    });

    expect(state.isSelected()).toBe(true);
    state.toggle();
    expect(state.isSelected()).toBe(false);
    expect(isSelected()).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("updates selected state with setIsSelected", () => {
    const state = useToggleState({ defaultIsSelected: false });
    state.setIsSelected(true);
    expect(state.isSelected()).toBe(true);

    state.setIsSelected(false);
    expect(state.isSelected()).toBe(false);
  });

  it("does not update when isReadOnly is true", () => {
    const state = useToggleState({ defaultIsSelected: false, isReadOnly: true });
    state.setIsSelected(true);
    expect(state.isSelected()).toBe(false);

    state.toggle();
    expect(state.isSelected()).toBe(false);
  });

  it("does not update when isDisabled is true", () => {
    const state = useToggleState({ defaultIsSelected: false, isDisabled: true });
    state.setIsSelected(true);
    expect(state.isSelected()).toBe(false);

    state.toggle();
    expect(state.isSelected()).toBe(false);
  });

  it("toggles selected state", () => {
    const state = useToggleState({ defaultIsSelected: false });
    state.toggle();
    expect(state.isSelected()).toBe(true);

    state.toggle();
    expect(state.isSelected()).toBe(false);
  });
});
