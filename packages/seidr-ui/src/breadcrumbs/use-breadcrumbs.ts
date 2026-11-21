import { useId } from "@fimbul-works/seidr";
import type { UseBreadcrumbsOptions, UseBreadcrumbsResult } from "./types.js";

/**
 * Headless state coordinator for an accessible WAI-ARIA Breadcrumbs hierarchy.
 *
 * @param {UseBreadcrumbsOptions} [options={}] - Configuration options
 * @returns {UseBreadcrumbsResult} Coordinator instance
 */
export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}): UseBreadcrumbsResult {
  const { id, separator = "/", ariaLabel = "Breadcrumbs" } = options;

  return {
    id: id ?? useId("Breadcrumbs"),
    separator,
    ariaLabel,
  };
}
