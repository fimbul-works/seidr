/*
 * Portions of this file are based on code from Kobalte.
 * MIT License, Copyright 2024 jer3m01 jer3m01@jer3m01.com
 *
 * Credits to the Kobalte team:
 * https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-tag-name/create-tag-name.ts
 */
import { isRef, mergeValues, type Ref, SeidrError, unwrapValue, type Value, wrapValue } from "@fimbul-works/seidr";

/**
 * Returns a reactive `Value<string | undefined>` holding the lowercase tag name
 * of an observed element Ref, with an optional fallback.
 */
export function useTagName<T extends HTMLElement = HTMLElement>(
  ref: Ref<T>,
  fallback?: string | Value<string | undefined>,
): Value<string | undefined> {
  if (!isRef(ref)) {
    throw new SeidrError("Invalid Ref");
  }
  fallback = wrapValue(fallback);
  return mergeValues(() => ref()?.tagName ?? fallback(), { parents: [ref, fallback] });
}
