import { createComponent } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createTabs, Tabs } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./tabs.css";

export const TabsShowcase = createComponent(() => {
  // Fine-grained coordinator instance for example 2
  const customTabs = createTabs({ defaultValue: "preview" });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Tabs"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "A set of layered sections of content, known as tab panels, that are displayed one at a time. Supports automatic/manual keyboard roving focus, smooth active indicator sliding, and horizontal/vertical orientations.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "tabs-showcase" }, [
        // 1. All-in-One Component (Tier 1) with Indicator
        $div({ className: "tabs-showcase-section" }, [
          $h3({ className: "tabs-showcase-heading" }, "1. All-in-One Tabs with Sliding Indicator"),
          Tabs({
            defaultValue: "account",
            indicator: true,
            items: [
              {
                value: "account",
                trigger: "Account",
                content: [$p("Manage your personal account profile, credentials, and notification settings.")],
              },
              {
                value: "billing",
                trigger: "Billing & Plans",
                content: [$p("View active subscriptions, invoices, payment methods, and current billing cycle.")],
              },
              {
                value: "team",
                trigger: "Team Members",
                content: [$p("Invite colleagues, configure role permissions, and audit organization activity.")],
              },
              {
                value: "security",
                trigger: "Security (Disabled)",
                disabled: true,
                content: [$p("Two-factor authentication and session management.")],
              },
            ],
          }),
        ]),

        // 2. Fine-Grained Coordinator (Tier 2) with Custom Markup
        $div({ className: "tabs-showcase-section" }, [
          $h3({ className: "tabs-showcase-heading" }, "2. Fine-Grained Coordinator (createTabs)"),
          customTabs.Root({}, [
            customTabs.List({}, [
              customTabs.Trigger({ value: "preview" }, [$span("👁️ "), $span("Preview")]),
              customTabs.Trigger({ value: "code" }, [$span("💻 "), $span("Code")]),
              customTabs.Trigger({ value: "changelog" }, [$span("📜 "), $span("Changelog")]),
              customTabs.Indicator({}),
            ]),
            customTabs.Content(
              { value: "preview" },
              $p("Live interactive preview rendered with pre-bound coordinator elements."),
            ),
            customTabs.Content(
              { value: "code" },
              $p("Generated Seidr TypeScript source code demonstrating zero-VDOM reactivity."),
            ),
            customTabs.Content(
              { value: "changelog" },
              $p("Recent component releases, bug fixes, and accessibility improvements."),
            ),
          ]),
        ]),

        // 3. Vertical Orientation
        $div({ className: "tabs-showcase-section" }, [
          $h3({ className: "tabs-showcase-heading" }, "3. Vertical Orientation"),
          Tabs({
            orientation: "vertical",
            defaultValue: "general",
            indicator: true,
            items: [
              {
                value: "general",
                trigger: "General",
                content: $p("General workspace configuration, language, and theme preferences."),
              },
              {
                value: "notifications",
                trigger: "Notifications",
                content: $p("Configure desktop alerts, push notifications, and email digests."),
              },
              {
                value: "integrations",
                trigger: "Integrations",
                content: $p("Connect GitHub, Slack, Linear, and other third-party developer webhooks."),
              },
            ],
          }),
        ]),

        // 4. Manual Activation Mode (Enter / Space to select)
        $div({ className: "tabs-showcase-section" }, [
          $h3(
            { className: "tabs-showcase-heading" },
            "4. Manual Activation (Navigate with arrows, press Space/Enter to activate)",
          ),
          Tabs({
            activationMode: "manual",
            defaultValue: "first",
            items: [
              {
                value: "first",
                trigger: "Overview",
                content: $p(
                  "Arrows only move focus between tabs; the active panel only changes when Space or Enter is pressed.",
                ),
              },
              {
                value: "second",
                trigger: "Metrics",
                content: $p("Real-time telemetry, response latencies, and uptime graphs."),
              },
              {
                value: "third",
                trigger: "Logs",
                content: $p("Structured JSON log streams captured during active component runs."),
              },
            ],
          }),
        ]),
      ]),
    ]),

    CodeBlock(
      `import { createTabs, Tabs } from "@fimbul-works/seidr-ui";

// 1. All-in-One Component
Tabs({
  defaultValue: "account",
  indicator: true,
  items: [
    { value: "account", trigger: "Account", content: $p("Account settings...") },
    { value: "billing", trigger: "Billing", content: $p("Invoices...") },
    { value: "team", trigger: "Team", content: $p("Team members...") },
  ],
});

// 2. Fine-Grained Coordinator (createTabs)
const tabs = createTabs({ defaultValue: "preview" });

tabs.Root({}, [
  tabs.List({}, [
    tabs.Trigger({ value: "preview" }, "Preview"),
    tabs.Trigger({ value: "code" }, "Code"),
    tabs.Indicator({}),
  ]),
  tabs.Content({ value: "preview" }, $p("Preview panel...")),
  tabs.Content({ value: "code" }, $p("Code panel...")),
]);

// 3. Vertical Orientation
Tabs({
  orientation: "vertical",
  defaultValue: "general",
  indicator: true,
  items: [ ... ],
});`,
    ),
  ]);
}, "TabsShowcase");
