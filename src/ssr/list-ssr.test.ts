import { describe, expect, it } from "vitest";
import { List } from "../components/list.js";
import { SEIDR_COMPONENT_START_PREFIX } from "../constants.js";
import { $ } from "../element/index.js";
import { createValue, Value } from "../observable/value.js";
import { renderToString } from "./render-to-string.js";

describe("ssr limits", () => {
  it("should contain list comments", async () => {
    const { html } = await renderToString(() => {
      const items = createValue([1, 2, 3]);
      return $("div", null, [
        List(
          items,
          (item) => item,
          (item: Value<number>) => $("div", { textContent: `Item ${item()}` }),
        ),
      ]);
    });
    expect(html).toContain(`<!--${SEIDR_COMPONENT_START_PREFIX}List`);
  });
});
