import { isStr } from "@fimbul-works/hvat";
import { createUnplugin, type UnpluginInstance } from "unplugin";
import { transformSource } from "./transform.js";
import type { SeidrBuildPluginOptions } from "./types.js";

/**
 * Creates a module filter based on include/exclude patterns and file extensions.
 *
 * @param {string | RegExp | Array<string | RegExp>} [include] - Include pattern
 * @param {string | RegExp | Array<string | RegExp>} [exclude] - Exclude pattern
 * @returns {(id: string) => boolean} Filter function
 */
function createFilter(
  include?: string | RegExp | Array<string | RegExp>,
  exclude?: string | RegExp | Array<string | RegExp>,
): (id: string) => boolean {
  const matchPattern = (pattern: string | RegExp, id: string): boolean => {
    if (isStr(pattern)) {
      return id.includes(pattern);
    }
    return pattern.test(id);
  };

  const matches = (patterns: string | RegExp | Array<string | RegExp> | undefined, id: string): boolean => {
    if (!patterns) return false;
    if (Array.isArray(patterns)) {
      return patterns.some((p) => matchPattern(p, id));
    }
    return matchPattern(patterns, id);
  };

  return (id: string): boolean => {
    if (id.startsWith("\0")) return false;
    if (exclude && matches(exclude, id)) return false;
    if (include && !matches(include, id)) return false;
    return /\.[cm]?[jt]sx?(\?.*)?$/.test(id);
  };
}

/**
 * Official unified Seidr build plugin factory created via unplugin.
 * Provides isomorphic AST pruning and dead-code elimination across all supported bundlers:
 * Vite, Webpack, Rollup, Rolldown, Esbuild, Rspack, etc.
 */
export const unplugin: UnpluginInstance<SeidrBuildPluginOptions | undefined, false> = createUnplugin<
  SeidrBuildPluginOptions | undefined,
  false
>((options: SeidrBuildPluginOptions = {}, _meta) => {
  const { disableSSR = false, target = "browser", include, exclude } = options;
  const filter = createFilter(include, exclude);

  return {
    name: "seidr",
    enforce: "pre",
    transformInclude(id: string) {
      return filter(id);
    },
    transform(code: string, id: string) {
      if (!filter(id)) return null;

      // Auto-detect target environment when not explicitly configured
      let envTarget = target;
      if (options.target === undefined) {
        const isViteSSR = (this as any)?.environment?.config?.consumer === "server" || (this as any)?.ssr;
        if (isViteSSR) {
          envTarget = "ssr";
        }
      }

      return transformSource(id, code, envTarget, disableSSR);
    },
    vite: {
      applyToEnvironment(env) {
        return {
          name: "seidr:env",
          transform(code: string, id: string) {
            if (!filter(id)) return null;
            const envTarget = options.target ?? (env.config.consumer === "client" ? "browser" : "ssr");
            return transformSource(id, code, envTarget, disableSSR);
          },
        };
      },
    },
  };
});

export const seidrUnplugin = unplugin;
