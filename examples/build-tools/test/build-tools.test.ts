import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";

const rootDir = resolve(import.meta.dirname, "..");
const distDir = resolve(rootDir, "dist");

describe("@fimbul-works/seidr-build-tools cross-bundler verification", () => {
  const bundlers = ["webpack", "vite", "rollup", "rolldown", "esbuild"] as const;

  for (const bundler of bundlers) {
    describe(`Bundler: ${bundler}`, () => {
      const clientBundlePath = resolve(distDir, bundler, "client.js");
      const serverBundlePath = resolve(distDir, bundler, "server.js");

      let clientBundleCode: string;
      let serverBundleCode: string;

      beforeAll(() => {
        clientBundleCode = readFileSync(clientBundlePath, "utf-8");
        serverBundleCode = readFileSync(serverBundlePath, "utf-8");
      });

      describe("Client bundle AST pruning & dead-code elimination", () => {
        it("should eliminate all server-only secrets and database logic", () => {
          expect(clientBundleCode).not.toContain("super-secret-server-db-key-12345");
          expect(clientBundleCode).not.toContain("loadServerDatabaseData");
          expect(clientBundleCode).not.toContain("SERVER_DATA_FROM_DB");
        });

        it("should eliminate inServer call blocks", () => {
          expect(clientBundleCode).not.toContain("inServer(");
        });

        it("should preserve client-specific code and compile-time branch", () => {
          expect(clientBundleCode).toContain("CLIENT_BROWSER");
        });

        it("should execute in browser DOM environment and render the component", async () => {
          const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app"></div></body></html>`, {
            url: "http://localhost:3000",
            runScripts: "dangerously",
          });

          // Polyfill DOM globals
          const originalWindow = globalThis.window;
          const originalDocument = globalThis.document;

          globalThis.window = dom.window as any;
          globalThis.document = dom.window.document as any;

          try {
            const clientModule = await import(`${pathToFileURL(clientBundlePath).href}?t=${Date.now()}`);
            expect(typeof clientModule.mountClient).toBe("function");

            const container = dom.window.document.getElementById("app")!;
            const unmount = clientModule.mountClient(container);

            expect(container.innerHTML).toContain("Seidr Cross-Bundler Isomorphic App");
            expect(container.innerHTML).toContain("CLIENT_BROWSER");
            expect(container.innerHTML).toContain("Count: 0");

            // Click the increment button to test reactive state update
            const button = container.querySelector("#btn-increment") as HTMLButtonElement;
            expect(button).not.toBeNull();
            button.click();

            expect(container.innerHTML).toContain("Count: 1");

            unmount?.();
          } finally {
            globalThis.window = originalWindow;
            globalThis.document = originalDocument;
          }
        });
      });

      describe("Server bundle AST pruning & dead-code elimination", () => {
        it("should eliminate all client-only storage and window APIs", () => {
          expect(serverBundleCode).not.toContain("getClientLocalStorageItem");
          expect(serverBundleCode).not.toContain("client-only-storage");
        });

        it("should eliminate inClient call blocks", () => {
          expect(serverBundleCode).not.toContain("inClient(");
        });

        it("should preserve server-specific code and compile-time branch", () => {
          expect(serverBundleCode).toContain("SSR_SERVER");
        });

        it("should execute renderServerApp and produce HTML markup with hydration data", async () => {
          const serverModule = await import(`${pathToFileURL(serverBundlePath).href}?t=${Date.now()}`);
          expect(typeof serverModule.renderServerApp).toBe("function");

          const { html, hydrationData } = await serverModule.renderServerApp(42);

          expect(html).toContain("Seidr Cross-Bundler Isomorphic App");
          expect(html).toContain("SSR_SERVER");
          expect(html).toContain("super-secret-server-db-key-12345:SERVER_DATA_FROM_DB");
          expect(html).toContain("Count: 42");

          expect(hydrationData).toBeDefined();
        });
      });
    });
  }

  describe("Babel transform verification", () => {
    it("should eliminate server code from Babel client output", () => {
      const code = readFileSync(resolve(distDir, "babel/isomorphic-app.client.js"), "utf-8");
      expect(code).not.toContain("super-secret-server-db-key");
      expect(code).not.toContain("server-only-secret");
      expect(code).not.toContain("inServer(");
      expect(code).toContain("CLIENT_BROWSER");
    });

    it("should eliminate client code from Babel server output", () => {
      const code = readFileSync(resolve(distDir, "babel/isomorphic-app.server.js"), "utf-8");
      expect(code).not.toContain("getClientLocalStorageItem");
      expect(code).not.toContain("client-only-storage");
      expect(code).not.toContain("inClient(");
      expect(code).toContain("SSR_SERVER");
      expect(code).toContain("SERVER_SECRET_DATABASE_KEY");
    });
  });
});
