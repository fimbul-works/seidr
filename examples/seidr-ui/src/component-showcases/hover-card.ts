import { createComponent, getDocument } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createHoverCard, HoverCard } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./hover-card.css";

export const HoverCardShowcase = createComponent(() => {
  const tier2Card = createHoverCard({
    id: "tier2-loisketoy-hc",
    placement: "bottom-start",
    gutter: 12,
    openDelay: 250,
    closeDelay: 250,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "HoverCard"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible rich preview card for sighted users to preview content available behind a link or trigger. Features safe-area polygon cursor tracking, pointer and keyboard focus bridges, delay timers, and portaling.",
    ),

    $div({ className: "preview-box" }, [
      $div({ className: "hover-card-showcase" }, [
        // Section 1: Inline Prose Profile Preview with Safe Polygon & Interactive Elements
        $div({ className: "hover-card-section-box" }, [
          $h3({ className: "hover-card-heading" }, "Tier 1: Rich Profile Card & Safe-Polygon Navigation"),
          $p(
            { className: "hover-card-desc" },
            "Hover over the mention below. You can glide the cursor across the gap into the card to click the 'Follow' or 'Message' buttons — the safe-polygon algorithm ensures the card stays open while your pointer travels toward it.",
          ),
          $div({ className: "hover-card-prose-row" }, [
            "Crafted with love by ",
            HoverCard({
              id: "profile-hc",
              trigger: "@fimbul-works",
              href: "https://github.com/fimbul-works",
              showArrow: true,
              openDelay: 200,
              closeDelay: 200,
              content: $div({ className: "hc-profile-card" }, [
                $div({ className: "hc-profile-header" }, [
                  $div({ className: "hc-avatar" }, "F"),
                  $div({ className: "hc-profile-info" }, [
                    $span({ className: "hc-name" }, "Fimbul Works"),
                    $span({ className: "hc-handle" }, "@fimbul-works"),
                  ]),
                ]),
                $p(
                  { className: "hc-bio" },
                  "Building high-performance reactive web toolkits, vector editors, and modern shader playgrounds.",
                ),
                $div({ className: "hc-stats" }, [
                  $span([$span({ className: "hc-stat-strong" }, "42"), " Repositories"]),
                  $span([$span({ className: "hc-stat-strong" }, "1.2k"), " Followers"]),
                ]),
                $div({ className: "hc-btn-row" }, [
                  $button(
                    {
                      className: "hc-action-btn primary",
                      type: "button",
                      onclick: (e) => {
                        e.stopPropagation();
                        alert("Followed @fimbul-works!");
                      },
                    },
                    "Follow",
                  ),
                  $button(
                    {
                      className: "hc-action-btn",
                      type: "button",
                      onclick: (e) => {
                        e.stopPropagation();
                        alert("Opening message dialogue...");
                      },
                    },
                    "Message",
                  ),
                ]),
              ]),
            }),
            " as part of the Seidr UI headless component system.",
          ]),
        ]),

        // Section 2: Portaled HoverCard escaping an overflow: hidden container
        $div({ className: "hover-card-section-box" }, [
          $h3({ className: "hover-card-heading" }, "Portaled HoverCard (Escaping Overflow Container)"),
          $p(
            { className: "hover-card-desc" },
            "This container clips content with overflow: hidden. HoverCard uses portalTarget: document.body to render the floating preview directly into the body without being clipped.",
          ),
          $div({ className: "hover-card-scroll-container" }, [
            $div({ className: "hover-card-prose-row" }, [
              "Explore modern GLSL shaders on ",
              HoverCard({
                id: "portal-hc",
                trigger: "LoiskeToy Modern ShaderToy",
                href: "#loisketoy",
                portalTarget: getDocument().body,
                showArrow: true,
                openDelay: 200,
                closeDelay: 200,
                content: $div({ className: "hc-profile-card" }, [
                  $span({ className: "hc-name" }, "🎨 LoiskeToy"),
                  $p(
                    { className: "hc-bio" },
                    "A next-generation shader playground with real-time audio reactivity, WebGL2 pipelines, and intuitive UI.",
                  ),
                  $div({ className: "hc-stats" }, [
                    $span([$span({ className: "hc-stat-strong" }, "WebGL 2.0"), " Ready"]),
                    $span([$span({ className: "hc-stat-strong" }, "60 FPS"), " Target"]),
                  ]),
                ]),
              }),
              " for creative raymarching and procedural art.",
            ]),
          ]),
        ]),

        // Section 3: Tier 2 Fine-Grained Composition
        $div({ className: "hover-card-section-box" }, [
          $h3({ className: "hover-card-heading" }, "Tier 2: Fine-Grained createHoverCard"),
          $p(
            { className: "hover-card-desc" },
            "Composed explicitly with tier2.Root, tier2.Trigger, tier2.Content, and tier2.Arrow.",
          ),
          $div({ className: "hover-card-prose-row" }, [
            tier2Card.Root({}, [
              tier2Card.Trigger({ href: "#vector-editor" }, "Vector Manipulation Editor"),
              tier2Card.Content({}, [
                $div({ className: "hc-profile-card" }, [
                  $span({ className: "hc-name" }, "📐 SVG Vector Editor"),
                  $p(
                    { className: "hc-bio" },
                    "Bespoke vector manipulation environment crafted for tactile curve design, boolean ops, and clean SVG export.",
                  ),
                ]),
                tier2Card.Arrow(),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),

    CodeBlock({
      code: `// Tier 1: All-in-One HoverCard with Profile Preview
HoverCard({
  id: "author-preview",
  trigger: "@fimbul-works",
  href: "https://github.com/fimbul-works",
  portalTarget: getDocument().body,
  showArrow: true,
  openDelay: 200,
  closeDelay: 200,
  content: $div({ className: "profile-card" }, [
    $h4("Fimbul Works"),
    $p("Building reactive web toolkits"),
    $button({ type: "button" }, "Follow"),
  ]),
});

// Tier 2: Fine-Grained Coordinator
const hc = createHoverCard({ placement: "bottom-start", gutter: 12 });

hc.Root({}, [
  hc.Trigger({ href: "/docs" }, "Documentation Preview"),
  hc.Content({}, [
    "Interactive documentation preview",
    hc.Arrow(),
  ]),
]);`,
      language: "typescript",
    }),
  ]);
}, "HoverCardShowcase");

