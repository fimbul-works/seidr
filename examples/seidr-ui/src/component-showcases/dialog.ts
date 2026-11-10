import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $form, $h2, $h3, $input, $label, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createDialog, Dialog } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./dialog.css";

export const DialogShowcase = createComponent(() => {
  // Tier 2 coordinator demo
  const fgDialog = createDialog({
    id: "tier2-dialog-demo",
  });

  const usernameVal = createValue("SeidrWizard");
  const emailVal = createValue("wizard@fimbul.dev");

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Dialog"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "A modal or non-modal overlay window that overlays primary content. Features WAI-ARIA role='dialog', automatic focus trapping, outside pointer dismissal, escape key cancellation, document body scroll lock, screen reader isolation, and portaling.",
    ),

    $div({ className: "preview-box" }, [
      $div({ className: "dialog-showcase" }, [
        // Section 1: Tier 1 Standard Dialog
        $div({ className: "dialog-section-box" }, [
          $h3({ className: "dialog-heading" }, "Tier 1: All-in-One Dialog"),
          $p(
            { className: "dialog-desc" },
            "Convenience component rendering trigger, backdrop overlay, title, description, content body, and close button.",
          ),
          $div({ className: "dialog-row" }, [
            Dialog({
              id: "dialog-basic-demo",
              trigger: "Open Profile Dialog",
              title: "User Profile Overview",
              description: "Review and inspect your account configuration settings.",
              content: $div({ style: "display: flex; flex-direction: column; gap: 0.75rem;" }, [
                $p({ style: "margin: 0; color: #cbd5e1;" }, "Account tier: Pro Developer"),
                $p({ style: "margin: 0; color: #cbd5e1;" }, "Active sessions: 2 devices connected"),
              ]),
            }),
          ]),
        ]),

        // Section 2: Interactive Form with Focus Trap & Body Scroll Lock
        $div({ className: "dialog-section-box" }, [
          $h3({ className: "dialog-heading" }, "Interactive Modal Form (Focus Trapped & Scroll Locked)"),
          $p(
            { className: "dialog-desc" },
            "Opening the modal locks background page scrolling, traps Tab key navigation inside the dialog, and restores focus to the trigger upon dismissal.",
          ),
          $div({ className: "dialog-row" }, [
            Dialog({
              id: "dialog-form-demo",
              trigger: "Edit Profile Settings ✏️",
              title: "Edit Profile",
              description: "Make changes to your user account information here.",
              content: $form(
                {
                  style: "display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem;",
                  onsubmit: (e) => e.preventDefault(),
                },
                [
                  $div({ style: "display: flex; flex-direction: column; gap: 0.25rem;" }, [
                    $label({ for: "dlg-username", style: "font-size: 0.8125rem; font-weight: 500; color: #94a3b8;" }, "Username"),
                    $input({
                      id: "dlg-username",
                      value: usernameVal,
                      style: "background: #18181b; border: 1px solid #3f3f46; border-radius: 6px; padding: 0.5rem; color: #f4f4f5;",
                      oninput: (e) => usernameVal((e.target as HTMLInputElement).value),
                    }),
                  ]),
                  $div({ style: "display: flex; flex-direction: column; gap: 0.25rem;" }, [
                    $label({ for: "dlg-email", style: "font-size: 0.8125rem; font-weight: 500; color: #94a3b8;" }, "Email Address"),
                    $input({
                      id: "dlg-email",
                      type: "email",
                      value: emailVal,
                      style: "background: #18181b; border: 1px solid #3f3f46; border-radius: 6px; padding: 0.5rem; color: #f4f4f5;",
                      oninput: (e) => emailVal((e.target as HTMLInputElement).value),
                    }),
                  ]),
                  $button(
                    {
                      type: "button",
                      style: "margin-top: 0.5rem; padding: 0.625rem; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;",
                      onclick: () => alert(`Saved: ${usernameVal()} (${emailVal()})`),
                    },
                    "Save Changes",
                  ),
                ],
              ),
            }),
          ]),
        ]),

        // Section 3: Tier 2 Fine-Grained Composition
        $div({ className: "dialog-section-box" }, [
          $h3({ className: "dialog-heading" }, "Tier 2: Fine-Grained Sculpted Composition (`createDialog`)"),
          $p(
            { className: "dialog-desc" },
            "Complete freedom over compound DOM elements, portals, and custom layout hierarchies.",
          ),
          $div({ className: "dialog-row" }, [
            fgDialog.Root({}, [
              fgDialog.Trigger({ style: "background: #334155;" }, "Custom Sculpted Dialog 🛠️"),
              fgDialog.Portal({}, [
                fgDialog.Overlay({}),
                fgDialog.Content({ style: "border-color: #6366f1;" }, [
                  fgDialog.Title({}, "Sculpted Architecture"),
                  fgDialog.Description({}, "Composed using pre-bound compound element factories."),
                  $p({ style: "margin: 0 0 1rem 0; color: #cbd5e1;" }, "Each sub-element maintains full reactive state and strict accessibility semantics."),
                  fgDialog.CloseButton({}, "Close"),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),

    CodeBlock({
      code: `// Tier 1: All-in-One Dialog
Dialog({
  id: "profile-dialog",
  trigger: "Open Dialog",
  title: "Profile Overview",
  description: "Account configuration settings.",
  content: "Dimensions, permissions, and session status...",
});

// Tier 2: Fine-Grained Composition
const dialog = createDialog();

dialog.Root({}, [
  dialog.Trigger({}, "Open Dialog"),
  dialog.Portal({}, [
    dialog.Overlay({}),
    dialog.Content({}, [
      dialog.Title({}, "Custom Title"),
      dialog.Description({}, "Custom Description"),
      dialog.CloseButton({}, "✕"),
    ]),
  ]),
]);`,
      language: "typescript",
    }),
  ]);
});

