import { beforeEach, describe, expect, it } from "vitest";
import { $query } from "./query";

describe("$query (query selector)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should find element by query", () => {
    const testDiv = document.createElement("div");
    testDiv.id = "test-element";
    document.body.appendChild(testDiv);

    const found = $query("div#test-element");

    expect(found).toBe(testDiv);
    expect(found?.id).toBe("test-element");
  });

  it("should return null when element not found", () => {
    const found = $query(".non-existent");

    expect(found).toBeNull();
  });

  it("should search within specified element", () => {
    const container = document.createElement("div");
    const inner = document.createElement("span");
    inner.className = "inner";

    container.appendChild(inner);
    document.body.appendChild(container);

    const found = $query(".inner", container);

    expect(found).toBe(inner);
  });

  it("should use document.body as default search scope", () => {
    const testDiv = document.createElement("div");
    testDiv.className = "body-element";
    document.body.appendChild(testDiv);

    const found = $query(".body-element");

    expect(found).toBe(testDiv);
  });
});
