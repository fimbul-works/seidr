import { getCurrentPath } from "./get-current-path";
import { normalizePath } from "./normalize-path";

/**
 * Try to match pattern with path, and parse Route parameters.
 * @template {Record<string, string>} T - The type of matching route parameters
 * @param {string} pattern - Path pattern like `"/user/:id/edit"`
 * @param {string} path - Optional URL pathname to match against (default: current path)
 * @returns {T | false} Object with matching parameters, or `false` when pattern and path do not match
 */
export const parseRouteParams = <T extends Record<string, string> = Record<string, string>>(
  pattern: string,
  path?: string,
): T | false => {
  const parts = normalizePath(pattern).split("/");
  const pathParts = normalizePath(path ?? getCurrentPath().value).split("/");

  // Ensure path and pattern have equal number of parts
  if (parts.length !== pathParts.length) {
    return false;
  }

  // Collect parameters
  const params = {} as Record<string, string>;
  for (let i = 0; i < parts.length; i++) {
    // Parameters start with ":"
    if (parts[i].startsWith(":")) {
      params[parts[i].slice(1)] = pathParts[i];
    } else if (parts[i] !== pathParts[i]) {
      // Return false on mismatch
      return false;
    }
  }

  return params as T;
};
