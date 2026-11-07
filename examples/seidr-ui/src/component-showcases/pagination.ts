import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $p, $section, $span, $strong } from "@fimbul-works/seidr/html";
import { createPagination, Pagination } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./pagination.css";

export const PaginationShowcase = createComponent(() => {
  // Demo 2: Controlled Active Page
  const currentPage = createValue(5);

  // Demo 3: Fine-grained sculpted layout (Tier 2)
  const customPg = createPagination({
    count: 8,
    defaultPage: 3,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Pagination"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible multi-page navigation component (<nav aria-label='Pagination'>) with automatic ellipsis collapsing, sibling window calculation, and previous/next stepper controls.",
    ),

    // Live Previews
    $div({ className: "preview-box" }, [
      $div({ className: "pagination-showcase" }, [
        // 1. Standard Pagination with Ellipsis
        $div({ className: "pagination-card" }, [
          $span({ className: "pagination-heading" }, "1. Standard Uncontrolled Pagination (10 Pages)"),
          $span(
            { className: "pagination-hint" },
            "Automatically calculates visible pages and collapses skipped ranges with ellipsis.",
          ),
          Pagination({
            count: 10,
            defaultPage: 1,
          }),
        ]),

        // 2. Controlled Active Page with Live Readout
        $div({ className: "pagination-card" }, [
          $span({ className: "pagination-heading" }, "2. Controlled Page with Live Readout & 2 Siblings"),
          $span(
            { className: "pagination-hint" },
            "Binds to a reactive Value<number> with siblingCount=2 to show a wider page window.",
          ),
          Pagination({
            count: 20,
            page: currentPage,
            siblingCount: 2,
            onPageChange: (p) => currentPage(p),
          }),
          $div({ className: "pagination-readout" }, [
            $span({}, "Active Page: "),
            $strong(
              {},
              currentPage.as((p) => String(p)),
            ),
          ]),
        ]),

        // 3. Fine-Grained Composition (createPagination)
        $div({ className: "pagination-card" }, [
          $span({ className: "pagination-heading" }, "3. Custom Sculpted Layout (createPagination)"),
          $span(
            { className: "pagination-hint" },
            "Fine-grained DOM structure using pre-bound compound element helpers.",
          ),
          customPg.Root({}, [
            customPg.List({}, [customPg.Previous({}, "‹ Prev"), customPg.Items(), customPg.Next({}, "Next ›")]),
          ]),
        ]),

        // 4. Disabled Pagination
        $div({ className: "pagination-card" }, [
          $span({ className: "pagination-heading" }, "4. Disabled State"),
          $span({ className: "pagination-hint" }, "Disables all item buttons and steppers."),
          Pagination({
            count: 6,
            defaultPage: 3,
            disabled: true,
          }),
        ]),
      ]),
    ]),

    // Usage Examples
    $div({ className: "code-box" }, [
      CodeBlock({
        language: "typescript",
        code: `import { createPagination, Pagination } from "@fimbul-works/seidr-ui";

// 1. All-in-One Component (Tier 1)
Pagination({
  count: 10,
  defaultPage: 1,
  onPageChange: (page) => console.log("Selected page:", page),
});

// 2. Fine-Grained Coordinator Pattern (Tier 2)
const pg = createPagination({ count: 8, defaultPage: 1 });

pg.Root({}, [
  pg.List({}, [
    pg.Previous({}, "‹"),
    pg.Items(),
    pg.Next({}, "›"),
  ]),
]);`,
      }),
    ]),
  ]);
});
