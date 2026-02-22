import { afterEach } from "vitest";
import { setInternalGetDocument } from "../dom/get-document";
import { getDocument as getBrowserDocument } from "../dom/get-document.browser";
import { getDocument as getSSRDocument } from "../dom/get-document.node";
import { setInternalRenderContext } from "../render-context/render-context";
import { isServer } from "../util/environment/server";
import { getRenderContext, testRenderContext } from "./render-context";

export { enableClientMode } from "./client-mode";
export { describeDualMode, mockUseScope } from "./dual-mode";
export { getRenderContext, setRenderContextID, testRenderContext } from "./render-context";
export { enableSSRMode } from "./ssr-mode";

setInternalRenderContext(getRenderContext);
setInternalGetDocument(isServer() ? getSSRDocument : getBrowserDocument);

afterEach(() => {
  // Reset browser context counters for next test
  testRenderContext.markers.clear();
  if (testRenderContext.featureData) {
    testRenderContext.featureData.clear();
  }

  // Clean up DOM after each test
  document.body.innerHTML = "";
  document.head.innerHTML = "";
});

// Mock DOM environment for testing
Object.defineProperty(window, "navigator", {
  value: {
    userAgent: "test",
  },
  writable: true,
});
