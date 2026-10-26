/*
 * Portions of this file are based on code from Kobalte.
 * MIT License, Copyright 2024 jer3m01 jer3m01@jer3m01.com
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-tag-name/create-tag-name.ts
 */
import {
  type DerivedValue,
  isRef,
  mergeValues,
  type Ref,
  SeidrError,
  type Value,
  wrapValue,
} from "@fimbul-works/seidr";

/**
 * Returns a reactive `Value<string | undefined>` holding the lowercase tag name
 * of an observed element Ref, with an optional fallback.
 */
export function useTagName<T extends HTMLElement = HTMLElement>(
  ref: Ref<T>,
  fallback?: string | Value<string | undefined>,
): DerivedValue<string | undefined> {
  if (!isRef(ref)) {
    throw new SeidrError("Invalid Ref");
  }

  fallback = wrapValue(fallback, { hydrate: false });
  return mergeValues(() => ref()?.tagName?.toLowerCase() ?? fallback(), { parents: [ref, fallback] });
}
