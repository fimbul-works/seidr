import { afterEach, beforeEach, expect, it } from "vitest";
import { mount } from "../dom/mount";
import { Seidr } from "../seidr";
import { describeDualMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { Suspense } from "./suspense";

describeDualMode("Suspense", ({ getDocument }) => {
  let container: HTMLElement;
  let document: Document;
  let unmount: CleanupFunction;

  beforeEach(() => {
    document = getDocument();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmount?.();
    document.body.removeChild(container);
  });

  it("should show loading state initially", async () => {
    const promise = new Promise<string>(() => {});
    const factory = (val: string) => val;
    const loading = () => "Loading...";

    unmount = mount(
      Suspense(promise, factory, loading, (err) => err.message),
      container,
    );

    expect(container.textContent).toBe("Loading...");
  });

  it("should show resolved content when promise resolves", async () => {
    let resolvePromise: (val: string) => void;
    const promise = new Promise<string>((resolve) => (resolvePromise = resolve));
    const factory = (val: string) => val;
    const loading = () => "Loading...";

    unmount = mount(
      Suspense(promise, factory, loading, (err) => err.message),
      container,
    );

    resolvePromise!("Resolved Content");
    await new Promise((r) => setTimeout(r, 10));

    expect(container.textContent).toBe("Resolved Content");
  });

  it("should show error content when promise rejects", async () => {
    let rejectPromise: (err: Error) => void;
    const promise = new Promise<string>((_, reject) => (rejectPromise = reject));
    const factory = (val: string) => document.createTextNode(val);
    const loading = () => document.createTextNode("Loading...");
    const error = (err: Error) => document.createTextNode(`Error: ${err.message}`);

    unmount = mount(Suspense(promise, factory, loading, error), container);
    rejectPromise!(new Error("Failed"));
    await new Promise((r) => setTimeout(r, 0));
    expect(container.textContent).toBe("Error: Failed");
  });

  // New test for reactive promise
  it("should react to changing promises via Seidr", async () => {
    let resolve1: (v: string) => void;
    let resolve2: (v: string) => void;
    const p1 = new Promise<string>((r) => (resolve1 = r));
    const p2 = new Promise<string>((r) => (resolve2 = r));

    const promiseSeidr = new Seidr<Promise<string>>(p1);
    const factory = (val: string) => document.createTextNode(val);
    const loading = () => document.createTextNode("Loading...");

    unmount = mount(
      Suspense(promiseSeidr, factory, loading, (err) => document.createTextNode(err.message)),
      container,
    );

    // Initial state (p1 pending)
    expect(container.textContent).toBe("Loading...");

    // Resolve p1
    resolve1!("First");
    await new Promise((r) => setTimeout(r, 0));
    expect(container.textContent).toBe("First");

    // Switch to p2 (pending)
    promiseSeidr.value = p2;
    // Should immediately switch to loading
    await new Promise((r) => setTimeout(r, 0)); // wait for observer
    expect(container.textContent).toBe("Loading...");

    // Resolve p2
    resolve2!("Second");
    await new Promise((r) => setTimeout(r, 0));
    expect(container.textContent).toBe("Second");
  });
});
