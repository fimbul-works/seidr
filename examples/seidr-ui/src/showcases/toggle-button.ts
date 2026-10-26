import { createComponent, createValue } from "@fimbul-works/seidr";
import {
  $div,
  $h2,
  $p,
  $section,
  $span,
} from "@fimbul-works/seidr/html";
import { ToggleButton } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block";
import "./toggle-button.css";

export const ToggleButtonShowcase = createComponent(() => {
  const isStarred = createValue(true);

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "ToggleButton"),
      $span({ className: "card-badge" }, "Atom"),
    ]),
    $p(
      { className: "card-desc" },
      'Two-state button that toggles an active selection on or off, backed by aria-pressed and data-pressed.',
    ),
    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ style: { display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" } }, [
        // Sound Mute Toggle (uncontrolled with renderContent prop)
        ToggleButton({
          className: "toggle-btn",
          defaultPressed: false,
          renderContent: ({ pressed }) =>
            pressed.as((p: boolean) => (p ? "🔊 Sound On" : "🔇 Sound Muted")),
        }),
        // Star/Bookmark Toggle (controlled)
        ToggleButton(
          {
            className: "toggle-btn",
            pressed: isStarred,
            onChange: (val) => isStarred(val),
          },
          isStarred.as((s) => (s ? "⭐ Starred" : "☆ Star")),
        ),
        // Disabled toggle button
        ToggleButton(
          {
            className: "toggle-btn",
            defaultPressed: true,
            disabled: true,
          },
          "🔒 Locked Active",
        ),
      ]),
    ]),
    // Code Documentation
  CodeBlock(
      `import { ToggleButton } from "@fimbul-works/seidr-ui";

// 1. Uncontrolled with renderContent prop
ToggleButton({
  defaultPressed: false,
  renderContent: ({ pressed }) => pressed.as(p => p ? "🔊 Sound On" : "🔇 Sound Muted"),
});

// 2. Controlled pressed state (reactive child derivation)
ToggleButton(
  { pressed: isStarred, onChange: (val) => isStarred(val) },
  isStarred.as(s => s ? "⭐ Starred" : "☆ Star")
);`,
    ),
  ]);
}, "ToggleButtonDemo");
