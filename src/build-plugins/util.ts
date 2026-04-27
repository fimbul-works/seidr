import type MagicString from "magic-string";

// Cache for compiled regular expressions to optimize string replacements
const replaceFromCache = new Map<string, RegExp>();

/**
 * Gets the regular expression for a given string pattern, compiling it if necessary.
 * @param {string} from - The string to replace
 * @returns {RegExp} The compiled regular expression for the given string pattern
 */
export const getReplaceRegex = (from: string) => {
  const escapeStr = (str: string) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");

  // Get from cache
  let regex = replaceFromCache.get(from);
  if (!regex) {
    // If the string contains spaces, we cannot use word boundaries, so return a simple regex
    if (from.includes(" ")) {
      regex = new RegExp(
        `(?<!\\b(?:const|let|var)\\s*)(?<![_$a-zA-Z0-9\\xA0-\\uFFFF])(${escapeStr(from)})(?![_$a-zA-Z0-9\\xA0-\\uFFFF])(?!\\.)(?!\\s*=[^=])`,
        "g",
      );
    } else {
      regex = new RegExp(
        `(?<!\\b(?:const|let|var)\\s*)(?<![_$a-zA-Z0-9\\xA0-\\uFFFF])(${escapeStr(from)})(?![_$a-zA-Z0-9\\xA0-\\uFFFF])(?!\\.)(?!\\s*=[^=])`,
        "g",
      );
    }
    replaceFromCache.set(from, regex);
  }

  return regex;
};

/**
 * Replace strings.
 * @param {MagicString} ms - MagicString instance to modify
 * @param {Record<string, any>} replacements - Replacement key-value pairs
 */
export function replace(ms: MagicString, replacements: Record<string, any> = {}): void {
  const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    const search = getReplaceRegex(key);
    const replacement = replacements[key];
    ms.replaceAll(search, String(replacement));
  }
}
