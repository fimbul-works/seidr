import { afterEach } from "vitest";
import { setInternalAppState } from "../app-state/app-state";
import { setInternalGetDocument } from "../dom/get-document";
import { getDocument as getBrowserDocument } from "../dom/get-document.browser";
import { getDocument as getSSRDocument } from "../dom/get-document.node";
import { Seidr } from "../seidr";
import { registerSeidrForSSR } from "../ssr/register-seidr";
import { isServer } from "../util/environment/is-server";
import { getAppState, testAppState } from "./app-state";

Seidr.register = registerSeidrForSSR;

export { getAppState, setAppStateID, testAppState } from "./app-state";
export { enableClientMode } from "./client-mode";
export { describeDualMode, mockUseScope } from "./dual-mode";
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
