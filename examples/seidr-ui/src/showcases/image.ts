import { createComponent, createValue } from "@fimbul-works/seidr";
import {
  $button,
  $div,
  $h2,
  $p,
  $section,
  $span,
} from "@fimbul-works/seidr/html";
import { Image } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block";
import "./image.css"

export const ImageShowcase = createComponent(() => {
  const isBrokenAvatar = createValue(false);
  const avatarUrl = isBrokenAvatar.as((broken) =>
    broken
      ? "https://invalid-url.example/nonexistent-avatar.jpg"
      : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  );

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Image"),
      $span({ className: "card-badge" }, "Compound Atom"),
    ]),
    $p(
      { className: "card-desc" },
      'Accessible image container with loading status tracking and automatic fallback support (onload / onerror).',
    ),
    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "controls-row" }, [
        $button(
          {
            className: isBrokenAvatar.as((b) => `control-btn ${b ? "active" : ""}`),
            onclick: () => isBrokenAvatar(!isBrokenAvatar()),
          },
          isBrokenAvatar.as((b) => (b ? "Restore Valid Image" : "Simulate Broken URL")),
        ),
        $span(
          { style: { fontSize: "0.85rem", color: "var(--fg-muted)" } },
          isBrokenAvatar.as((b) =>
            b ? "Status: Fallback rendered (error)" : "Status: Image loaded",
          ),
        ),
      ]),
      $div({ style: { display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" } }, [
        // Standard avatar (scoped API)
        Image(
          { className: "avatar-demo" },
          (img) => [
            img.Img({ src: avatarUrl, alt: "User portrait", className: "avatar-img" }),
            img.Fallback({ className: "avatar-fallback" }, "CN"),
          ],
        ),
        // Large avatar with custom fallback
        Image(
          { className: "avatar-demo large" },
          (img) => [
            img.Img({ src: avatarUrl, alt: "User portrait large", className: "avatar-img" }),
            img.Fallback({ className: "avatar-fallback" }, "Claus"),
          ],
        ),
        // Avatar with delayMs on fallback
        Image(
          { className: "avatar-demo small", fallbackDelay: 300 },
          (img) => [
            img.Img({ src: avatarUrl, alt: "Small avatar", className: "avatar-img" }),
            img.Fallback({ className: "avatar-fallback muted" }, "FW"),
          ],
        ),
        // Broken image with permanent fallback
        Image(
          { className: "avatar-demo" },
          (img) => [
            img.Img({ src: "https://invalid-avatar-url.fake/none.png", alt: "Broken avatar", className: "avatar-img" }),
            img.Fallback({ className: "avatar-fallback" }, "⚠️"),
          ],
        ),
      ]),
    ]),
    // Code Documentation
    CodeBlock(
      `import { Image } from "@fimbul-works/seidr-ui";

// Scoped callback pattern
Image({ className: "avatar" }, (img) => [
  img.Img({ src: avatarUrl, alt: "User portrait", className: "avatar-img" }),
  img.Fallback({ className: "avatar-fallback" }, "CN")
]);

// Context stack pattern with fallbackDelay
Image.Root({ fallbackDelay: 300 }, () => [
  Image.Img({ src: "/avatar.png", alt: "User" }),
  Image.Fallback("CN")
]);`,
    ),
  ]);
}, "ImageDemo");
