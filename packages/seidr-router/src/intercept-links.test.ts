import { createComponent, mount, SeidrError } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { clearTestAppState, describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Router } from "./components/router.js";
import { ERROR_ROUTER_NOT_INITIALIZED } from "./constants.js";
import { getRouterState } from "./get-router-state.js";
import { useRouteParams } from "./hooks/use-route-params.js";
import { initRouter } from "./init-router.js";
import { interceptLinks } from "./intercept-links.js";
import { clearRouterState } from "./test/index.js";

describeDualMode("interceptLinks", ({ getDocument, isSSR }) => {
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

  it("should throw an error if router is not initialized", () => {
    expect(() => interceptLinks(container)).toThrowError(SeidrError);
    expect(() => interceptLinks(container)).toThrow(ERROR_ROUTER_NOT_INITIALIZED);
  });

  if (isSSR) {
    it("should not attach click handlers during SSR", () => {
      initRouter("/");
      const link = doc.createElement("a");
      link.setAttribute("href", "/about");
      container.appendChild(link);

      interceptLinks(container);
      expect(link.onclick).toBeNull();
    });
  } else {
    it("should intercept relative links and navigate on click", () => {
      initRouter("/");

      const link = doc.createElement("a");
      link.setAttribute("href", "/about");
      container.appendChild(link);

      interceptLinks(container);

      expect(typeof link.onclick).toBe("function");

      const event = new MouseEvent("click", { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      link.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(getRouterState().url().pathname).toBe("/about");
    });

    it("should intercept same-origin absolute links", () => {
      initRouter("http://localhost:3000/");

      const link = doc.createElement("a");
      link.setAttribute("href", "http://localhost:3000/contact");
      container.appendChild(link);

      interceptLinks(container);

      expect(typeof link.onclick).toBe("function");

      const event = new MouseEvent("click", { cancelable: true });
      link.dispatchEvent(event);

      expect(getRouterState().url().pathname).toBe("/contact");
    });

    it("should not intercept links with a target attribute", () => {
      initRouter("/");

      const linkBlank = doc.createElement("a");
      linkBlank.setAttribute("href", "/docs");
      linkBlank.setAttribute("target", "_blank");
      container.appendChild(linkBlank);

      const linkSelf = doc.createElement("a");
      linkSelf.setAttribute("href", "/docs");
      linkSelf.setAttribute("target", "_self");
      container.appendChild(linkSelf);

      interceptLinks(container);

      expect(linkBlank.onclick).toBeNull();
      expect(linkSelf.onclick).toBeNull();
    });

    it("should not intercept links with a download attribute", () => {
      initRouter("/");

      const linkDownload = doc.createElement("a");
      linkDownload.setAttribute("href", "/file.txt");
      linkDownload.setAttribute("download", "file.txt");
      container.appendChild(linkDownload);

      const linkDownload2 = doc.createElement("a");
      linkDownload2.setAttribute("href", "/file.txt");
      linkDownload2.setAttribute("download", "file.txt");
      container.appendChild(linkDownload2);

      interceptLinks(container);

      expect(linkDownload.onclick).toBeNull();
      expect(linkDownload2.onclick).toBeNull();
    });

    it("should not intercept cross-origin links", () => {
      initRouter("/");

      const externalLink = doc.createElement("a");
      externalLink.setAttribute("href", "https://google.com/search");
      container.appendChild(externalLink);

      interceptLinks(container);

      expect(externalLink.onclick).toBeNull();
    });

    it("should not intercept non-http protocols like mailto or javascript", () => {
      initRouter("/");

      const mailtoLink = doc.createElement("a");
      mailtoLink.setAttribute("href", "mailto:info@example.com");
      container.appendChild(mailtoLink);

      const jsLink = doc.createElement("a");
      jsLink.setAttribute("href", "javascript:void(0)");
      container.appendChild(jsLink);

      interceptLinks(container);

      expect(mailtoLink.onclick).toBeNull();
      expect(jsLink.onclick).toBeNull();
    });

    it("should not intercept links without href or with empty href", () => {
      initRouter("/");

      const anchorWithoutHref = doc.createElement("a");
      anchorWithoutHref.setAttribute("name", "top");
      container.appendChild(anchorWithoutHref);

      const anchorEmptyHref = doc.createElement("a");
      anchorEmptyHref.setAttribute("href", "");
      container.appendChild(anchorEmptyHref);

      interceptLinks(container);

      expect(anchorWithoutHref.onclick).toBeNull();
      expect(anchorEmptyHref.onclick).toBeNull();
    });

    it("should not overwrite existing onclick handlers", () => {
      initRouter("/");

      const customHandler = vi.fn();
      const link = doc.createElement("a");
      link.setAttribute("href", "/dashboard");
      link.onclick = customHandler;
      container.appendChild(link);

      interceptLinks(container);

      expect(link.onclick).toBe(customHandler);

      link.dispatchEvent(new MouseEvent("click", { cancelable: true }));
      expect(customHandler).toHaveBeenCalled();
      // Router URL should not have changed to /dashboard
      expect(getRouterState().url().pathname).not.toBe("/dashboard");
    });

    it("should work when pointed directly to an anchor element", () => {
      initRouter("/");

      const link = doc.createElement("a");
      link.setAttribute("href", "/direct-target");
      container.appendChild(link);

      interceptLinks(link);

      expect(typeof link.onclick).toBe("function");

      link.dispatchEvent(new MouseEvent("click", { cancelable: true }));
      expect(getRouterState().url().pathname).toBe("/direct-target");
    });

    it("should ignore special mouse events (ctrl, meta, shift, middle-click) and allow native handling", () => {
      initRouter("/");

      const link = doc.createElement("a");
      link.setAttribute("href", "/special-click");
      container.appendChild(link);

      interceptLinks(container);

      expect(typeof link.onclick).toBe("function");

      // 1. Ctrl + click (e.g. open in new tab on Windows/Linux)
      const ctrlEvent = new MouseEvent("click", { cancelable: true, ctrlKey: true });
      const ctrlPreventDefault = vi.spyOn(ctrlEvent, "preventDefault");
      link.dispatchEvent(ctrlEvent);
      expect(ctrlPreventDefault).not.toHaveBeenCalled();
      expect(getRouterState().url().pathname).toBe("/");

      // 2. Meta / Cmd + click (e.g. open in new tab on macOS)
      const metaEvent = new MouseEvent("click", { cancelable: true, metaKey: true });
      const metaPreventDefault = vi.spyOn(metaEvent, "preventDefault");
      link.dispatchEvent(metaEvent);
      expect(metaPreventDefault).not.toHaveBeenCalled();
      expect(getRouterState().url().pathname).toBe("/");

      // 3. Shift + click (e.g. open in new window)
      const shiftEvent = new MouseEvent("click", { cancelable: true, shiftKey: true });
      const shiftPreventDefault = vi.spyOn(shiftEvent, "preventDefault");
      link.dispatchEvent(shiftEvent);
      expect(shiftPreventDefault).not.toHaveBeenCalled();
      expect(getRouterState().url().pathname).toBe("/");

      // 4. Middle click (button 1)
      const middleEvent = new MouseEvent("click", { cancelable: true, button: 1 });
      const middlePreventDefault = vi.spyOn(middleEvent, "preventDefault");
      link.dispatchEvent(middleEvent);
      expect(middlePreventDefault).not.toHaveBeenCalled();
      expect(getRouterState().url().pathname).toBe("/");

      // 5. Right click (button 2)
      const rightEvent = new MouseEvent("click", { cancelable: true, button: 2 });
      const rightPreventDefault = vi.spyOn(rightEvent, "preventDefault");
      link.dispatchEvent(rightEvent);
      expect(rightPreventDefault).not.toHaveBeenCalled();
      expect(getRouterState().url().pathname).toBe("/");

      // Normal left click (button 0, no modifiers) should still intercept
      const normalEvent = new MouseEvent("click", { cancelable: true, button: 0 });
      const normalPreventDefault = vi.spyOn(normalEvent, "preventDefault");
      link.dispatchEvent(normalEvent);
      expect(normalPreventDefault).toHaveBeenCalled();
      expect(getRouterState().url().pathname).toBe("/special-click");
    });

    it("should handle nested routers across 3 layers correctly", () => {
      initRouter("/home");

      let capturedUserId = "";
      let capturedAction = "";

      // Layer 3: handles "/:action"
      const Layer3Action = createComponent(() => {
        const params = useRouteParams();
        params.watch((p) => {
          capturedAction = p.action;
        });
        capturedAction = params().action;
        return $div({
          className: "action-view",
          textContent: params.as((p) => `Action: ${p.action}`),
        });
      }, "Layer3Action");

      // Layer 2: handles "/:userId/*"
      const Layer2User = createComponent(() => {
        const params = useRouteParams();
        params.watch((p) => {
          capturedUserId = p.userId;
        });
        capturedUserId = params().userId;
        return Router([{ path: "/:action", component: Layer3Action }]);
      }, "Layer2User");

      // Layer 1: handles "/user/*"
      const Layer1Root = createComponent(() => {
        return Router([{ path: "/:userId/*", component: Layer2User }]);
      }, "Layer1Root");

      // App router
      const App = () =>
        Router(
          [
            { path: "/user/*", component: Layer1Root },
            { path: "*", component: () => $div({ className: "fallback", textContent: "Fallback" }) },
          ],
          { url: "http://localhost:3000/home" },
        );

      mount(App, container);
      expect(container.textContent).toContain("Fallback");

      // Simulate dynamic HTML content
      const dynamicContent = doc.createElement("div");
      dynamicContent.innerHTML = `
        <article>
          <p>Check out user profile:</p>
          <a href="/user/1234/edit" id="test-edit-link">Edit User 1234</a>
          <a href="/user/5678/delete" id="test-delete-link">Delete User 5678</a>
        </article>
      `;
      doc.body.appendChild(dynamicContent);

      try {
        // Wire up the dynamic content to the router
        interceptLinks(dynamicContent);

        const editLink = dynamicContent.querySelector<HTMLAnchorElement>("#test-edit-link")!;
        const deleteLink = dynamicContent.querySelector<HTMLAnchorElement>("#test-delete-link")!;

        expect(typeof editLink.onclick).toBe("function");
        expect(typeof deleteLink.onclick).toBe("function");

        // Click 1: Navigate to "/user/1234/edit"
        editLink.dispatchEvent(new MouseEvent("click", { cancelable: true }));

        expect(getRouterState().url().pathname).toBe("/user/1234/edit");
        expect(capturedUserId).toBe("1234");
        expect(capturedAction).toBe("edit");
        expect(container.textContent).toContain("Action: edit");

        // Click 2: Navigate to "/user/5678/delete"
        deleteLink.dispatchEvent(new MouseEvent("click", { cancelable: true }));

        expect(getRouterState().url().pathname).toBe("/user/5678/delete");
        expect(capturedUserId).toBe("5678");
        expect(capturedAction).toBe("delete");
        expect(container.textContent).toContain("Action: delete");
      } finally {
        if (dynamicContent.parentNode) {
          doc.body.removeChild(dynamicContent);
        }
      }
    });
  }
});
