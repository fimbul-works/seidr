import { mount, Seidr, Suspense, Switch } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("docs/Suspense.md Examples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  test("Basic Suspense Example", async () => {
    // Mock fetch-like behavior
    const fetchUser = async (id: string) => {
      return { name: `User ${id}` };
    };

    const UserProfile = (user: any) => $div({ textContent: user.name });

    const App = () => {
      return $div({}, [
        Suspense(fetchUser("123"), ({ state, value, error }) =>
          Switch(state, {
            pending: () => $div({ textContent: "Loading user..." }),
            resolved: () => UserProfile(value.value),
            error: () => $div({ textContent: `Error: ${error.value?.message}` }),
          }),
        ),
      ]);
    };

    mount(App, document.body);
    expect(document.body.textContent).toContain("Loading user...");

    // Wait for promise to resolve
    await vi.waitUntil(() => document.body.textContent?.includes("User 123"));
    expect(document.body.textContent).toContain("User 123");
  });

  test("Reactive Suspense Usage", async () => {
    const userId = new Seidr("1", { sync: true });

    const fetchUser = async (id: string) => {
      return { name: `User ${id}` };
    };

    const UserProfile = (user: any) => $div({ textContent: user.name });

    const App = () => {
      const userIdPromise = userId.as((id) => fetchUser(id));

      return $div({}, [
        Suspense(userIdPromise, ({ state, value, error }) =>
          Switch(state, {
            pending: () => $div({ textContent: "Loading..." }),
            resolved: () => UserProfile(value.value),
            error: () => $div({ textContent: "Error" }),
          }),
        ),
      ]);
    };

    mount(App, document.body);
    expect(document.body.textContent).toContain("Loading...");

    await vi.waitUntil(() => document.body.textContent?.includes("User 1"));

    userId.value = "2";
    expect(document.body.textContent).toContain("Loading...");

    await vi.waitUntil(() => document.body.textContent?.includes("User 2"));
    expect(document.body.textContent).toContain("User 2");
  });
});
