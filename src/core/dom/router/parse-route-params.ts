import { getCurrentPath } from "./get-current-path";
import { normalizePath } from "./normalize-path";

/**
 * Try to match pattern with path, and parse Route parameters.
 * @param {string} pattern - Path pattern like `"/user/:id/edit"`
 * @param {string} path - Optional URL pathname to match against (default: current path)
 * @returns {Record<string, string> | false} Object with matching parameters, or `false` when pattern and path do not match
 */
export function parseRouteParams(pattern: string, path?: string): Record<string, string> | false {
  // If no path provided, use current path
  const pathToMatch = path ?? getCurrentPath().value;

  // Normalize paths by removing trailing slashes
  const normalizedPattern = normalizePath(pattern);
  const normalizedPath = normalizePath(pathToMatch);

  const parts = normalizedPattern.split("/");
  const pathParts = normalizedPath.split("/");

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

  return params;
}
