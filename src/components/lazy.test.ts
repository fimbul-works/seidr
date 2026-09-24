import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createComponent } from "../component/create-component.js";
import { onMounted } from "../component/lifecycle/on-mounted.js";
import { onUnmounted } from "../component/lifecycle/on-unmounted.js";
import { isComponentFactory, isLazyComponent } from "../component/type-guards.js";
import { mount } from "../dom/mount.js";
import { $ } from "../element/create-element.js";
import { createValue } from "../observable/value.js";
import { Router } from "../router/components/router.js";
import { initRouter } from "../router/init-router.js";
import { renderToString } from "../ssr/render-to-string.js";
import { describeDualMode } from "../test-setup/dual-mode.js";
import type { CleanupFunction } from "../types.js";
import { isClient } from "../util/environment/is-client.js";
import { lazy } from "./lazy.js";
import { Suspense } from "./suspense.js";
import { Switch } from "./switch.js";

describeDualMode("lazy() Component", ({ getDocument }) => {
  let container: HTMLElement;
  let unmount: CleanupFunction | undefined;

  beforeEach(() => {
    const doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
  });

  afterEach(() => {
    unmount?.();
    unmount = undefined;
    container?.remove();
  });

  it("should conform to component factory interface and type guards", () => {
    const LazyComp = lazy(() => Promise.resolve({ default: () => $("div", "Loaded") }));
    expect(isComponentFactory(LazyComp)).toBe(true);
    expect(isLazyComponent(LazyComp)).toBe(true);
    expect(typeof LazyComp.preload).toBe("function");
  });

  it("should show fallback initially and swap to loaded component upon resolution", async () => {
    let resolvePromise!: (val: { default: any }) => void;
    const promise = new Promise<{ default: any }>((resolve) => {
      resolvePromise = resolve;
    });

    const InnerComp = createComponent(() => $("h1", { textContent: "Lazy Content" }), "InnerComp");
    const LazyComp = lazy(() => promise, {
      fallback: () => $("div", { textContent: "Loading..." }),
      name: "TestLazy",
    });

    unmount = mount(() => LazyComp(), container);

    expect(container.textContent).toBe("Loading...");

    resolvePromise({ default: InnerComp });
    await new Promise((r) => setTimeout(r, 15));

    expect(container.textContent).toBe("Lazy Content");
  });

  it("should support direct component export without default wrapper", async () => {
    const InnerComp = createComponent(() => $("p", { textContent: "Direct Export" }), "DirectComp");
    const LazyComp = lazy(async () => InnerComp);

    unmount = mount(() => LazyComp(), container);

    await new Promise((r) => setTimeout(r, 15));
    expect(container.textContent).toBe("Direct Export");
  });

  it("should support a Promise passed directly as loader", async () => {
    const InnerComp = createComponent(() => $("span", { textContent: "Direct Promise" }));
    const LazyComp = lazy(Promise.resolve({ default: InnerComp }));

    unmount = mount(() => LazyComp(), container);

    await new Promise((r) => setTimeout(r, 15));
    expect(container.textContent).toBe("Direct Promise");
  });

  it("should render fast-path synchronously if module is already resolved", async () => {
    const InnerComp = createComponent(() => $("div", { textContent: "Cached" }));
    const LazyComp = lazy(() => Promise.resolve({ default: InnerComp }));

    // Preload and wait for resolution
    await LazyComp.preload();

    // Now mount: should render immediately without any pending delay
    unmount = mount(() => LazyComp(), container);
    expect(container.textContent).toBe("Cached");
  });

  it("should reuse the same promise across multiple concurrent invocations", async () => {
    let callCount = 0;
    const loader = vi.fn(async () => {
      callCount++;
      return { default: () => $("div", "Multiple Instances") };
    });

    const LazyComp = lazy(loader);

    const c1 = LazyComp();
    const c2 = LazyComp();
    const c3 = LazyComp();

    expect(callCount).toBe(1);

    await LazyComp.preload();
    expect(callCount).toBe(1);
  });

  it("should forward static and reactive props to the loaded component", async () => {
    interface TestProps {
      title: string;
      count: ReturnType<typeof createValue<number>>;
    }

    const InnerComp = createComponent<TestProps>(({ title, count }) => {
      return $("div", [$("span", { textContent: title }), $("b", { textContent: count.as(String) })]);
    });

    const LazyComp = lazy<TestProps>(() => Promise.resolve({ default: InnerComp }));

    const countVal = createValue(10);
    unmount = mount(() => LazyComp({ title: "Count: ", count: countVal }), container);

    await new Promise((r) => setTimeout(r, 15));

    expect(container.textContent).toBe("Count: 10");

    countVal(25);
    expect(container.textContent).toBe("Count: 25");
  });

  it("should trigger onMounted and onUnmounted lifecycle hooks on the loaded component", async () => {
    const mountedSpy = vi.fn();
    const unmountedSpy = vi.fn();

    const InnerComp = createComponent(() => {
      onMounted(mountedSpy);
      onUnmounted(unmountedSpy);
      return $("div", { textContent: "Lifecycle Target" });
    });

    const LazyComp = lazy(() => Promise.resolve({ default: InnerComp }));

    unmount = mount(() => LazyComp(), container);

    await new Promise((r) => setTimeout(r, 20));

    expect(container.textContent).toBe("Lifecycle Target");
    if (isClient()) {
      expect(mountedSpy).toHaveBeenCalled();
    }
    expect(unmountedSpy).not.toHaveBeenCalled();

    unmount();
    unmount = undefined;

    expect(unmountedSpy).toHaveBeenCalled();
  });

  it("should gracefully handle unmounting before the lazy module resolves", async () => {
    let resolvePromise!: (val: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const LazyComp = lazy(() => promise as any, {
      fallback: () => $("div", { textContent: "Pending..." }),
    });

    unmount = mount(() => LazyComp(), container);
    expect(container.textContent).toBe("Pending...");

    // Unmount before resolution
    unmount();
    unmount = undefined;

    // Resolve now: should not throw error or mutate detached DOM
    resolvePromise({ default: () => $("div", { textContent: "Should Not Crash" }) });
    await new Promise((r) => setTimeout(r, 15));

    expect(container.textContent).toBe("");
  });

  it("should render error fallback and reset cache on loader failure to allow retry", async () => {
    let shouldFail = true;

    const loader = vi.fn(async () => {
      if (shouldFail) {
        throw new Error("Network Chunk Failure");
      }
      return { default: () => $("div", { textContent: "Recovered" }) };
    });

    const LazyComp = lazy(loader, {
      fallback: () => $("div", "Loading..."),
      onError: (err) => $("div", { textContent: `Error: ${err.message}` }),
    });

    unmount = mount(() => LazyComp(), container);

    await new Promise((r) => setTimeout(r, 20));
    expect(container.textContent).toBe("Error: Network Chunk Failure");

    unmount();
    unmount = undefined;

    // Retry after fixing condition
    shouldFail = false;
    unmount = mount(() => LazyComp(), container);

    await new Promise((r) => setTimeout(r, 20));
    expect(container.textContent).toBe("Recovered");
  });

  it("should integrate seamlessly with Router for route code-splitting", async () => {
    initRouter("/home");

    const HomeComp = createComponent(() => $("h1", { textContent: "Home Page" }));
    const LazyAboutComp = lazy(() => Promise.resolve({ default: () => $("h1", { textContent: "About Page" }) }), {
      fallback: () => $("div", "Loading Route..."),
    });

    const routes = [
      { path: "/home", component: HomeComp },
      { path: "/about", component: LazyAboutComp },
    ];

    unmount = mount(() => Router(routes), container);
    expect(container.textContent).toBe("Home Page");

    // Navigate to /about
    initRouter("/about");
    await new Promise((r) => setTimeout(r, 20));

    expect(container.textContent).toBe("About Page");
  });

  it("should integrate with Suspense component using preload", async () => {
    const InnerComp = createComponent(() => $("div", { textContent: "Suspense Resolved" }));
    const LazyComp = lazy(() => Promise.resolve({ default: InnerComp }));

    unmount = mount(
      () =>
        Suspense(LazyComp, ({ state }) =>
          Switch(state, {
            pending: () => $("div", "Suspense Loading..."),
            resolved: () => LazyComp(),
            error: () => $("div", "Suspense Error"),
          }),
        ),
      container,
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(container.textContent).toBe("Suspense Resolved");
  });
});

describe("lazy() SSR parity", () => {
  it("should await lazy module resolution during renderToString", async () => {
    const AsyncPage = lazy(async () => {
      await new Promise((r) => setTimeout(r, 10));
      return {
        default: createComponent(() => $("article", { textContent: "Server Rendered Article" })),
      };
    });

    const { html } = await renderToString(() => $("main", [AsyncPage()]));

    expect(html).toContain("<main>");
    expect(html).toContain("<article>Server Rendered Article</article>");
  });
});
