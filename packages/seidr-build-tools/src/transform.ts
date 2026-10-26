import MagicString, { type SourceMap } from "magic-string";
import { removeOrphanedImports } from "./remove-orphaned-imports.js";
import { clientOnlyReplacements, clientReplace, serverReplace } from "./replacements.js";
import { transformInEnvironment } from "./transform-in-environment.js";
import type { SeidrBuildTarget } from "./types.js";
import { replace } from "./util.js";

/**
 * Result of the Seidr source code transformation.
 */
export interface SeidrTransformResult {
  code: string;
  map: SourceMap;
}

/**
 * Strips query parameters and hashes from a file ID/URL.
 *
 * @param {string} id - Module identifier or path
 * @returns {string} Sanitized path without query parameters or hash
 */
export function cleanId(id: string): string {
  return id.split("?")[0].split("#")[0];
}

/**
 * Transforms a source code file by replacing environment-specific code,
 * removing orphaned imports, and applying environment-specific string replacements.
 *
 * @param {string} id - The ID of the source file.
 * @param {string} code - The source code to transform.
 * @param {SeidrBuildTarget} [target="browser"] - The target environment for the build.
 * @param {boolean} [disableSSR=false] - Whether SSR is disabled.
 * @returns {SeidrTransformResult} The transformed source code and source map.
 */
export function transformSource(
  id: string,
  code: string,
  target: SeidrBuildTarget = "browser",
  disableSSR = false,
): SeidrTransformResult {
  if (target === "ssr" && disableSSR) {
    throw new Error("Cannot build for SSR with SSR disabled");
  }

  const isClient = target === "browser";
  const ms = new MagicString(code);
  const normalizedId = cleanId(id);

  // Transform source for environment (prune inServer / inClient callbacks)
  transformInEnvironment(ms, normalizedId, disableSSR || isClient);

  // Apply environment-specific string replacements
  replace(ms, disableSSR ? clientOnlyReplacements : isClient ? clientReplace : serverReplace);

  // Remove orphaned imports that are no longer referenced after replacements and pruning
  removeOrphanedImports(ms, normalizedId);

  return {
    code: ms.toString(),
    map: ms.generateMap({ hires: true, source: id }),
  };
}
