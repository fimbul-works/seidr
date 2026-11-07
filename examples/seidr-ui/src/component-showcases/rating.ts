import { createComponent, createValue } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createRating, Rating } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./rating.css";

export const RatingShowcase = createComponent(() => {
  // Reactive values to track live scores for badges
  const basicScore = createValue(4);
  const halfScore = createValue(3.5);
  const flameScore = createValue(3);
  const heartScore = createValue(5);

  // Fine-grained coordinators for Section 3 (Flames & Hearts)
  const flameRating = createRating({
    max: 5,
    value: flameScore,
    onChange: (v) => flameScore(v),
  });

  const heartRating = createRating({
    max: 5,
    value: heartScore,
    onChange: (v) => heartScore(v),
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Rating"),
      $span({ className: "card-badge" }, "Form / Feedback"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible star and score rating component with hover preview, optional half-star precision, roving keyboard navigation, clearable state, and form synchronization.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "rating-showcase" }, [
        // 1. All-in-One Basic 5-Star Rating
        $div({ className: "rating-showcase-section" }, [
          $h3({ className: "rating-showcase-heading" }, "1. Basic Rating (Tier 1 All-in-One)"),
          $div({ className: "rating-row" }, [
            Rating({
              id: "basic-rating",
              label: "Product Quality",
              description: "Click to select or click current score to clear",
              value: basicScore,
              onChange: (v) => basicScore(v),
            }),
            $span(
              { className: "rating-score-badge" },
              basicScore.as((s) => `Selected: ${s} / 5`),
            ),
          ]),
        ]),

        // 2. Half-Star Precision Rating
        $div({ className: "rating-showcase-section" }, [
          $h3({ className: "rating-showcase-heading" }, "2. Half-Star Precision (allowHalf: true)"),
          $div({ className: "rating-row" }, [
            Rating({
              id: "half-star-rating",
              label: "Movie Score",
              description: "Hover over left or right half of each star",
              allowHalf: true,
              value: halfScore,
              onChange: (v) => halfScore(v),
            }),
            $span(
              { className: "rating-score-badge" },
              halfScore.as((s) => `Score: ${s.toFixed(1)} / 5`),
            ),
          ]),
        ]),

        // 3. Fine-Grained Custom Themes (createRating Tier 2)
        $div({ className: "rating-showcase-section" }, [
          $h3({ className: "rating-showcase-heading" }, "3. Custom Emojis (createRating Tier 2)"),
          $div({ className: "rating-row" }, [
            // Flame Difficulty
            $div({ className: "rating-flame" }, [
              flameRating.Root({}, [
                flameRating.Label({}, "Spice Level"),
                $div(
                  {
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    },
                    dataPart: "group",
                  },
                  Array.from({ length: 5 }, (_, i) => {
                    const itemVal = i + 1;
                    return flameRating.Item(
                      { value: itemVal },
                      flameRating.ItemIndicator({
                        itemValue: itemVal,
                        fullIcon: "🔥",
                        emptyIcon: "🔥",
                      }),
                    );
                  }),
                ),
                flameRating.Description({}, "Spicy taste tolerance test"),
                flameRating.HiddenInput(),
              ]),
            ]),
            $span(
              { className: "rating-score-badge" },
              flameScore.as((s) => `Spiciness: ${s} 🔥`),
            ),

            // Heart Satisfaction
            $div({ className: "rating-heart" }, [
              heartRating.Root({}, [
                heartRating.Label({}, "User Satisfaction"),
                $div(
                  {
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    },
                    dataPart: "group",
                  },
                  Array.from({ length: 5 }, (_, i) => {
                    const itemVal = i + 1;
                    return heartRating.Item(
                      { value: itemVal },
                      heartRating.ItemIndicator({
                        itemValue: itemVal,
                        fullIcon: "❤️",
                        emptyIcon: "🤍",
                      }),
                    );
                  }),
                ),
                heartRating.Description({}, "Rate your experience with Seidr UI"),
                heartRating.HiddenInput(),
              ]),
            ]),
            $span(
              { className: "rating-score-badge" },
              heartScore.as((s) => `Hearts: ${s} ❤️`),
            ),
          ]),
        ]),

        // 4. Read-Only Average & Disabled Preview
        $div({ className: "rating-showcase-section" }, [
          $h3({ className: "rating-showcase-heading" }, "4. Read-Only Average & Disabled"),
          $div({ className: "rating-row" }, [
            Rating({
              id: "readonly-rating",
              label: "Average Customer Review",
              description: "Calculated aggregate score",
              defaultValue: 4.5,
              allowHalf: true,
              readOnly: true,
            }),
            $span({ className: "rating-score-badge" }, "4.5 / 5.0 (1,248 reviews)"),

            Rating({
              id: "disabled-rating",
              label: "Archived Item",
              description: "Voting closed",
              defaultValue: 3,
              disabled: true,
            }),
          ]),
        ]),
      ]),
    ]),

    // Code Examples
    CodeBlock({
      title: "Usage Examples",
      code: `import { Rating, createRating } from "@fimbul-works/seidr-ui";
import { createValue } from "@fimbul-works/seidr";

// 1. Tier 1 All-in-One Rating
const score = createValue(4);

Rating({
  id: "product-score",
  label: "Product Quality",
  description: "Click star to set score, click again to clear",
  value: score,
  onChange: (val) => score(val),
});

// 2. Half-Star Precision
Rating({
  label: "Movie Rating",
  allowHalf: true,
  defaultValue: 3.5,
});

// 3. Tier 2 Fine-Grained Custom Emoji Coordinator
const rating = createRating({ max: 5 });

rating.Root({}, [
  rating.Label({}, "Spice Level"),
  rating.Item({ value: 1 }, rating.ItemIndicator({ itemValue: 1, fullIcon: "🔥" })),
  rating.Item({ value: 2 }, rating.ItemIndicator({ itemValue: 2, fullIcon: "🔥" })),
  rating.Item({ value: 3 }, rating.ItemIndicator({ itemValue: 3, fullIcon: "🔥" })),
  rating.HiddenInput(),
]);`,
      language: "typescript",
    }),
  ]);
});

