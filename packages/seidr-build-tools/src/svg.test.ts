import { describe, expect, it } from "vitest";
import { compileSvgToSeidr, isSvgComponent } from "./svg.js";

describe("SVG Loader", () => {
  it("correctly identifies SVG component imports", () => {
    expect(isSvgComponent("src/icons/check.svg")).toBe(true);
    expect(isSvgComponent("src/icons/check.svg?component")).toBe(true);
    expect(isSvgComponent("/absolute/path/icon.svg")).toBe(true);
  });

  it("ignores ?url and ?raw query params", () => {
    expect(isSvgComponent("src/icons/check.svg?url")).toBe(false);
    expect(isSvgComponent("src/icons/check.svg?raw")).toBe(false);
  });

  it("ignores non-svg files", () => {
    expect(isSvgComponent("src/app.ts")).toBe(false);
    expect(isSvgComponent("src/logo.png")).toBe(false);
    expect(isSvgComponent("\0virtual:svg")).toBe(false);
  });

  it("compiles SVG markup into a Seidr createSvgIcon call", () => {
    const rawSvg = '<svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
    const code = compileSvgToSeidr(rawSvg);

    expect(code).toContain('import { createSvgIcon } from "@fimbul-works/seidr";');
    expect(code).toContain(`export default createSvgIcon(${JSON.stringify(rawSvg)});`);
  });
});

