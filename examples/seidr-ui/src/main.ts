import { createComponent, createValue, mount } from "@fimbul-works/seidr";
import {
  $button,
  $div,
  $h1,
  $h2,
  $h3,
  $header,
  $main,
  $p,
  $pre,
  $section,
  $span,
} from "@fimbul-works/seidr/html";
import {
  Alert,
  Badge,
  Separator,
  Skeleton,
  useColorMode,
} from "@fimbul-works/seidr-ui";

const App = createComponent(() => {
  // Color mode (dark / light / system)
  const { mode, resolvedMode } = useColorMode({
    initialValue: "dark",
    attribute: "data-theme",
  });

  const toggleTheme = () => {
    mode(resolvedMode() === "dark" ? "light" : "dark");
  };

  // Skeleton interactive state
  const isSkeletonLoaded = createValue(false);
  const isSkeletonAnimated = createValue(true);

  // Alert interactive severity
  const alertSeverity = createValue<"info" | "warning" | "error">("info");

  return $div({ className: "layout" }, [
    // Header
    $header({ className: "header" }, [
      $div({ className: "header-title-group" }, [
        $h1("Seidr UI"),
        $p(
          { className: "header-subtitle" },
          "Headless, accessible UI primitives for Seidr applications",
        ),
      ]),
      $div({ className: "header-actions" }, [
        $button(
          {
            className: "btn-theme",
            onclick: toggleTheme,
          },
          resolvedMode.as((m) => (m === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode")),
        ),
      ]),
    ]),

    // Main Component Grid
    $main({ className: "section-grid" }, [
      // 1. Alert Showcase
      $section({ className: "card" }, [
        $div({ className: "card-header" }, [
          $h2({ className: "card-title" }, "Alert"),
          $span({ className: "card-badge" }, "Atom"),
        ]),
        $p(
          { className: "card-desc" },
          "Displays an urgent, accessible notice using role=\"alert\" to inform users without interrupting their flow.",
        ),
        // Live Preview
        $div({ className: "preview-box" }, [
          $div({ className: "controls-row" }, [
            $span({ style: { fontSize: "0.85rem", color: "var(--fg-muted)" } }, "Severity:"),
            $button(
              {
                className: alertSeverity.as((s) => `control-btn ${s === "info" ? "active" : ""}`),
                onclick: () => alertSeverity("info"),
              },
              "Info",
            ),
            $button(
              {
                className: alertSeverity.as((s) => `control-btn ${s === "warning" ? "active" : ""}`),
                onclick: () => alertSeverity("warning"),
              },
              "Warning",
            ),
            $button(
              {
                className: alertSeverity.as((s) => `control-btn ${s === "error" ? "active" : ""}`),
                onclick: () => alertSeverity("error"),
              },
              "Error",
            ),
          ]),
          Alert(
            {
              className: alertSeverity.as((s) => `alert-demo ${s}`),
            },
            alertSeverity.as((s) => {
              if (s === "warning") return "⚠️ Warning: Storage is reaching 90% capacity.";
              if (s === "error") return "⛔ Error: Failed to synchronize latest changes with server.";
              return "ℹ️ Notice: Scheduled maintenance will begin at midnight UTC.";
            }),
          ),
        ]),
        // Code Documentation
        $pre(
          { className: "code-block" },
          `import { Alert } from "@fimbul-works/seidr-ui";

// Basic usage
Alert("Scheduled maintenance at midnight");

// With props and custom severity
Alert({ className: "alert warning" }, "Storage almost full");`,
        ),
      ]),

      // 2. Badge Showcase
      $section({ className: "card" }, [
        $div({ className: "card-header" }, [
          $h2({ className: "card-title" }, "Badge"),
          $span({ className: "card-badge" }, "Atom"),
        ]),
        $p(
          { className: "card-desc" },
          "Small status indicator with role=\"status\" and optional textValue for screen-reader clarity.",
        ),
        // Live Preview
        $div({ className: "preview-box" }, [
          $div({ style: { display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" } }, [
            Badge({ className: "badge-demo" }, "Default"),
            Badge({ className: "badge-demo success" }, "Active"),
            Badge({ className: "badge-demo danger", textValue: "3 unresolved issues" }, "3"),
            Badge({ as: "div", className: "badge-demo" }, "Custom Div Tag"),
          ]),
        ]),
        // Code Documentation
        $pre(
          { className: "code-block" },
          `import { Badge } from "@fimbul-works/seidr-ui";

// Status badge
Badge({ className: "badge success" }, "Active");

// Badge with accessible label for icon or number counts
Badge({ textValue: "3 unread messages" }, "3");`,
        ),
      ]),

      // 3. Separator Showcase
      $section({ className: "card" }, [
        $div({ className: "card-header" }, [
          $h2({ className: "card-title" }, "Separator"),
          $span({ className: "card-badge" }, "Atom"),
        ]),
        $p(
          { className: "card-desc" },
          "Accessible horizontal or vertical divider. Defaults to native <hr>; non-hr elements receive role=\"separator\".",
        ),
        // Live Preview
        $div({ className: "preview-box" }, [
          $div({ style: { display: "flex", flexDirection: "column", gap: "0.75rem" } }, [
            $span({ style: { fontSize: "0.875rem" } }, "Horizontal Separator:"),
            Separator({ className: "separator-demo", orientation: "horizontal" }),
            $span({ style: { fontSize: "0.875rem" } }, "Inline / Vertical Separator:"),
            $div({ style: { display: "flex", alignItems: "center", gap: "1rem" } }, [
              $span("Home"),
              Separator({ as: "div", className: "separator-demo", orientation: "vertical" }),
              $span("Components"),
              Separator({ as: "div", className: "separator-demo", orientation: "vertical" }),
              $span("Showcase"),
            ]),
          ]),
        ]),
        // Code Documentation
        $pre(
          { className: "code-block" },
          `import { Separator } from "@fimbul-works/seidr-ui";

// Horizontal divider (renders <hr>)
Separator();

// Vertical divider (renders <div role="separator" data-orientation="vertical">)
Separator({ as: "div", orientation: "vertical" });`,
        ),
      ]),

      // 4. Skeleton Showcase
      $section({ className: "card" }, [
        $div({ className: "card-header" }, [
          $h2({ className: "card-title" }, "Skeleton"),
          $span({ className: "card-badge" }, "Atom"),
        ]),
        $p(
          { className: "card-desc" },
          "Animated placeholder placeholder while content is loading with aria-busy and data attributes.",
        ),
        // Live Preview
        $div({ className: "preview-box" }, [
          $div({ className: "controls-row" }, [
            $button(
              {
                className: isSkeletonLoaded.as((l) => `control-btn ${l ? "active" : ""}`),
                onclick: () => isSkeletonLoaded(!isSkeletonLoaded()),
              },
              isSkeletonLoaded.as((l) => (l ? "Show Skeleton" : "Simulate Data Loaded")),
            ),
            $button(
              {
                className: isSkeletonAnimated.as((a) => `control-btn ${a ? "active" : ""}`),
                onclick: () => isSkeletonAnimated(!isSkeletonAnimated()),
              },
              isSkeletonAnimated.as((a) => (a ? "Disable Animation" : "Enable Animation")),
            ),
          ]),
          // Content or Skeleton
          $div({ style: { minHeight: "90px", display: "flex", alignItems: "center" } }, [
            isSkeletonLoaded.as((loaded) =>
              loaded
                ? $div({ style: { display: "flex", gap: "1rem", alignItems: "center" } }, [
                    $div(
                      {
                        style: {
                          width: "48px",
                          height: "48px",
                          borderRadius: "9999px",
                          background: "linear-gradient(135deg, #6366f1, #a855f7)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold",
                        },
                      },
                      "CN",
                    ),
                    $div([
                      $h3({ style: { fontSize: "1rem", fontWeight: "600" } }, "Claus Nuoskanen"),
                      $p({ style: { fontSize: "0.85rem", color: "var(--fg-muted)" } }, "FimbulWorks Core Lead"),
                    ]),
                  ])
                : $div({ style: { display: "flex", gap: "1rem", alignItems: "center", width: "100%" } }, [
                    Skeleton({
                      circle: true,
                      height: 48,
                      className: "skeleton-demo",
                      animate: isSkeletonAnimated(),
                    }),
                    $div({ style: { display: "flex", flexDirection: "column", gap: "0.5rem", flex: "1" } }, [
                      Skeleton({
                        width: "60%",
                        height: 18,
                        radius: 4,
                        className: "skeleton-demo",
                        animate: isSkeletonAnimated(),
                      }),
                      Skeleton({
                        width: "40%",
                        height: 14,
                        radius: 4,
                        className: "skeleton-demo",
                        animate: isSkeletonAnimated(),
                      }),
                    ]),
                  ]),
            ),
          ]),
        ]),
        // Code Documentation
        $pre(
          { className: "code-block" },
          `import { Skeleton } from "@fimbul-works/seidr-ui";

// Circular avatar skeleton
Skeleton({ circle: true, height: 48 });

// Text line skeleton
Skeleton({ width: "60%", height: 18, radius: 4 });`,
        ),
      ]),
    ]),
  ]);
}, "SeidrUIShowcase");

const rootEl = document.getElementById("app");
if (rootEl) {
  mount(App, rootEl);
}
