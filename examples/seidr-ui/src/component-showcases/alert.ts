import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Alert } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block";
import "./alert.css";

export const AlertShowcase = createComponent(() => {
  const alertSeverity = createValue<"info" | "warning" | "error">("info");

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Alert"),
      $span({ className: "card-badge" }, "Atom"),
    ]),
    $p(
      { className: "card-desc" },
      'Displays an urgent, accessible notice using role="alert" to inform users without interrupting their flow.',
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
          className: alertSeverity.as((s) => `alert ${s}`),
        },
        alertSeverity.as((s) => {
          if (s === "warning") return "⚠️ Warning: Storage is reaching 90% capacity.";
          if (s === "error") return "⛔ Error: Failed to synchronize latest changes with server.";
          return "ℹ️ Notice: Scheduled maintenance will begin at midnight UTC.";
        }),
      ),
    ]),
    CodeBlock(
      `import { Alert } from "@fimbul-works/seidr-ui";

// Basic usage
Alert("Scheduled maintenance at midnight");

// With props and custom severity
Alert({ className: "alert warning" }, "Storage almost full");`,
    ),
  ]);
}, "lerttShocase");
