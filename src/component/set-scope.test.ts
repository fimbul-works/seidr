import { expect, it } from "vitest";
import { getAppState } from "../app-state/app-state";
import { DATA_KEY_COMPONENT_SCOPE } from "../constants";
import { describeDualMode } from "../test-setup/dual-mode";
import { component } from "./component";
import { setScope } from "./set-scope";

describeDualMode("setScope", () => {
  it("should set the active component scope in AppState", () => {
    const Comp = component(() => null);
    const instance = Comp();

    setScope(instance);

    expect(getAppState().getData(DATA_KEY_COMPONENT_SCOPE)).toBe(instance);
  });

  it("should clear the active component scope in AppState when null is passed", () => {
    const Comp = component(() => null);
    const instance = Comp();

    setScope(instance);
    expect(getAppState().getData(DATA_KEY_COMPONENT_SCOPE)).toBe(instance);

    setScope(null);
    expect(getAppState().getData(DATA_KEY_COMPONENT_SCOPE)).toBeNull();
  });
});
