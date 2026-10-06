import SuperJSON from "superjson";
import { afterEach, describe, expect, it } from "vitest";
import { createComponent } from "../component/create-component.js";
import { $div } from "../elements/div.js";
import { $p } from "../elements/p.js";
import { $span } from "../elements/span.js";
import { createValue, type Value } from "../observable/value.js";
import { enableClientMode, enableSSRMode } from "../test-setup/index.js";
import { hydrate } from "./hydrate/hydrate.js";
import { defaultHydrationSerializer, getHydrationSerializer, setHydrationSerializer } from "./hydration-serializer.js";
import { renderToString } from "./render-to-string.js";
import type { HydrationData } from "./types.js";

describe("HydrationSerializer", () => {
  afterEach(() => {
    // Reset to default serializer after each test
    setHydrationSerializer(defaultHydrationSerializer);
  });

  describe("Defaults and registration", () => {
    it("should default to JSON serializer", () => {
      const serializer = getHydrationSerializer();
      expect(serializer).toBe(defaultHydrationSerializer);
      expect(serializer).toBe(JSON);

      const sample = { a: 1, b: "test" };
      expect(serializer.stringify(sample)).toBe(JSON.stringify(sample));
      expect(serializer.parse(JSON.stringify(sample))).toEqual(sample);
    });

    it("should allow registering a custom serializer", () => {
      setHydrationSerializer(SuperJSON);
      expect(getHydrationSerializer()).toBe(SuperJSON);

      const date = new Date("2026-09-26T12:00:00.000Z");
      const sample = { timestamp: date };

      const serialized = getHydrationSerializer().stringify(sample);
      const parsed = getHydrationSerializer().parse(serialized) as { timestamp: Date };

      expect(parsed.timestamp).toBeInstanceOf(Date);
      expect(parsed.timestamp.toISOString()).toBe("2026-09-26T12:00:00.000Z");
    });
  });

  describe("SSR and Hydration with SuperJSON", () => {
    let capturedDateValue: Value<Date> | undefined;
    let capturedSetValue: Value<Set<string>> | undefined;
    let capturedMapValue: Value<Map<string, string>> | undefined;

    const ComplexComponent = createComponent(() => {
      const dateVal = createValue(new Date("2026-09-26T12:00:00.000Z"), { id: "test-date" });
      const setVal = createValue(new Set(["seidr", "superjson"]), { id: "test-set" });
      const mapVal = createValue(
        new Map([
          ["framework", "seidr"],
          ["version", "1.0"],
        ]),
        { id: "test-map" },
      );

      capturedDateValue = dateVal;
      capturedSetValue = setVal;
      capturedMapValue = mapVal;

      return $div({ id: "complex-root" }, [
        $p(
          { id: "date-display" },
          dateVal.as((d) => d.toISOString()),
        ),
        $span(
          { id: "set-count" },
          setVal.as((s) => `Count: ${s.size}`),
        ),
        $span(
          { id: "map-entry" },
          mapVal.as((m) => `Framework: ${m.get("framework")}`),
        ),
      ]);
    }, "ComplexComponent");

    it("should preserve Date, Set, and Map across SSR and client hydration when using SuperJSON", async () => {
      // 1. Enable SuperJSON serializer
      setHydrationSerializer(SuperJSON);

      // 2. SSR Render
      const cleanupSSR = enableSSRMode();
      const { html, hydrationData } = await renderToString(() => ComplexComponent());
      cleanupSSR();

      expect(html).toContain("2026-09-26T12:00:00.000Z");
      expect(html).toContain("Count: 2");
      expect(html).toContain("Framework: seidr");

      // 3. Serialize payload with SuperJSON
      const payloadString = getHydrationSerializer().stringify(hydrationData);
      expect(typeof payloadString).toBe("string");

      // 4. Client Hydration using the serialized string
      const cleanupClient = enableClientMode();
      const container = document.body;
      container.innerHTML = html;

      capturedDateValue = undefined;
      capturedSetValue = undefined;
      capturedMapValue = undefined;

      const unmount = hydrate(() => ComplexComponent(), container, payloadString);

      // 5. Verify restored types
      expect(capturedDateValue).toBeDefined();
      expect(capturedDateValue!()).toBeInstanceOf(Date);
      expect(capturedDateValue!().toISOString()).toBe("2026-09-26T12:00:00.000Z");

      expect(capturedSetValue).toBeDefined();
      expect(capturedSetValue!()).toBeInstanceOf(Set);
      expect(capturedSetValue!().has("superjson")).toBe(true);
      expect(capturedSetValue!().size).toBe(2);

      expect(capturedMapValue).toBeDefined();
      expect(capturedMapValue!()).toBeInstanceOf(Map);
      expect(capturedMapValue!().get("framework")).toBe("seidr");
      expect(capturedMapValue!().get("version")).toBe("1.0");

      // 6. Verify client reactivity after hydration
      capturedDateValue!(new Date("2026-10-01T00:00:00.000Z"));
      expect(container.querySelector("#date-display")?.textContent).toBe("2026-10-01T00:00:00.000Z");

      unmount();
      container.innerHTML = "";
      cleanupClient();
    });

    it("should also support pre-parsed HydrationData with SuperJSON", async () => {
      setHydrationSerializer(SuperJSON);

      // 1. SSR Render
      const cleanupSSR = enableSSRMode();
      const { html, hydrationData } = await renderToString(() => ComplexComponent());
      cleanupSSR();

      // 2. Serialize and then parse manually
      const serialized = getHydrationSerializer().stringify(hydrationData);
      const parsedData = getHydrationSerializer().parse(serialized) as HydrationData;

      // 3. Client Hydrate with parsed data object
      const cleanupClient = enableClientMode();
      const container = document.body;
      container.innerHTML = html;

      capturedDateValue = undefined;
      const unmount = hydrate(() => ComplexComponent(), container, parsedData);

      expect(capturedDateValue!()).toBeInstanceOf(Date);
      expect(capturedDateValue!().getFullYear()).toBe(2026);

      unmount();
      container.innerHTML = "";
      cleanupClient();
    });
  });
});
