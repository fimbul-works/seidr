import { beforeEach, describe, expect, it } from "vitest";
import { $queryAll } from "./query-all.js";

describe("$queryAll (query selector all)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should find all matching elements", () => {
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    const span = document.createElement("span");

    div1.className = "item";
    div2.className = "item";
    span.className = "item";

    document.body.appendChild(div1);
    document.body.appendChild(div2);
    document.body.appendChild(span);

    const found = $queryAll(".item");

    expect(found.length).toBe(3);
    expect(found).toContain(div1);
    expect(found).toContain(div2);
    expect(found).toContain(span);
  });

  it("should return empty array when no elements found", () => {
    const found = $queryAll(".non-existent");

    expect(found).toEqual([]);
  });

  it("should search within specified element", () => {
    const container = document.createElement("div");
    const inner1 = document.createElement("span");
    const inner2 = document.createElement("span");
    const outer = document.createElement("span");

    inner1.className = "inner-item";
    inner2.className = "inner-item";
    outer.className = "inner-item";

    container.appendChild(inner1);
    container.appendChild(inner2);
    document.body.appendChild(container);
    document.body.appendChild(outer);

    const found = $queryAll(".inner-item", container);

    expect(found.length).toBe(2);
    expect(found).toContain(inner1);
    expect(found).toContain(inner2);
    expect(found).not.toContain(outer);
  });
});
