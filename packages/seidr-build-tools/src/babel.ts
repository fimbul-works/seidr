import { transformSource } from "./transform.js";
import type { SeidrBabelPluginOptions } from "./types.js";

/**
 * Seidr Babel plugin.
 * Transforms Seidr isomorphic code, eliminates dead environment branches,
 * and removes orphaned imports during Babel compilation.
 *
 * @param {any} _api - Babel plugin API
 * @param {SeidrBabelPluginOptions} [options={}] - Seidr build plugin options
 * @returns {object} Configured Babel plugin
 */
export function seidrBabelPlugin(_api: any, options: SeidrBabelPluginOptions = {}): object {
  const { disableSSR = false, target = "browser" } = options;

  return {
    name: "babel-plugin-seidr",
    parserOverride(code: string, opts: any, parse: (code: string, opts: any) => any) {
      const filename = opts?.sourceFileName || "source.js";
      let transformedCode = code;

      if (/\.[cm]?[jt]sx?(\?.*)?$/.test(filename)) {
        try {
          const result = transformSource(filename, code, target, disableSSR);
          if (result?.code) {
            transformedCode = result.code;
          }
        } catch {
          // Fall back to original code on transform error so Babel produces standard parser error
        }
      }

      if (typeof parse === "function") {
        return parse(transformedCode, opts);
      }

      const defaultParser = (opts as any)?.parser;
      if (typeof defaultParser === "function") {
        return defaultParser(transformedCode, opts);
      }

      throw new Error("[@fimbul-works/seidr-build-tools/babel] Babel parse function not available in parserOverride.");
    },
  };
}

export default seidrBabelPlugin;
