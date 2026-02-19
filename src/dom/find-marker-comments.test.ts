import { describe, expect, it } from "vitest";
import { findMarkerComments } from "./find-marker-comments";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "./marker-comment-prefix";

describe("findMarkerComments", () => {
  it("should find markers in the DOM", () => {
    const id = "test-comp";
    const start = document.createComment(SEIDR_COMPONENT_START_PREFIX + id);
    const end = document.createComment(SEIDR_COMPONENT_END_PREFIX + id);

    const container = document.createElement("div");
    container.appendChild(start);
    container.appendChild(document.createElement("p"));
    container.appendChild(end);
    document.body.appendChild(container);

    const [foundStart, foundEnd] = findMarkerComments(id);
    expect(foundStart).toBe(start);
    expect(foundEnd).toBe(end);

    document.body.removeChild(container);
  });

  it("should return [null, null] if markers not found", () => {
    const [foundStart, foundEnd] = findMarkerComments("non-existent");
    expect(foundStart).toBeNull();
    expect(foundEnd).toBeNull();
  });
});
