import { afterEach, beforeEach, expect, it } from "vitest";
import { createComponent } from "../../component/create-component.js";
import { mount } from "../../dom/mount.js";
import { $div } from "../../elements/div.js";
import { clearTestAppState, describeDualMode } from "../../test-setup/index.js";
import { usePathname } from "../hooks/use-pathname.js";
import { useRouteParams } from "../hooks/use-route-params.js";
import { clearRouterState } from "../test/index.js";
import { Router } from "./router.js";

describeDualMode("Router Nesting", ({ getDocument }) => {
  let container: HTMLElement;
  let doc: Document;

  beforeEach(() => {
    doc = getDocument();
    container = doc.createElement("div");
    doc.body.appendChild(container);
    clearRouterState();
    clearTestAppState();
  });

  afterEach(() => {
    if (container.parentNode) {
      doc.body.removeChild(container);
    }
  });

  it("should match nested routes relative to parent", () => {
    const SettingsPage = () => $div({ textContent: "Settings Page" });
    const ProfilePage = () => $div({ textContent: "Profile Page" });

    const UserDashboard = () =>
      Router([
        { path: "/settings", component: SettingsPage },
        { path: "/profile", component: ProfilePage },
      ]);

    const App = () => Router([{ path: "/user/:id", component: UserDashboard }], { url: "/user/123/settings" });

    mount(App, container);

    expect(container.textContent).toContain("Settings Page");
  });

  it("should return localized pathname via usePathname", () => {
    let rootPath = "";
    let midPath = "";
    let leafPath = "";

    const Leaf = createComponent(() => {
      leafPath = usePathname()();
      return $div({ textContent: "Leaf" });
    }, "Leaf");

    const Mid = createComponent(() => {
      midPath = usePathname()();
      return Router([{ path: "/c", component: Leaf }]);
    }, "Mid");

    const App = createComponent(() => {
      return Router(
        [
          {
            path: "*",
            component: createComponent(() => {
              rootPath = usePathname()();
              return Router([{ path: "/a/:any", component: Mid }]);
            }),
          },
        ],
        { url: "/a/b/c" },
      );
    }, "App");

    mount(App, container);

    expect(rootPath).toBe("/a/b/c");
    expect(midPath).toBe("/a/b/c");
    expect(leafPath).toBe("/c");
  });

  it("should return localized params via useRouteParams", () => {
    let userParams: any = {};
    let orderParams: any = {};

    const OrderDetails = createComponent(() => {
      orderParams = useRouteParams()();
      return $div({ textContent: "Order" });
    }, "OrderDetails");

    const UserDashboard = createComponent(() => {
      userParams = useRouteParams()();
      return Router([{ path: "/order/:orderId", component: OrderDetails }]);
    }, "UserDashboard");

    const App = createComponent(
      () => Router([{ path: "/user/:userId", component: UserDashboard }], { url: "/user/123/order/456" }),
      "App",
    );

    mount(App, container);

    expect(userParams).toEqual({ userId: "123" });
    expect(orderParams).toEqual({ orderId: "456" });
  });
});
