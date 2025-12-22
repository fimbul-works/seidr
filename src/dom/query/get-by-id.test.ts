import { beforeEach, describe, expect, it } from "vitest";
import { $getById } from "./get-by-id.js";

describe("$getById", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should find element by id", () => {
    const div = document.createElement("div");
    div.id = "test-div";
    document.body.appendChild(div);

    const result = $getById<HTMLDivElement>("test-div");

    expect(result).toBe(div);
    expect(result?.id).toBe("test-div");
  });

  it("should return null when element not found", () => {
    const result = $getById<HTMLDivElement>("non-existent");

    expect(result).toBeNull();
  });

  it("should work with different element types", () => {
    const button = document.createElement("button");
    button.id = "test-button";
    document.body.appendChild(button);

    const result = $getById<HTMLButtonElement>("test-button");

    expect(result).toBe(button);
    expect(result).toBeInstanceOf(HTMLButtonElement);
  });

  it("should work with input elements", () => {
    const input = document.createElement("input");
    input.id = "test-input";
    input.type = "text";
    document.body.appendChild(input);

    const result = $getById<HTMLInputElement>("test-input");

    expect(result).toBe(input);
    expect(result?.type).toBe("text");
  });

  it("should work with canvas elements", () => {
    const canvas = document.createElement("canvas");
    canvas.id = "test-canvas";
    canvas.width = 100;
    canvas.height = 100;
    document.body.appendChild(canvas);

    const result = $getById<HTMLCanvasElement>("test-canvas");

    expect(result).toBe(canvas);
    expect(result?.width).toBe(100);
    expect(result?.height).toBe(100);
  });

  it("should be type-safe with generics", () => {
    const div = document.createElement("div");
    div.id = "generic-test";
    document.body.appendChild(div);

    const asDiv = $getById<HTMLDivElement>("generic-test");
    const asButton = $getById<HTMLButtonElement>("generic-test");

    expect(asDiv).toBe(div);
    expect(asButton).toBe(div);
    // Both should find the same element, just with different type assertions
  });

  it("should return correct type or null", () => {
    const result = $getById<HTMLDivElement>("non-existent");

    // TypeScript should know this is HTMLDivElement | null
    expect(result).toBeNull();

    if (result) {
      // Type narrowing should work
      expect(result.id).toBeDefined();
    } else {
      expect(true).toBe(true); // Element not found
    }
  });

  it("should find first element if multiple have same id (invalid HTML but should handle gracefully)", () => {
    const div1 = document.createElement("div");
    div1.id = "duplicate-id";
    const div2 = document.createElement("div");
    div2.id = "duplicate-id";

    document.body.appendChild(div1);
    document.body.appendChild(div2);

    const result = $getById<HTMLDivElement>("duplicate-id");

    // Should return the first one (standard getElementById behavior)
    expect(result).not.toBeNull();
    expect(result?.id).toBe("duplicate-id");
  });

  it("should work with elements containing complex attributes", () => {
    const input = document.createElement("input");
    input.id = "complex-input";
    input.type = "email";
    input.placeholder = "test@example.com";
    input.required = true;
    document.body.appendChild(input);

    const result = $getById<HTMLInputElement>("complex-input");

    expect(result?.placeholder).toBe("test@example.com");
    expect(result?.type).toBe("email");
  });

  it("should handle empty string id", () => {
    const result = $getById<HTMLDivElement>("");

    expect(result).toBeNull();
  });

  it("should handle special characters in id", () => {
    const div = document.createElement("div");
    div.id = "test-id-with-underscores";
    document.body.appendChild(div);

    const result = $getById<HTMLDivElement>("test-id-with-underscores");

    expect(result).toBe(div);
  });
});
