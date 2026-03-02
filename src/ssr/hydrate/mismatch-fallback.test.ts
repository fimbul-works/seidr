import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { $ } from "../../element";
import { useState } from "../../state/use-state";
import { enableClientMode } from "../../test-setup";
import type { CleanupFunction } from "../../types";
import { renderToString } from "../render-to-string";
import { clearHydrationData, hydrate } from "./index";
import { applyTreeState, captureTreeState } from "./mismatch-fallback";

describe("State Transfer Utilities", () => {
  it("should capture and apply state to a single element", () => {
    const input = document.createElement("input");
    input.value = "test-value";

    const states = captureTreeState(input);
    expect(states["root"]).toBeDefined();
    expect(states["root"].value).toBe("test-value");

    const newInput = document.createElement("input");
    applyTreeState(newInput, states);
    expect(newInput.value).toBe("test-value");
  });

  it("should capture and apply state to nested elements", () => {
    const container = document.createElement("div");
    const div = document.createElement("div");
    const input1 = document.createElement("input");
    input1.value = "v1";
    div.appendChild(input1);
    container.appendChild(div);

    const span = document.createElement("span");
    const input2 = document.createElement("input");
    input2.value = "v2";
    span.appendChild(input2);
    container.appendChild(span);

    const states = captureTreeState(container);
    expect(states["root:0.0"].value).toBe("v1");
    expect(states["root:1.0"].value).toBe("v2");

    const newContainer = document.createElement("div");
    const newDiv = document.createElement("div");
    const newInput1 = document.createElement("input");
    newDiv.appendChild(newInput1);
    newContainer.appendChild(newDiv);

    const newSpan = document.createElement("span");
    const newInput2 = document.createElement("input");
    newSpan.appendChild(newInput2);
    newContainer.appendChild(newSpan);

    applyTreeState(newContainer, states);
    expect(newInput1.value).toBe("v1");
    expect(newInput2.value).toBe("v2");
  });
});

describe("Hydration Mismatch Fallback", () => {
  let container: HTMLElement;
  let cleanupClientMode: CleanupFunction;
  let unmount: CleanupFunction | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    (globalThis as any).__TEST_STATES__ = undefined;
    (globalThis as any).__TEST_STATES_ENABLED__ = true;
  });

  afterEach(() => {
    unmount?.();
    clearHydrationData();
    if (cleanupClientMode) cleanupClientMode();
    document.body.removeChild(container);
  });

  const InputApp = () => {
    const [val, setVal] = useState("input-val", "initial");
    return $("div", { id: "app" }, [
      $("input", {
        id: "my-input",
        value: val,
        oninput: (e: any) => setVal(e.target.value),
      }),
      $("p", { textContent: val }),
    ]);
  };

  it("should preserve input value and focus during mismatch fallback", async () => {
    const { html, hydrationData } = await renderToString(InputApp);

    // Switch to client context AFTER SSR
    cleanupClientMode = enableClientMode();

    // Mangle the HTML to force a tag mismatch during hydration
    // We change the <p> tag to a <span> tag, but keep the data-seidr-id intact
    container.innerHTML = html.replace("<p>", "<span>").replace("</p>", "</span>");

    const inputAfterMangle = container.querySelector("input") as HTMLInputElement;
    inputAfterMangle.focus();
    inputAfterMangle.value = "user-typed";

    console.warn("--- BEFORE HYDRATE ---");
    unmount = hydrate(InputApp, container, hydrationData);
    console.warn("--- AFTER HYDRATE ---");

    // Diagnostics
    const capturedStates = (globalThis as any).__TEST_STATES__;
    if (!capturedStates) {
      throw new Error("No states were captured! verify replaceWithStateTransfer was called.");
    }

    // Since we removed comment markers, the path to the input is [0, 0] inside the root component
    // The component wrapper DIV is "root:0".
    // The input is "root:0.0".
    // The p/span is "root:0.1".
    if (!capturedStates["root:0.0"]) {
      throw new Error("Target input path root:0.0 not found in captured states!");
    }

    const finalInput = container.querySelector("input") as HTMLInputElement;
    expect(finalInput.value).toBe("user-typed");
    expect(document.activeElement).toBe(finalInput);
  });
});
