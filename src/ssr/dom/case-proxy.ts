import type { ReactiveValue } from "../../element/types";
import { unwrapSeidr } from "../../seidr";
import {
  camelToKebab as defaultCamelToKebab,
  kebabToCamel as defaultKebabToCamel,
  isCamelCase,
  isKebabCase,
} from "../../util";

/**
 * The options for the case proxy.
 */
export interface CaseProxyOptions<S extends Record<string, ReactiveValue<any>>> {
  prefix?: string;
  dropPrefix?: boolean;
  storage?: S;
  onUpdate?: (key: string, value: any) => void;
  serialize?: (storage: S) => string;
  parse?: (value: string) => S;
  escapeKeyValue?: (key: string, value: any) => string;
  toKebab?: (str: string) => string;
  toCamel?: (str: string) => string;
}

/**
 * Case proxy result.
 *
 */
export interface CaseProxyResult<
  T extends Record<string, ReactiveValue<any>>,
  S extends Record<string, ReactiveValue<any>>,
> {
  proxy: T;
  storage: S;
  toString(): string;
  fromString(value: string): void;
}

/**
 * Creates a proxy that maps camelCase property access to kebab-case storage.
 * Useful for dataset (data-*), aria (aria-*), and style attributes.
 */
export function createCaseProxy<
  T extends Record<string, ReactiveValue<any>>,
  S extends Record<string, ReactiveValue<any>>,
>(options: CaseProxyOptions<S> = {}): CaseProxyResult<T, S> {
  const {
    prefix = "",
    dropPrefix = false,
    storage = {} as S,
    onUpdate,
    serialize,
    parse,
    escapeKeyValue,
    toKebab = defaultCamelToKebab,
    toCamel = defaultKebabToCamel,
  } = options;

  let result: CaseProxyResult<T, S>;

  const getStorageKey = <SK extends keyof S & string = keyof S & string>(prop: string): SK => {
    if (prop === "className") return `${prefix}class` as SK;

    const isCamel = isCamelCase(prop);
    const isKebab = isKebabCase(prop);

    if (!isCamel && !isKebab) {
      // Allow internal/symbol-like properties (starts with $ or _)
      // or common vitest/node properties like 'constructor', 'toJSON', etc.
      if (prop.startsWith("$") || prop.startsWith("_") || prop === "constructor" || prop === "toJSON") {
        return prop as SK;
      }
      // For anything else, return a special key that won't exist in storage
      // but don't throw, as it crashes Vitest's pretty-print/inspect
      return `__invalid__${prop}` as SK;
    }

    // If it already matches the storage format (has prefix and is kebab)
    if (prefix && prop.startsWith(prefix) && isKebab) return prop as SK;

    // Convert to kebab-case
    const kebab = toKebab(prop);

    // If it's already a valid storage key with prefix
    if (prefix && kebab.startsWith(prefix)) return kebab as SK;

    // If we're using a prefix but the property was accessed without it (typical for dataset/aria)
    return (prefix + kebab) as SK;
  };

  const getPublicPath = (key: string): string => {
    const rawKey = prefix && key.startsWith(prefix) ? (dropPrefix ? key.slice(prefix.length) : key) : key;
    if (rawKey === "class") return "className";
    return toCamel(rawKey);
  };

  const proxy = new Proxy({} as T, {
    get(_, prop) {
      if (prop === "toString") return result.toString;
      if (typeof prop !== "string") return undefined;
      const key = getStorageKey(prop);
      return storage[key];
    },
    set(_, prop, value) {
      if (typeof prop !== "string") return false;
      const key = getStorageKey(prop);
      storage[key] = value;
      onUpdate?.(key, value);
      return true;
    },
    deleteProperty(_, prop) {
      if (typeof prop !== "string") return false;
      const key = getStorageKey(prop);
      if (key in storage) {
        delete storage[key];
        onUpdate?.(key, undefined);
        return true;
      }
      return false;
    },
    ownKeys() {
      return Object.keys(storage)
        .filter((k) => k.startsWith(prefix))
        .map((k) => getPublicPath(k));
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop !== "string") return undefined;
      const key = getStorageKey(prop);
      if (key in storage) {
        return {
          enumerable: true,
          configurable: true,
          value: storage[key],
        };
      }
      return undefined;
    },
    has(_, prop) {
      if (typeof prop !== "string") return false;
      const key = getStorageKey(prop);
      return key in storage;
    },
  });

  result = {
    proxy,
    storage,
    toString() {
      if (serialize) return serialize(storage);

      const parts: string[] = [];
      const keys = Object.keys(storage).sort();
      for (const key of keys) {
        const value = storage[key];
        if (prefix && !key.startsWith(prefix)) continue;

        const resolved = unwrapSeidr(value);
        if (resolved == null || resolved === false) continue;

        if (resolved === true) {
          parts.push(key);
        } else {
          const escaped = escapeKeyValue ? escapeKeyValue(key, resolved) : String(resolved);
          parts.push(`${key}="${escaped}"`);
        }
      }
      return parts.join(" ");
    },
    fromString(value: string) {
      if (parse) {
        const parsed = parse(value);
        // Clear existing keys belonging to this proxy
        Object.keys(storage).forEach((k) => {
          if (k.startsWith(prefix)) {
            delete storage[k];
          }
        });
        // Apply new values
        Object.entries(parsed).forEach(([k, v]) => {
          (storage as any)[k] = v;
        });
        // We don't call onUpdate for every key here as it might be expensive
        // but individual logic can be added if needed.
        onUpdate?.(prefix, value);
      }
    },
  };

  return result;
}
