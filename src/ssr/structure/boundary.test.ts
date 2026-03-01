import { describe, expect, it } from "vitest";
import { SSRDocument } from "../dom/ssr-document";
import { getComponentBoundaryId } from "./boundary";

describe("getComponentBoundaryId", () => {
  const document = new SSRDocument();

  it("returns null for elements without data-seidr-id", () => {
    const el = document.createElement("div");
    expect(getComponentBoundaryId(el, "Comp-1")).toBeNull();
  });

  it("returns null for elements belonging to the parent component", () => {
    const el = document.createElement("div");
    el.setAttribute("data-seidr-id", "1");
    expect(getComponentBoundaryId(el, "Comp-1")).toBeNull();
  });

  it("returns the ID for child components (element)", () => {
    const el = document.createElement("div");
    el.setAttribute("data-seidr-id", "2");
    expect(getComponentBoundaryId(el, "Comp-1")).toBe("2");
  });

  it("returns null for comments that are not component markers", () => {
    const comment = document.createComment("just a normal comment");
    expect(getComponentBoundaryId(comment, "Comp-1")).toBeNull();
  });

  it("returns null for component markers belonging to the parent", () => {
    const comment = document.createComment("Comp-1");
    expect(getComponentBoundaryId(comment, "Comp-1")).toBeNull();
  });

  it("returns the ID for child component markers (comment)", () => {
    const comment = document.createComment("Comp-2");
    expect(getComponentBoundaryId(comment, "Comp-1")).toBe("2");
  });

  it("returns the ID for child component fragment markers", () => {
    const comment = document.createComment("Comp-2.0");
    expect(getComponentBoundaryId(comment, "Comp-1")).toBe("2.0");
  });
});
