import MagicString from "magic-string";
import type { TransformResult } from "rolldown";
import { removeOrphanedImports } from "./remove-orphaned-imports.js";
import { clientOnlyReplacements, clientReplace, serverReplace } from "./replacements.js";
import { transformInEnvironment } from "./transform-in-environment.js";
import { replace } from "./util.js";

/**
 * Transforms a source code file by replacing environment-specific code, removing orphaned imports, and applying environment-specific string replacements.
 * @param id The ID of the source file.
 * @param code The source code to transform.
 * @param target The target environment for the build.
 * @param disableSSR Whether SSR is disabled.
 * @returns The transformed source code.
 */
export function transformSource(
  id: string,
  code: string,
  target: "browser" | "ssr",
  disableSSR: boolean,
): TransformResult {
  if (target === "ssr" && disableSSR) {
    throw new Error("Cannot build for SSR with SSR disabled");
  }

  const isClient = target === "browser";
  const ms = new MagicString(code);

  // Transform source for environment and remove imports
  transformInEnvironment(ms, id, disableSSR || isClient);

  // Remove orphaned imports
  removeOrphanedImports(ms, id);

  // Apply string replacements
  replace(ms, disableSSR ? clientOnlyReplacements : isClient ? clientReplace : serverReplace);

  return {
    code: ms.toString(),
    map: ms.generateMap({ hires: true, source: id }),
  };
}
