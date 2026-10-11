import { describe, expect, it } from "vitest";
import { isRef } from "../observable/type-guards.js";
import { composeRefs } from "./compose-refs.js";
import { useRef } from "./use-ref.js";

describe("composeRefs", () => {
  it("returns a valid Ref object", () => {
    const composite = composeRefs();
    expect(isRef(composite)).toBe(true);
    expect(composite()).toBeNull();
  });

  it("safely handles undefined and null refs", () => {
    const refA = useRef<HTMLDivElement>();
    const composite = composeRefs(refA, null, undefined);

    expect(isRef(composite)).toBe(true);

    const div = document.createElement("div");
    composite(div);

    expect(composite()).toBe(div);
    expect(refA()).toBe(div);
  });

  it("updates all constituent refs when composite ref is updated", () => {
    const refA = useRef<HTMLButtonElement>();
    const refB = useRef<HTMLButtonElement>();
    const refC = useRef<HTMLButtonElement>();

    const composite = composeRefs(refA, refB, refC);

    const btn = document.createElement("button");
    composite(btn);

    expect(composite()).toBe(btn);
    expect(refA()).toBe(btn);
    expect(refB()).toBe(btn);
    expect(refC()).toBe(btn);

    // Setting to null updates all constituent refs
    composite(null);
    expect(composite()).toBeNull();
    expect(refA()).toBeNull();
    expect(refB()).toBeNull();
    expect(refC()).toBeNull();
  });

  it("inherits initial value if one of the refs already has a value", () => {
    const element = document.createElement("span");
    const refA = useRef<HTMLSpanElement>(element);
    const refB = useRef<HTMLSpanElement>();

    const composite = composeRefs(refA, refB);

    expect(composite()).toBe(element);
  });

  it("supports watchers on the composite ref", () => {
    const refA = useRef<HTMLDivElement>();
    const composite = composeRefs(refA);

    let watchedValue: HTMLDivElement | null = null;
    composite.watch((val) => {
      watchedValue = val;
    });

    const div = document.createElement("div");
    composite(div);

    expect(watchedValue).toBe(div);
    expect(refA()).toBe(div);
  });
});
