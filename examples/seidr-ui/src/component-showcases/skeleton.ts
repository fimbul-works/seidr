import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Skeleton } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block";
import "./skeleton.css";

export const SkeletonShowcase = createComponent(() => {
  const isSkeletonLoaded = createValue(false);
  const isSkeletonAnimated = createValue(true);

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Skeleton"),
      $span({ className: "card-badge" }, "Atom"),
    ]),
    $p({ className: "card-desc" }, "Animated placeholder while content is loading with aria-busy and data attributes."),
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
                  className: "skeleton",
                  animate: isSkeletonAnimated(),
                }),
                $div({ style: { display: "flex", flexDirection: "column", gap: "0.5rem", flex: "1" } }, [
                  Skeleton({
                    width: "60%",
                    height: 18,
                    radius: 4,
                    className: "skeleton",
                    animate: isSkeletonAnimated(),
                  }),
                  Skeleton({
                    width: "40%",
                    height: 14,
                    radius: 4,
                    className: "skeleton",
                    animate: isSkeletonAnimated(),
                  }),
                ]),
              ]),
        ),
      ]),
    ]),
    CodeBlock(
      `import { Skeleton } from "@fimbul-works/seidr-ui";

// Circular avatar skeleton
Skeleton({ circle: true, height: 48 });

// Text line skeleton
Skeleton({ width: "60%", height: 18, radius: 4 });`,
    ),
  ]);
}, "SkeletonShowcase");
