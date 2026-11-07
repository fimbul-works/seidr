import { createValue, type DerivedValue, onUnmounted, type Value } from "@fimbul-works/seidr";
import { useCombobox } from "../combobox/use-combobox.js";
import type { UseSearchOptions, UseSearchResult } from "./types.js";

/**
 * Headless state and logic coordinator for the Search component.
 * Specializes Combobox for external / async queries with debounced callbacks.
 */
export function useSearch<Option = any, OptGroup = any>(
  options: UseSearchOptions<Option, OptGroup>,
): UseSearchResult<Option> {
  const isLoadingSuggestions: Value<boolean> = createValue<boolean>(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const handleDebouncedInputChange = (val: string) => {
    if (options.onInputChange === undefined) return;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    const ms = options.debounceOptionsMillisecond ?? 0;
    if (ms <= 0) {
      isLoadingSuggestions(true);
      try {
        const res = options.onInputChange(val);
        if (res && typeof (res as Promise<void>).then === "function") {
          (res as Promise<void>).finally(() => {
            isLoadingSuggestions(false);
          });
        } else {
          isLoadingSuggestions(false);
        }
      } catch (err) {
        isLoadingSuggestions(false);
        throw err;
      }
    } else {
      isLoadingSuggestions(true);
      debounceTimer = setTimeout(async () => {
        try {
          await options.onInputChange?.(val);
        } finally {
          isLoadingSuggestions(false);
        }
      }, ms);
    }
  };

  onUnmounted(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  });

  const combobox = useCombobox<Option, OptGroup>({
    ...options,
    // By default Search allows opening when collection is empty to display NoResult
    allowsEmptyCollection: options.allowsEmptyCollection ?? true,
    // External filtering: client-side filter accepts all items provided in options
    defaultFilter: () => true,
    onInputChange: handleDebouncedInputChange,
  });

  const noResult: DerivedValue<boolean> = combobox.allOptions.as((opts) => opts.length === 0);

  return {
    ...combobox,
    isLoadingSuggestions,
    noResult,
  };
}
