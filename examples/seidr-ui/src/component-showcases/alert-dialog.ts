import { createComponent } from "@fimbul-works/seidr";
import { $button, $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { AlertDialog, createAlertDialog } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./alert-dialog.css";

export const AlertDialogShowcase = createComponent(() => {
  // Fine-grained alert dialog demo
  const discardDialog = createAlertDialog({
    id: "discard-changes-alert",
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "AlertDialog"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "An interruptive modal dialog window designed to prompt the user with critical information or require intentional confirmation before proceeding. Features WAI-ARIA role='alertdialog', focus trapping, body scroll lock, screen reader isolation, and intentional confirmation safety (outside pointer click does not dismiss by default).",
    ),

    $div({ className: "preview-box" }, [
      $div({ className: "alert-dialog-showcase" }, [
        // Section 1: Tier 1 All-in-One Destructive Confirmation
        $div({ className: "alert-dialog-section-box" }, [
          $h3({ className: "alert-dialog-heading" }, "Tier 1: Destructive Action Confirmation"),
          $p(
            { className: "alert-dialog-desc" },
            "Notice that clicking the backdrop outside the dialog will NOT dismiss it. Users must intentionally choose to cancel or confirm.",
          ),
          $div({ className: "alert-dialog-row" }, [
            AlertDialog({
              id: "delete-repo-alert",
              trigger: "Delete Repository ⚠️",
              title: "Delete Repository?",
              description: "This will permanently remove the repository 'fimbul-works/seidr' and all associated branches, issues, and pull requests.",
              content: $div({ className: "alert-dialog-actions" }, [
                $button(
                  {
                    type: "button",
                    className: "alert-dialog-btn-cancel",
                    onclick: (e) => {
                      // Close using closest or data attribute
                      const closeBtn = document.querySelector("#delete-repo-alert-content [data-part='CloseButton']") as HTMLButtonElement;
                      closeBtn?.click();
                    },
                  },
                  "Cancel",
                ),
                $button(
                  {
                    type: "button",
                    className: "alert-dialog-btn-confirm",
                    onclick: () => {
                      alert("Repository deletion confirmed!");
                      const closeBtn = document.querySelector("#delete-repo-alert-content [data-part='CloseButton']") as HTMLButtonElement;
                      closeBtn?.click();
                    },
                  },
                  "Permanently Delete",
                ),
              ]),
            }),
          ]),
        ]),

        // Section 2: Tier 2 Fine-Grained AlertDialog
        $div({ className: "alert-dialog-section-box" }, [
          $h3({ className: "alert-dialog-heading" }, "Tier 2: Fine-Grained Composition (`createAlertDialog`)"),
          $p(
            { className: "alert-dialog-desc" },
            "Direct access to compound components with explicit confirmation buttons bound to `instance.close()`.",
          ),
          $div({ className: "alert-dialog-row" }, [
            discardDialog.Root({}, [
              discardDialog.Trigger({ style: "background: #d97706;" }, "Discard Unsaved Changes ⚡"),
              discardDialog.Portal({}, [
                discardDialog.Overlay({}),
                discardDialog.Content({ style: "border-color: rgba(217, 119, 6, 0.4);" }, [
                  discardDialog.Title({ style: "color: #fcd34d;" }, "Discard Draft?"),
                  discardDialog.Description({}, "You have unsaved shader code in LoiskeToy. If you leave now, your changes will be lost forever."),
                  $div({ className: "alert-dialog-actions" }, [
                    $button(
                      {
                        type: "button",
                        className: "alert-dialog-btn-cancel",
                        onclick: () => discardDialog.close(),
                      },
                      "Keep Editing",
                    ),
                    $button(
                      {
                        type: "button",
                        className: "alert-dialog-btn-confirm",
                        style: "background: #d97706;",
                        onclick: () => {
                          alert("Draft discarded!");
                          discardDialog.close();
                        },
                      },
                      "Discard Changes",
                    ),
                  ]),
                  discardDialog.CloseButton({}, "✕"),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),

    CodeBlock({
      code: `// Tier 1: All-in-One AlertDialog
AlertDialog({
  id: "delete-alert",
  trigger: "Delete Repository",
  title: "Delete Repository?",
  description: "This action cannot be undone.",
  content: [
    Button({ variant: "subtle", onclick: cancel }, "Cancel"),
    Button({ variant: "danger", onclick: confirm }, "Delete"),
  ],
});

// Tier 2: Fine-Grained Composition
const alertDlg = createAlertDialog({ id: "custom-alert" });

alertDlg.Root({}, [
  alertDlg.Trigger({}, "Discard Draft"),
  alertDlg.Portal({}, [
    alertDlg.Overlay({}),
    alertDlg.Content({}, [
      alertDlg.Title({}, "Discard Draft?"),
      alertDlg.Description({}, "Unsaved changes will be lost."),
      alertDlg.CloseButton({}, "✕"),
    ]),
  ]),
]);`,
      language: "typescript",
    }),
  ]);
});

