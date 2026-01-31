import { beforeEach, describe, expect, it, vi } from "vitest";
import { Seidr } from "../seidr";
import { getCurrentPath } from "./get-current-path";
import { navigate } from "./navigate";

vi.mock("./get-current-path", () => ({
  getCurrentPath: vi.fn(),
}));

describe("navigate", () => {
  let pathSeidr: Seidr<string>;

  beforeEach(() => {
    pathSeidr = new Seidr("/");
    vi.mocked(getCurrentPath).mockReturnValue(pathSeidr);
    vi.stubGlobal("window", {
      history: {
        pushState: vi.fn(),
      },
    });
  });

  it("should update currentPath value", () => {
    navigate("/about");
    expect(pathSeidr.value).toBe("/about");
  });

  it("should strip query params and hashes", () => {
    navigate("/about?foo=bar#baz");
    expect(pathSeidr.value).toBe("/about");
  });

  it("should call window.history.pushState", () => {
    navigate("/contact");
    expect(window.history.pushState).toHaveBeenCalledWith({}, "", "/contact");
  });
});
