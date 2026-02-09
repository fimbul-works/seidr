import { afterEach } from "vitest";
import { setInternalDOMFactory } from "../dom";
import { getBrowserDOMFactory } from "../dom/dom-factory.browser";
import { getSSRDOMFactory } from "../dom/dom-factory.node";
import { setInternalRenderContext } from "../render-context/render-context";
import { isServer } from "../util/environment/server";
import { getRenderContext, testRenderContext } from "./render-context";

export { enableClientMode } from "./client-mode";
export { describeDualMode } from "./dual-mode";
export { getRenderContext, setRenderContextID, testRenderContext } from "./render-context";
export { enableSSRMode } from "./ssr-mode";

setInternalRenderContext(getRenderContext);
setInternalDOMFactory(isServer() ? getSSRDOMFactory : getBrowserDOMFactory);

afterEach(() => {
  // Reset browser context counters for next test
  testRenderContext.rngState = undefined;
  testRenderContext.currentPath = "/";
  testRenderContext.document = undefined;
  testRenderContext.markers = new Map();

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
