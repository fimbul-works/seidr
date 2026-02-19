import { beforeEach, describe, expect, it } from "vitest";
import { getRenderContext } from "../render-context/render-context";
import { getMarkerComments } from "./get-marker-comments";
import { SEIDR_COMPONENT_END_PREFIX, SEIDR_COMPONENT_START_PREFIX } from "./marker-comment-prefix";

describe("getMarkerComments", () => {
  beforeEach(() => {
    getRenderContext().markers.clear();
  });

  it("should create new markers if not cached and not in DOM", () => {
    const id = "comp-1";
    const [start, end] = getMarkerComments(id);
    expect(start.nodeValue).toBe(SEIDR_COMPONENT_START_PREFIX + id);
    expect(end.nodeValue).toBe(SEIDR_COMPONENT_END_PREFIX + id);
  });

  it("should return cached markers", () => {
    const id = "comp-1";
    const [start1, end1] = getMarkerComments(id);
    const [start2, end2] = getMarkerComments(id);
    expect(start1).toBe(start2);
    expect(end1).toBe(end2);
  });
});
