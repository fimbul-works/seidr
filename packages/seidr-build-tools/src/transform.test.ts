import { describe, expect, it } from "vitest";
import { seidrBabelPlugin } from "./babel.js";
import { seidrEsbuildPlugin } from "./esbuild.js";
import { seidrRolldownPlugin } from "./rolldown.js";
import { seidrRollupPlugin } from "./rollup.js";
import { seidrRspackPlugin } from "./rspack.js";
import { cleanId, transformSource } from "./transform.js";
import { unplugin } from "./unplugin.js";
import { seidrVitePlugin } from "./vite.js";
import { seidrWebpackPlugin } from "./webpack.js";

describe("seidr-build-tools transformSource", () => {
  const sampleCode = `
import { inClient, inServer, isClient, isServer } from "@fimbul-works/seidr";
import { serverSecret } from "./server-secret";
import { clientStorage } from "./client-storage";

export function testComponent() {
  inClient(() => {
    clientStorage.save("browser");
  });

  inServer(() => {
    serverSecret.query("database");
  });

  if (isClient()) {
    console.log("Running in client");
  }

  if (isServer()) {
    console.log("Running in server");
  }
}
`;

  it("should clean query parameters and hashes from module IDs", () => {
    expect(cleanId("/path/to/component.ts?v=12345")).toBe("/path/to/component.ts");
    expect(cleanId("/path/to/component.tsx#section")).toBe("/path/to/component.tsx");
    expect(cleanId("module.js?param=1#hash")).toBe("module.js");
  });

  it("should transform code for browser environment", () => {
    const result = transformSource("test.ts", sampleCode, "browser", false);

    expect(result.code).not.toContain("serverSecret");
    expect(result.code).not.toContain("inServer(");
    expect(result.code).toContain("inClient(() => {");
    expect(result.code).toContain("clientStorage.save");
    expect(result.code).toContain("if (true)");
    expect(result.code).toContain("if (false)");
  });

  it("should transform code for SSR environment", () => {
    const result = transformSource("test.ts", sampleCode, "ssr", false);

    expect(result.code).not.toContain("clientStorage");
    expect(result.code).not.toContain("inClient(");
    expect(result.code).toContain("inServer(() => {");
    expect(result.code).toContain("serverSecret.query");
    expect(result.code).toContain("if (false)");
    expect(result.code).toContain("if (true)");
  });

  it("should throw error when target is ssr and disableSSR is true", () => {
    expect(() => transformSource("test.ts", sampleCode, "ssr", true)).toThrowError(
      "Cannot build for SSR with SSR disabled",
    );
  });

  it("should export all framework unplugin adapters", () => {
    expect(unplugin).toBeDefined();
    expect(typeof unplugin.vite).toBe("function");
    expect(typeof unplugin.webpack).toBe("function");
    expect(typeof unplugin.rollup).toBe("function");
    expect(typeof unplugin.rolldown).toBe("function");
    expect(typeof unplugin.esbuild).toBe("function");
    expect(typeof unplugin.rspack).toBe("function");

    expect(typeof seidrVitePlugin).toBe("function");
    expect(typeof seidrWebpackPlugin).toBe("function");
    expect(typeof seidrRollupPlugin).toBe("function");
    expect(typeof seidrRolldownPlugin).toBe("function");
    expect(typeof seidrEsbuildPlugin).toBe("function");
    expect(typeof seidrRspackPlugin).toBe("function");
    expect(typeof seidrBabelPlugin).toBe("function");
  });
});
