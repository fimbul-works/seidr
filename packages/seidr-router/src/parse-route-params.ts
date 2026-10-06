/**
 * Try to match pattern with path, and parse Route parameters.
 * Supports prefix matching for nested routes and wildcard ("*") matching.
 *
 * @template {Record<string, string>} T - The type of matching route parameters
 * @param {string} pattern - Path pattern like `"/user/:id"` or `"/admin/*"`
 * @param {string} pathname - URL pathname to match against
 * @param {boolean} [exact=false] - Whether to enforce an exact match
 * @returns {T | false} Object with matching parameters, or `false` when pattern and path do not match
 */
export const parseRouteParams = <T extends Record<string, string> = Record<string, string>>(
  pattern: string,
  pathname: string,
  exact = false,
): T | false => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathnameParts = pathname.split("/").filter(Boolean);

  const hasWildcard = patternParts[patternParts.length - 1] === "*";

  // If exact match is required, number of parts must be identical, unless there is a wildcard
  if (exact && !hasWildcard && patternParts.length !== pathnameParts.length) {
    return false;
  }

  // If pattern has more parts than pathname, it can't match, unless the extra part is a wildcard
  if (
    patternParts.length > pathnameParts.length &&
    !(patternParts.length === pathnameParts.length + 1 && hasWildcard)
  ) {
    return false;
  }

  // Collect parameters
  const params = {} as Record<string, string>;
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathnamePart = pathnameParts[i];

    // Wildcard matches all remaining parts
    if (patternPart === "*") {
      params["*"] = pathnameParts.slice(i).join("/");
      return params as T;
    }

    // Parameters start with ":"
    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = pathnamePart;
    } else if (patternPart !== pathnamePart) {
      // Return false on mismatch
      return false;
    }
  }

  return params as T;
};
