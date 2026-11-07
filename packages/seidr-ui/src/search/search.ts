import { createComponent, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { createSearch } from "./create-search.js";
import type { SearchProps } from "./types.js";

/**
 * All-in-one headless Search component (Tier 1).
 *
 * Automatically provides accessible search markup, debounced async callbacks,
 * loading indicator, empty results fallback, and hidden `<select>` form integration.
 */
export const Search = createComponent(function Search<Option = any, OptGroup = any>(
  props: SearchProps<Option, OptGroup>,
): SeidrElementTagNameMap["div"] {
  const {
    label,
    description,
    errorMessage,
    indicator,
    loadingIndicator,
    noResult,
    inputProps,
    triggerProps,
    controlProps,
    contentProps,
    listboxProps,
    rootProps,
    hiddenSelectProps,
    itemProps,
    ...options
  } = props;

  const search = createSearch(options);

  const indicatorChild = search.Indicator(
    { loadingComponent: loadingIndicator },
    indicator ?? search.Icon(),
  );

  const children: (SeidrChild | null)[] = [
    label !== undefined ? search.Label({}, label) : null,
    search.Control(
      controlProps,
      [
        search.Input(inputProps),
        search.Trigger(triggerProps, [indicatorChild]),
      ],
    ),
    search.Content(
      contentProps,
      [
        search.Listbox(
          listboxProps,
          [
            noResult !== undefined ? search.NoResult({}, noResult) : null,
            search.List(search.displayedOptions, { indicator, itemProps }),
          ].filter(Boolean),
        ),
      ],
    ),
    description !== undefined ? search.Description({}, description) : null,
    errorMessage !== undefined ? search.ErrorMessage({}, errorMessage) : null,
    search.HiddenSelect(hiddenSelectProps),
  ];

  return search.Root(rootProps, children.filter((c): c is SeidrChild => c !== null));
}, "Search");

