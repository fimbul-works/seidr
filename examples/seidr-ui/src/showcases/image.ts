import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import { Image } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block";
import "./image.css";

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
      "Accessible image container with loading status tracking and automatic fallback support (onload / onerror).",
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
          isBrokenAvatar.as((b) => (b ? "Status: Fallback rendered (error)" : "Status: Image loaded")),
        ),
      ]),
      $div({ style: { display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" } }, [
        // Standard avatar (unified component)
        Image({
          src: avatarUrl,
          alt: "User portrait",
          fallback: "CN",
          className: "avatar",
          fallbackProps: { className: "avatar-fallback" },
          imgProps: { className: "avatar-img" },
        }),
        // Large avatar with custom fallback
        Image({
          src: avatarUrl,
          alt: "User portrait large",
          fallback: "Claus",
          className: "avatar large",
          fallbackProps: { className: "avatar-fallback" },
          imgProps: { className: "avatar-img" },
        }),
        // Avatar with delayMs on fallback
        Image({
          src: avatarUrl,
          alt: "Small avatar",
          fallback: "FW",
          fallbackDelay: 300,
          className: "avatar small",
          fallbackProps: { className: "avatar-fallback muted" },
          imgProps: { className: "avatar-img" },
        }),
        // Broken image with permanent fallback
        Image({
          src: "https://invalid-avatar-url.fake/none.png",
          alt: "Broken avatar",
          fallback: "⚠️",
          className: "avatar",
          fallbackProps: { className: "avatar-fallback" },
          imgProps: { className: "avatar-img" },
        }),
      ]),
    ]),
    CodeBlock(
      `import { Image } from "@fimbul-works/seidr-ui";

Image({
  src: avatarUrl,
  alt: "User portrait",
  fallback: "CN",
  fallbackDelay: 300,
  className: "avatar",
});

// 2. Compound instance workflow (for custom markup)
const avatar = Image.create({ src: avatarUrl });
avatar.Root({ className: "avatar" }, [
  avatar.Fallback({ className: "avatar-fallback" }, "CN"),
  avatar.Img({ alt: "User portrait", className: "avatar-img" }),
]);`,
    ),
  ]);
}, "ImageShowcase");
