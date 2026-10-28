import { expect, it } from "vitest";
import type { CSSProperties } from "../element/types.js";
import { $div } from "../elements/div.js";
import { createValue } from "../observable/index.js";
import { describeDualMode, itHasParity } from "../test-setup/dual-mode.js";
import { mergeStyleProps } from "./merge-style-props.js";

describeDualMode("mergeStyleProps", () => {
  itHasParity("merges static styles with override", () => {
    return $div({
      style: mergeStyleProps({ color: "red", fontSize: "14px" }, { color: "blue" }),
    });
  });

  itHasParity("erases styles with empty string", () => {
    return $div({
      style: mergeStyleProps({ color: "red", fontSize: "14px" }, { color: "" }),
    });
  });

  itHasParity("preserves numeric 0 without falling back", () => {
    return $div({
      style: mergeStyleProps({ opacity: "1", zIndex: 10 }, { opacity: 0, zIndex: 0 }),
    });
  });

  itHasParity("falls back to old style when new style property is null or undefined", () => {
    return $div({
      style: mergeStyleProps({ color: "red", fontSize: "14px" }, { color: undefined, fontSize: null as any }),
    });
  });

  itHasParity("handles missing or empty style declarations", () => {
    return $div({
      style: mergeStyleProps(undefined, { color: "green" }),
    });
  });

  it("should reactively update when Value observable changes", () => {
    const color = createValue<CSSProperties["color"]>("red", { id: "test-color" });
    const fontSize = createValue<CSSProperties["fontSize"]>("12px", { id: "test-font-size" });
    const merged = mergeStyleProps({ color, margin: "10px" }, { fontSize });
    const el = $div({ style: merged });

    expect(el.style.color).toBe("red");
    expect(el.style.fontSize).toBe("12px");
    expect(el.style.margin).toBe("10px");

    color("blue");
    expect(el.style.color).toBe("blue");

    fontSize("16px");
    expect(el.style.fontSize).toBe("16px");
  });

  it("should reactively unset a style when a Value changes to empty string", () => {
    const color = createValue<CSSProperties["color"]>("blue", { id: "test-color-unset" });
    const merged = mergeStyleProps({ color: "red", margin: "10px" }, { color });
    const el = $div({ style: merged });

    expect(el.style.color).toBe("blue");

    // Setting to empty string clears it
    color("");
    expect(el.style.color).toBe("");

    // Setting to undefined falls back to old style
    color(undefined);
    expect(el.style.color).toBe("red");
  });
});
