import { expect, it } from "vitest";
import { describeDualMode } from "../test-setup/dual-mode";
import { getAppState } from "../app-state/app-state";
import { DATA_KEY_ACTIVE_SCOPE } from "../constants";
import { setScope } from "./set-scope";
import { component } from "./component";

describeDualMode("setScope", () => {
  it("should set the active component scope in AppState", () => {
    const Comp = component(() => null);
    const instance = Comp();
    
    setScope(instance);
    
    expect(getAppState().getData(DATA_KEY_ACTIVE_SCOPE)).toBe(instance);
  });

  it("should clear the active component scope in AppState when null is passed", () => {
    const Comp = component(() => null);
    const instance = Comp();
    
    setScope(instance);
    expect(getAppState().getData(DATA_KEY_ACTIVE_SCOPE)).toBe(instance);
    
    setScope(null);
    expect(getAppState().getData(DATA_KEY_ACTIVE_SCOPE)).toBeNull();
  });
});
