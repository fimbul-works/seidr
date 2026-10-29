import { useId, wrapValue } from "@fimbul-works/seidr";
import type { UseBreadcrumbsOptions, UseBreadcrumbsResult } from "./types.js";

/**
 * Headless state coordinator for an accessible WAI-ARIA Breadcrumbs hierarchy.
 *
 * @param {UseBreadcrumbsOptions} [options={}] - Configuration options
 * @returns {UseBreadcrumbsResult} Coordinator instance
 */
export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}): UseBreadcrumbsResult {
  const { id: customId, separator = "/", ariaLabel = "Breadcrumbs" } = options;

  const id = customId ?? useId("breadcrumbs");
  const separatorObservable = wrapValue(separator);
  const ariaLabelObservable = wrapValue(ariaLabel);

  return {
    id,
    separator: separatorObservable,
    ariaLabel: ariaLabelObservable,
    dataset: {
      "data-component": "breadcrumbs",
    },
  };
}
