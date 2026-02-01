import { unwrapSeidr } from "../../seidr";
import { escapeHTML } from "../../util/html";
import {
  camelToKebab as defaultCamelToKebab,
  kebabToCamel as defaultKebabToCamel,
  isCamelCase,
  isKebabCase,
} from "../../util/string";

/**
 * The options for the case proxy.
 *
 * @property {string} prefix The prefix for the storage keys.
 * @property {boolean} dropPrefix Whether to drop the prefix from the public path.
 * @property {Record<string, any>} storage The storage for the case proxy.
 * @method onUpdate Callback function to be called when a property is updated.
 * @method serialize Function to serialize the storage to a string.
 * @method parse Function to parse a string to the storage.
 * @method escapeKeyValue Function to escape a key-value pair.
 * @method toKebab Function to convert a string to kebab-case.
 * @method toCamel Function to convert a string to camelCase.
 */
export interface CaseProxyOptions {
  prefix?: string;
  dropPrefix?: boolean;
  storage?: Record<string, any>;
  onUpdate?: (key: string, value: any) => void;
  serialize?: (storage: Record<string, any>) => string;
  parse?: (value: string) => Record<string, any>;
  escapeKeyValue?: (key: string, value: any) => string;
  toKebab?: (str: string) => string;
  toCamel?: (str: string) => string;
}

/**
 * Case proxy result.
 *
 * @template {Record<string, any>} T The type of the case proxy
 * @property {T} proxy The proxy for the case proxy.
 * @property {Record<string, any>} storage The storage for the case proxy.
 * @method toString Converts the case proxy to a string.
 * @method fromString Converts a string to the case proxy.
 */
export interface CaseProxyResult<T extends Record<string, any>> {
  proxy: T;
  storage: Record<string, any>;
  toString(): string;
  fromString(value: string): void;
}

/**
 * Creates a proxy that maps camelCase property access to kebab-case storage.
 * Useful for dataset (data-*), aria (aria-*), and style attributes.
 */
export function createCaseProxy<T extends Record<string, any>>(options: CaseProxyOptions = {}): CaseProxyResult<T> {
  const {
    prefix = "",
    dropPrefix = false,
    storage = {},
    onUpdate,
    serialize,
    parse,
    escapeKeyValue,
    toKebab = defaultCamelToKebab,
    toCamel = defaultKebabToCamel,
  } = options;

  let result: CaseProxyResult<T>;

  const getStorageKey = (prop: string): string => {
    if (prop === "className") return `${prefix}class`;

    const isCamel = isCamelCase(prop);
    const isKebab = isKebabCase(prop);

    if (!isCamel && !isKebab) {
      throw new Error(`Invalid property name: "${prop}". Must be camelCase or kebab-case.`);
    }

    // If it already matches the storage format (has prefix and is kebab)
    if (prefix && prop.startsWith(prefix) && isKebab) return prop;

    // Convert to kebab-case
    const kebab = toKebab(prop);

    // If it's already a valid storage key with prefix
    if (prefix && kebab.startsWith(prefix)) return kebab;

    // If we're using a prefix but the property was accessed without it (typical for dataset/aria)
    return prefix + kebab;
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
      for (const [key, value] of Object.entries(storage)) {
        if (prefix && !key.startsWith(prefix)) continue;

        const resolved = unwrapSeidr(value);
        if (resolved == null || resolved === false) continue;

        if (resolved === true) {
          parts.push(key);
        } else {
          const escaped = escapeKeyValue ? escapeKeyValue(key, resolved) : escapeHTML(String(resolved));
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
          storage[k] = v;
        });
        // We don't call onUpdate for every key here as it might be expensive
        // but individual logic can be added if needed.
        onUpdate?.(prefix, value);
      }
    },
  };

  return result;
}
