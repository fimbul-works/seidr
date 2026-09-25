import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Suspense, type SuspenseState } from "../../components/suspense.js";
import { $ } from "../../element/index.js";
import { DATA_KEY_STATE } from "../../observable/constants.js";
import { createValue, type Value } from "../../observable/value.js";
import { enableClientMode, enableSSRMode } from "../../test-setup/index.js";
import type { CleanupFunction } from "../../types.js";
import { renderToString } from "../render-to-string.js";
import { hydrate } from "./hydrate.js";

describe("Hydration Tuple Encoding & Deduplication", () => {
  let container: HTMLElement;
  let cleanupMode: CleanupFunction;
  let unmount: CleanupFunction | undefined;

  beforeEach(() => {
    cleanupMode = enableSSRMode();
    container = document.createElement("div");
  });

  afterEach(() => {
    unmount?.();
    cleanupMode?.();
  });

  it("should deduplicate shared arrays between multiple Values and preserve reference equality", async () => {
    const sharedData = [
      { id: 1, title: "Item 1" },
      { id: 2, title: "Item 2" },
    ];

    let clientVal1: Value<any> | undefined;
    let clientVal2: Value<any> | undefined;

    function App() {
      const val1 = createValue(sharedData, { id: "store-items" });
      const val2 = createValue(sharedData, { id: "view-items" });
      clientVal1 = val1;
      clientVal2 = val2;

      return $("div", { id: "app" }, [
        $("span", { id: "s1", textContent: String(val1().length) }),
        $("span", { id: "s2", textContent: String(val2().length) }),
      ]);
    }

    // 1. SSR Pass
    const { html, hydrationData } = await renderToString(App);

    // 2. Verify tuple payload structure
    const statePayload = hydrationData.data[DATA_KEY_STATE];
    expect(Array.isArray(statePayload)).toBe(true);

    // Find the tuple representing the shared array
    const sharedTuple = statePayload.find(
      (tuple: any[]) => tuple.includes("store-items") && tuple.includes("view-items"),
    );
    expect(sharedTuple).toBeDefined();
    // Both Value IDs are stored in the SAME tuple
    expect(sharedTuple).toContain("store-items");
    expect(sharedTuple).toContain("view-items");

    // 3. Client Hydration
    cleanupMode();
    cleanupMode = enableClientMode();
    container.innerHTML = html;

    unmount = hydrate(App, container, hydrationData);

    expect(container.querySelector("#s1")?.textContent).toBe("2");
    expect(container.querySelector("#s2")?.textContent).toBe("2");

    // 4. Verify in-memory reference equality
    expect(clientVal1!()).toBe(clientVal2!());
    expect(clientVal1!()).toEqual(sharedData);
  });

  it("should hydrate Suspense resolved promise without duplicating payload data", async () => {
    const posts = [
      { slug: "post-a", title: "Post A" },
      { slug: "post-b", title: "Post B" },
    ];

    let resolvedValue: any;

    function BlogApp() {
      const postsPromise = Promise.resolve(posts);

      return Suspense(postsPromise, ({ state, value }: SuspenseState<typeof posts>) => {
        resolvedValue = value;
        return $("div", { id: "blog" }, [
          $("span", { id: "status", textContent: state }),
          $("ul", { id: "list" }, [
            $("li", { id: "first", textContent: value.as((v) => (v ? v[0].title : "none")) }),
          ]),
        ]);
      });
    }

    // 1. SSR Pass
    const { html, hydrationData } = await renderToString(BlogApp);

    expect(html).toContain("Post A");

    // 2. Client Hydration
    cleanupMode();
    cleanupMode = enableClientMode();
    container.innerHTML = html;

    unmount = hydrate(BlogApp, container, hydrationData);

    expect(container.querySelector("#first")?.textContent).toBe("Post A");
    expect(resolvedValue()).toEqual(posts);
  });

  it("should share identical in-memory array reference between user Value and Suspense after hydration", async () => {
    const rawPosts = [
      { slug: "post-1", title: "First Post" },
      { slug: "post-2", title: "Second Post" },
    ];

    let userPostsValue: Value<any> | undefined;
    let suspenseValue: Value<any> | undefined;

    function BlogAppWithStore() {
      const posts = createValue<typeof rawPosts>([], { id: "posts" });
      userPostsValue = posts;

      const promise = Promise.resolve(rawPosts).then((data) => {
        posts(data);
        return data;
      });

      return Suspense(promise, ({ state, value }: SuspenseState<typeof rawPosts>) => {
        suspenseValue = value;
        return $("div", { id: "app" }, [
          $("span", { id: "status", textContent: state }),
          $("span", { id: "count", textContent: value.as((v) => String(v?.length ?? 0)) }),
        ]);
      });
    }

    // 1. SSR Pass
    const { html, hydrationData } = await renderToString(BlogAppWithStore);

    // 2. Verify payload: both "posts" and the internal Suspense value ID share ONE tuple
    const statePayload = hydrationData.data[DATA_KEY_STATE];
    const sharedTuple = statePayload.find(
      (tuple: any[]) => tuple.includes("posts") && tuple.length >= 3,
    );
    expect(sharedTuple).toBeDefined();
    // The tuple has the posts array and at least two Value IDs ("posts" and the Suspense value ID)
    expect(sharedTuple).toContain("posts");

    // 3. Client Hydration
    cleanupMode();
    cleanupMode = enableClientMode();
    container.innerHTML = html;

    unmount = hydrate(BlogAppWithStore, container, hydrationData);

    expect(container.querySelector("#status")?.textContent).toBe("resolved");
    expect(container.querySelector("#count")?.textContent).toBe("2");

    // 4. Verify referential equality on client
    expect(userPostsValue).toBeDefined();
    expect(suspenseValue).toBeDefined();
    expect(userPostsValue!()).toEqual(rawPosts);
    expect(suspenseValue!()).toEqual(rawPosts);
    // CRITICAL: They are the EXACT same array instance in memory!
    expect(userPostsValue!()).toBe(suspenseValue!());
  });
});
