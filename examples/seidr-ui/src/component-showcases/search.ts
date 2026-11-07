import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createSearch, Search, type SearchItemData } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./search.css";

const ALL_PACKAGES: SearchItemData[] = [
  { value: "seidr-core", label: "@fimbul-works/seidr", description: "Fine-grained reactive UI library" },
  { value: "seidr-ui", label: "@fimbul-works/seidr-ui", description: "Accessible headless component primitives" },
  { value: "seidr-router", label: "@fimbul-works/seidr-router", description: "Type-safe client-side router" },
  { value: "hvat", label: "@fimbul-works/hvat", description: "High-performance utility functions" },
  { value: "futhark", label: "@fimbul-works/futhark", description: "Reactive functional state operators" },
  { value: "typescript", label: "typescript", description: "Typed JavaScript at Any Scale" },
  { value: "vite", label: "vite", description: "Next Generation Frontend Tooling" },
  { value: "vitest", label: "vitest", description: "Next generation testing framework" },
];

export const SearchShowcase = createComponent(() => {
  // Reactive selected states
  const selectedPackage = createValue<string>("");
  const customSelected = createValue<string>("seidr-ui");

  // Dynamic async search options
  const searchResults = createValue<SearchItemData[]>(ALL_PACKAGES);

  // Simulated async debounced fetch
  const handleQueryChange = async (query: string) => {
    const q = query.trim().toLowerCase();
    // Simulate brief network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!q) {
      searchResults(ALL_PACKAGES);
    } else {
      searchResults(
        ALL_PACKAGES.filter(
          (pkg) =>
            (typeof pkg.label === "string" && pkg.label.toLowerCase().includes(q)) ||
            (pkg.description && String(pkg.description).toLowerCase().includes(q)),
        ),
      );
    }
  };

  // Tier 2 Fine-Grained Coordinator
  const customSearch = createSearch({
    id: "fine-grained-search",
    options: ALL_PACKAGES,
    value: customSelected,
    onChange: (val) => customSelected(val ?? ""),
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Search"),
      $span({ className: "card-badge" }, "Form"),
    ]),
    $p(
      { className: "card-desc" },
      "An asynchronous, searchable combobox with debounced query dispatch, loading spinner indicators, empty result fallbacks, and full WAI-ARIA combobox semantics.",
    ),

    // Live Preview Box
    $div({ className: "preview-box" }, [
      $div({ className: "search-showcase" }, [
        // Section 1: All-in-One Component (Tier 1)
        $div({ className: "search-section-box" }, [
          $h3({ className: "search-heading" }, "1. All-in-One Search with Debounce & Loading"),
          Search({
            id: "pkg-search",
            label: "Find Package",
            placeholder: "Type to search packages...",
            options: searchResults,
            debounceOptionsMillisecond: 250,
            onInputChange: handleQueryChange,
            loadingIndicator: $span({ className: "search-spinner" }),
            noResult: "No matching packages found.",
            onChange: (val) => selectedPackage(val ?? ""),
          }),
          $p({ className: "search-value-text" }, [
            "Selected: ",
            $span(
              { style: "color: hsl(210, 100%, 70%); font-weight: 600;" },
              selectedPackage.as((v) => v || "None"),
            ),
          ]),
        ]),

        // Section 2: Fine-Grained Coordinator (Tier 2)
        $div({ className: "search-section-box" }, [
          $h3({ className: "search-heading" }, "2. Fine-Grained Coordinator (Tier 2)"),
          customSearch.Root({}, [
            customSearch.Label({}, "Custom Search Query"),
            customSearch.Control({}, [
              customSearch.Input({ placeholder: "Search fine-grained..." }),
              customSearch.Trigger({}, [customSearch.Icon({}, "🔍")]),
            ]),
            customSearch.Content({}, [
              customSearch.Listbox({}, [
                customSearch.NoResult({}, "Nothing matched."),
                customSearch.List(customSearch.displayedOptions),
              ]),
            ]),
          ]),
          $p({ className: "search-value-text" }, [
            "Active: ",
            $span(
              { style: "color: hsl(210, 100%, 70%); font-weight: 600;" },
              customSelected.as((v) => v || "None"),
            ),
          ]),
        ]),
      ]),
    ]),

    // Code Examples
    $div({ className: "card-section" }, [
      $h3({ className: "card-section-title" }, "Usage Examples"),
      CodeBlock({
        language: "typescript",
        code: `import { Search, createSearch } from "@fimbul-works/seidr-ui";

// Tier 1: All-in-One Component with Async Debounce
Search({
  label: "Search Libraries",
  placeholder: "Search npm...",
  options: searchResults,
  debounceOptionsMillisecond: 300,
  onInputChange: async (query) => {
    const res = await fetch(\`/api/search?q=\${query}\`);
    searchResults(await res.json());
  },
  loadingIndicator: $span({ className: "spinner" }),
  noResult: "No matching results.",
  onChange: (val) => console.log("Selected:", val),
});

// Tier 2: Fine-Grained Coordinator
const search = createSearch({ options: myOptions });

search.Root({}, [
  search.Label({}, "Search"),
  search.Control({}, [
    search.Input({ placeholder: "Filter..." }),
    search.Trigger({}, [search.Icon()]),
  ]),
  search.Content({}, [
    search.Listbox({}, [
      search.NoResult({}, "No results found"),
      search.List(search.displayedOptions),
    ]),
  ]),
]);`,
      }),
    ]),
  ]);
});

