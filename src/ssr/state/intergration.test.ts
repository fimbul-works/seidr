import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getRenderContext } from "../../render-context";
import { runWithRenderContext } from "../../render-context/render-context.node";
import { Seidr } from "../../seidr";
import { globalStates, symbolNames } from "../../state/storage";
import { useState } from "../../state/use-state";
import { captureGlobalState } from "./capture-global-state";
import { restoreGlobalState } from "./restore-global-state";

describe("SSR State integration tests", () => {
  beforeEach(() => {
    globalStates.clear();
    symbolNames.clear();
  });

  afterEach(() => {
    globalStates.clear();
    symbolNames.clear();
  });

  const captureState = () => {
    const ctx = getRenderContext();
    return captureGlobalState(ctx.ctxID);
  };

  it("should preserve data through serialize -> deserialize cycle", () => {
    runWithRenderContext(async () => {
      const [user, setUser] = useState<Seidr<string>>("user");
      const [settings, setSettings] = useState<{ theme: string }>("settings");
      const [count, setCount] = useState<Seidr<number>>("count");

      setUser(new Seidr("Alice"));
      setSettings({ theme: "dark" });
      setCount(new Seidr(42));

      const serialized = captureState();

      restoreGlobalState(serialized);

      expect(user.value).toBe("Alice");
      expect(settings.value).toEqual({ theme: "dark" });
      expect(count.value).toBe(42);
    });
  });

  it("should handle complex nested objects", () => {
    runWithRenderContext(async () => {
      const [config, setConfig] = useState<{
        database: { host: string; port: number };
        features: string[];
      }>("config");

      const complexConfig = {
        database: { host: "localhost", port: 5432 },
        features: ["auth", "logging", "caching"],
      };

      setConfig(complexConfig);

      const serialized = captureState();

      restoreGlobalState(serialized);

      expect(config.value).toEqual(complexConfig);
    });
  });
});
