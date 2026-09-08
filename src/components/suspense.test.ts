import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mount } from "../dom/mount";
import { $ } from "../element";
import { createValue } from "../observable";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { Suspense, type SuspenseState } from "./suspense";
import { Switch } from "./switch";

describeDualMode("Suspense", ({ getDocument }) => {
  let container: HTMLElement;
  let unmount: CleanupFunction;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
  });

  afterEach(() => {
    unmount?.();
    container?.remove();
  });

  it("should show loading state initially", async () => {
    const promise = new Promise<string>(() => {});
    const factory = ({ state, value, error }: SuspenseState<string>) =>
      Switch(state, {
        pending: () => $("div", { textContent: "Loading..." }),
        resolved: () => $("div", { textContent: value() || "" }),
        error: () => $("div", { textContent: error()?.message || "" }),
      });

    unmount = mount(() => Suspense(promise, factory), container);

    expect(container.textContent).toBe("Loading...");
  });

  it("should show resolved content when promise resolves", async () => {
    let resolvePromise!: (val: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });

    const factory = ({ state, value, error }: SuspenseState<string>) =>
      Switch(state, {
        pending: () => $("div", { textContent: "Loading..." }),
        resolved: () => $("div", { textContent: value() || "" }),
        error: () => $("div", { textContent: `Error: ${error()?.message}` }),
      });

    unmount = mount(() => Suspense(promise, factory), container);

    resolvePromise("Resolved Content");
    await new Promise((r) => setTimeout(r, 10));

    expect(container.textContent).toBe("Resolved Content");
  });

  it("should show error content when promise rejects", async () => {
    let rejectPromise!: (err: Error) => void;
    const promise = new Promise<string>((_, reject) => {
      rejectPromise = reject;
    });

    const factory = ({ state, error }: SuspenseState<string>) =>
      Switch(state, {
        pending: () => $("div", { textContent: "Loading..." }),
        resolved: () => $("div", { textContent: "Resolved Content" }),
        error: () => $("div", { textContent: `Error: ${error()?.message}` }),
      });

    unmount = mount(() => Suspense(promise, factory), container);

    rejectPromise(new Error("Failed"));
    await new Promise((r) => setTimeout(r, 10));

    expect(container.textContent).toBe("Error: Failed");
  });

  it("should react to changing promises via Value", async () => {
    let resolve1!: (v: string) => void;
    let resolve2!: (v: string) => void;
    const p1 = new Promise<string>((r) => {
      resolve1 = r;
    });
    const p2 = new Promise<string>((r) => {
      resolve2 = r;
    });

    const promiseValue = createValue<Promise<string>>(p1);
    const factory = ({ state, value, error }: SuspenseState<string>) =>
      Switch(state, {
        pending: () => $("div", { textContent: "Loading..." }),
        resolved: () => $("div", { textContent: value() || "" }),
        error: () => $("div", { textContent: error()?.message || "" }),
      });

    unmount = mount(() => Suspense(promiseValue, factory), container);

    // Initial state (p1 pending)
    expect(container.textContent).toBe("Loading...");

    // Resolve p1
    resolve1("First");
    await new Promise((r) => setTimeout(r, 10));
    expect(container.textContent).toBe("First");

    // Switch to p2 (pending)
    promiseValue(p2);
    expect(container.textContent).toBe("Loading...");

    // Resolve p2
    resolve2("Second");
    await new Promise((r) => setTimeout(r, 10));
    expect(container.textContent).toBe("Second");
  });
});
