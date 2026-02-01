import type { KebabCase } from "src/types";
import type { ReactiveCSSStyleDeclaration, ReactiveValue } from "../../element";
import { camelToKebab } from "../../util/string";
import { type CaseProxyOptions, createCaseProxy } from "./case-proxy";
import { flattenStyleObject, parseStyleString } from "./render-utils";

const styleToKebab = (str: string): string => {
  const kebab = camelToKebab(str);
  if (kebab.startsWith("webkit-") || kebab.startsWith("moz-") || kebab.startsWith("ms-")) {
    return `-${kebab}`;
  }
  return kebab;
};

export function createStyleProxy<
  S extends { [K in KebabCase<keyof CSSStyleDeclaration & string>]: ReactiveValue<string> } = {
    [K in KebabCase<keyof CSSStyleDeclaration & string>]: ReactiveValue<string>;
  } & ReactiveCSSStyleDeclaration,
>(options: CaseProxyOptions<S> = {}) {
  const result = createCaseProxy<ReactiveCSSStyleDeclaration, S>({
    ...options,
    serialize: (s) => flattenStyleObject(s as Record<string, string>),
    parse: (v) => parseStyleString(v) as S,
    toKebab: styleToKebab,
  });

  const styleProxy = new Proxy(result.proxy, {
    get(target, prop) {
      if (prop === "setProperty") {
        return (p: string, v: string) => {
          target[p as any] = v;
        };
      }
      if (prop === "getPropertyValue") {
        return (p: string) => target[p as any] || "";
      }
      if (prop === "removeProperty") {
        return (p: string) => {
          delete target[p as any];
        };
      }
      if (prop === "toString") {
        return () => result.toString();
      }
      return target[prop as any];
    },
    set(target, prop, value) {
      target[prop as any] = value;
      return true;
    },
  });

  return {
    ...result,
    proxy: styleProxy as CSSStyleDeclaration,
  };
}
