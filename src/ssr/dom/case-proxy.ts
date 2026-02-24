import type { ReactiveValue } from "../../element";
import { unwrapSeidr } from "../../seidr/unwrap-seidr";
import { SeidrError } from "../../types";
import { camelToKebab, kebabToCamel } from "../../util/string";
import { isEmpty, isStr } from "../../util/type-guards/primitive-types";

/**
 * The options for the case proxy.
 */
export interface CaseProxyOptions<S extends Record<string, ReactiveValue<any>>> {
  /**
   * The prefix to use for the storage keys.
   */
  prefix?: string;
  /**
   * Whether to omit the prefix from the storage keys.
   */
  dropPrefix?: boolean;
  /**
   * The storage object.
   */
  storage?: S;
  /**
   * The callback to call when the storage is updated.
   */
  onUpdate?: (key: string, value: any) => void;
  /**
   * The function to use to serialize the storage.
   */
  serialize?: (storage: S) => string;
  /**
   * The function to use to parse the storage.
   */
  parse?: (value: string) => S;
  /**
   * The function to use to escape the key-value pairs.
   */
  escapeKeyValue?: (key: string, value: any) => string;
}

/**
 * Case proxy.
 */
export interface CaseProxy<T extends Record<string, ReactiveValue<any>>, S extends Record<string, ReactiveValue<any>>> {
  /**
   * The proxy object.
   */
  proxy: T;
  /**
   * The storage object.
   */
  storage: S;
  /**
   * Convert the storage to a string.
   */
  toString(): string;
  /**
   * Convert a string to the storage.
   */
  fromString(value: string): void;
}

/**
 * Creates a proxy that maps camelCase property access to kebab-case storage.
 * Useful for dataset (data-*), aria (aria-*), and style attributes.
 *
 * @template T The type of the proxy object
 * @template S The type of the storage object
 * @param {CaseProxyOptions<S>} options The options for the case proxy
 * @returns {CaseProxy<T, S>} The case proxy
 */
export function createCaseProxy<
  T extends Record<string, ReactiveValue<any>>,
  S extends Record<string, ReactiveValue<any>>,
>(options: CaseProxyOptions<S> = {}): CaseProxy<T, S> {
  const { prefix = "", dropPrefix = false, storage = {} as S, onUpdate, serialize, parse, escapeKeyValue } = options;

  const getStorageKey = <SK extends keyof S & string = keyof S & string>(prop: string): SK => {
    if (prop === "className") return `${prefix}class` as SK;

    // Allow internal/symbol-like properties (starts with $ or _)
    // or common vitest/node properties like 'constructor', 'toJSON', etc.
    if (prop.startsWith("$") || prop.startsWith("_") || prop === "constructor" || prop === "toJSON") {
      return prop as SK;
    }

    // Convert to kebab-case
    const kebab = camelToKebab(prop);

    // If it already matches the storage format (has prefix and is kebab-like)
    if (prefix && prop.startsWith(prefix)) return prop as SK;

    // If it's already a valid storage key with prefix after conversion
    if (prefix && kebab.startsWith(prefix)) return kebab as SK;

    // If we're using a prefix but the property was accessed without it (typical for dataset/aria)
    return (prefix + kebab) as SK;
  };

  const getPublicPath = (key: string): string => {
    const rawKey = prefix && key.startsWith(prefix) ? (dropPrefix ? key.slice(prefix.length) : key) : key;
    if (rawKey === "class") return "className";
    return kebabToCamel(rawKey);
  };

  const proxy = new Proxy({} as T, {
    has(_, prop) {
      if (!isStr(prop)) return false;
      const key = getStorageKey(prop);
      return key in storage;
    },
    get(_, prop) {
      if (prop === "toString") return caseProxy.toString;
      if (!isStr(prop)) return undefined;
      const key = getStorageKey(prop);
      return storage[key];
    },
    set(_, prop, value) {
      if (!isStr(prop)) return false;
      const key = getStorageKey(prop);
      storage[key] = value;
      onUpdate?.(key, value);
      return true;
    },
    deleteProperty(_, prop) {
      if (!isStr(prop)) return false;
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
      if (!isStr(prop)) return undefined;
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
  });

  const caseProxy: CaseProxy<T, S> = {
    proxy,
    storage,
    toString() {
      if (serialize) {
        return serialize(storage);
      }

      const keys = Object.keys(storage).sort();
      const parts: string[] = [];
      for (const key of keys) {
        if (prefix && !key.startsWith(prefix)) {
          continue;
        }

        // Handle reactive values
        const value = unwrapSeidr(storage[key]);
        if (isEmpty(value) || value === false) {
          continue;
        }

        // Handle boolean attributes
        if (value === true) {
          parts.push(key);
        } else {
          parts.push(`${key}="${escapeKeyValue ? escapeKeyValue(key, value) : String(value)}"`);
        }
      }

      return parts.join(" ");
    },
    fromString(value: string): void {
      if (!parse) {
        throw new SeidrError("No parse function provided");
      }

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
    },
  };

  return caseProxy;
}
