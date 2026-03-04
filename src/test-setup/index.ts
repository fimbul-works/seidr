import { afterEach } from "vitest";
import { setInternalGetDocument } from "../dom/get-document";
import { getDocument as getBrowserDocument } from "../dom/get-document.browser";
import { getDocument as getSSRDocument } from "../dom/get-document.node";
import { setInternalAppState } from "../render-context/render-context";
import { Seidr } from "../seidr";
import { registerSeidrForSSR } from "../ssr/register-seidr";
import { isServer } from "../util/environment/server";
import { getAppState, testAppState } from "./render-context";

Seidr.register = registerSeidrForSSR;

export { enableClientMode } from "./client-mode";
export { describeDualMode, mockUseScope } from "./dual-mode";
export { getAppState, setAppStateID, testAppState } from "./render-context";
export { enableSSRMode } from "./ssr-mode";

setInternalAppState(getAppState);
setInternalGetDocument(isServer() ? getSSRDocument : getBrowserDocument);

afterEach(() => {
  // Reset browser context counters for next test
  testAppState.markers.clear();
  testAppState.data.clear();

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
