import { expect, it } from "vitest";
import { describeDualMode } from "../test-setup";
import { appendChild } from "./append-child";

describeDualMode("appendChild", ({ getDocument }) => {
  it("should append a simple element", () => {
    const factory = getDocument();
    const parent = factory.createElement("div");
    const child = factory.createElement("span");
    appendChild(parent, child);
    expect(parent.childNodes.length).toBe(1);
    expect(parent.firstChild).toBe(child);
  });

  it("should append text as string", () => {
    const factory = getDocument();
    const parent = factory.createElement("div");
    appendChild(parent, "hello");
    expect(parent.textContent).toBe("hello");
  });

  it("should append array of nodes", () => {
    const factory = getDocument();
    const parent = factory.createElement("div");
    const child1 = factory.createElement("span");
    const child2 = factory.createElement("b");
    appendChild(parent, [child1, child2]);
    expect(parent.childNodes.length).toBe(2);
    expect(parent.childNodes[0]).toBe(child1);
    expect(parent.childNodes[1]).toBe(child2);
  });
});
