import { createComponent, getDocument } from "@fimbul-works/seidr";
import { $div, $h2, $p, $section, $span } from "@fimbul-works/seidr/html";
import {
  Button,
  createToast,
  Toast,
  ToastRegion,
  toaster,
} from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./toast.css";

export const ToastShowcase = createComponent(() => {
  let updatableToastId: number | undefined;
  let counter = 1;

  const showVariantToast = (
    variant: "info" | "success" | "warning" | "error",
    title: string,
    description: string,
  ) => {
    toaster.show(({ toastId, region }) =>
      Toast({
        toastId,
        region,
        title,
        description,
        showProgress: true,
        priority: variant === "error" || variant === "warning" ? "high" : "low",
        rootProps: {
          className: variant === "info" ? undefined : `toast-${variant}`,
        },
      }),
    );
  };

  const showPromiseToast = (shouldSucceed: boolean) => {
    const simulatedTask = new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (shouldSucceed) {
          resolve("Build artifact v1.4.2 uploaded (1.8 MB)");
        } else {
          reject(new Error("Connection timed out while uploading artifact"));
        }
      }, 1800);
    });

    toaster.promise(simulatedTask, ({ toastId, region, state, data, error }) =>
      Toast({
        toastId,
        region,
        persistent: state === "pending",
        showProgress: state !== "pending",
        title:
          state === "pending"
            ? "⏳ Deploying release..."
            : state === "fulfilled"
              ? "✅ Deployment succeeded"
              : "❌ Deployment failed",
        description:
          state === "pending"
            ? "Bundling and uploading assets to edge nodes..."
            : state === "fulfilled"
              ? data
              : error?.message,
        rootProps: {
          className:
            state === "fulfilled"
              ? "toast-success"
              : state === "rejected"
                ? "toast-error"
                : undefined,
        },
      }),
    );
  };

  const showOrUpdatePersistentToast = () => {
    if (
      updatableToastId !== undefined &&
      toaster.isActive(updatableToastId)
    ) {
      counter += 1;
      toaster.update(updatableToastId, ({ toastId, region }) =>
        Toast({
          toastId,
          region,
          persistent: true,
          title: `📌 Persistent Notification (Updated #${counter})`,
          description:
            "Updated in-place via toaster.update() without re-triggering entrance animations.",
        }),
      );
      return;
    }

    counter = 1;
    updatableToastId = toaster.show(({ toastId, region }) =>
      Toast({
        toastId,
        region,
        persistent: true,
        title: "📌 Persistent Notification (#1)",
        description:
          "Stays open until manually closed or dismissed. Click the button again to update in-place.",
      }),
    );
  };

  const showTier2ToastInTopRight = () => {
    toaster.show(
      ({ toastId, region }) => {
        const t = createToast({
          toastId,
          region,
          duration: 4000,
        });

        return t.Root({ className: "toast-success" }, [
          t.Title({}, "🚀 Top-Right Portaled Region"),
          t.Description(
            {},
            "Rendered using Tier 2 createToast() into a secondary ToastRegion portaled to getDocument().body.",
          ),
          t.CloseButton({}, "✕"),
          t.ProgressTrack({}, [t.ProgressFill({})]),
        ]);
      },
      { region: "top-right" },
    );
  };

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Toast"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "Accessible, non-modal live region notifications with auto-dismiss timers, hover/focus pause, pointer swipe-to-dismiss, promise lifecycle tracking, and Portal rendering into document.body.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "toast-showcase" }, [
        // 1. Standard Variants
        $div({ className: "toast-showcase-section" }, [
          $span({ className: "toast-showcase-label" }, "1. Notification Variants (Portaled to document.body)"),
          $div({ className: "toast-showcase-actions" }, [
            Button(
              {
                onclick: () =>
                  showVariantToast(
                    "info",
                    "New message received",
                    "Press Alt+T to focus the active toast region, or Escape to dismiss.",
                  ),
              },
              "Show Info Toast",
            ),
            Button(
              {
                onclick: () =>
                  showVariantToast(
                    "success",
                    "Changes saved",
                    "Your workspace preferences have been synchronized.",
                  ),
              },
              "Show Success Toast",
            ),
            Button(
              {
                onclick: () =>
                  showVariantToast(
                    "warning",
                    "Storage almost full",
                    "88% of your local cache quota is currently in use.",
                  ),
              },
              "Show Warning Toast",
            ),
            Button(
              {
                onclick: () =>
                  showVariantToast(
                    "error",
                    "Build failed",
                    "Type check encountered 2 errors in src/index.ts.",
                  ),
              },
              "Show Error Toast",
            ),
          ]),
        ]),

        // 2. Async Promise Toasts
        $div({ className: "toast-showcase-section" }, [
          $span({ className: "toast-showcase-label" }, "2. Async Promise Lifecycle (toaster.promise)"),
          $div({ className: "toast-showcase-actions" }, [
            Button(
              { onclick: () => showPromiseToast(true) },
              "Trigger Promise (Resolve)",
            ),
            Button(
              { onclick: () => showPromiseToast(false) },
              "Trigger Promise (Reject)",
            ),
          ]),
        ]),

        // 3. Persistent, In-Place Update & Multi-Region
        $div({ className: "toast-showcase-section" }, [
          $span({ className: "toast-showcase-label" }, "3. Persistent Update, Multi-Region & Queue Control"),
          $div({ className: "toast-showcase-actions" }, [
            Button(
              { onclick: showOrUpdatePersistentToast },
              "Show / Update Persistent Toast",
            ),
            Button(
              { onclick: showTier2ToastInTopRight },
              "Show in Top-Right Region (Tier 2)",
            ),
            Button(
              { onclick: () => toaster.clear() },
              "Clear All Toasts",
            ),
          ]),
        ]),
      ]),

      // Default Bottom-Right ToastRegion portaled directly to getDocument().body
      ToastRegion({
        portalTarget: getDocument().body,
        limit: 4,
        duration: 4500,
      }),

      // Secondary Top-Right ToastRegion portaled directly to getDocument().body
      ToastRegion({
        regionId: "top-right",
        portalTarget: getDocument().body,
        limit: 3,
        swipeDirection: "up",
        regionProps: {
          className: "toast-region-top-right",
        },
      }),
    ]),

    CodeBlock({
      language: "typescript",
      code: `import { getDocument } from "@fimbul-works/seidr";
import { createToast, Toast, ToastRegion, toaster } from "@fimbul-works/seidr-ui";

// 1. Mount ToastRegion portaled into getDocument().body
ToastRegion({
  portalTarget: getDocument().body,
  limit: 4,
  duration: 4500,
});

// 2. Imperatively trigger a Tier 1 Toast from anywhere
const id = toaster.show(({ toastId, region }) =>
  Toast({
    toastId,
    region,
    title: "Changes saved",
    description: "Your workspace preferences have been synchronized.",
    showProgress: true,
  }),
);

// 3. Track an async Promise lifecycle automatically
toaster.promise(uploadFile(), ({ toastId, region, state, data, error }) =>
  Toast({
    toastId,
    region,
    persistent: state === "pending",
    showProgress: state !== "pending",
    title: state === "pending" ? "Uploading..." : state === "fulfilled" ? "Uploaded!" : "Error",
    description: state === "fulfilled" ? data : error?.message,
  }),
);

// 4. Tier 2 Fine-Grained Coordinator
toaster.show(({ toastId, region }) => {
  const t = createToast({ toastId, region });
  return t.Root({}, [
    t.Title({}, "Custom Toast"),
    t.Description({}, "Fine-grained sub-part composition."),
    t.CloseButton({}, "✕"),
    t.ProgressTrack({}, [t.ProgressFill({})]),
  ]);
});`,
    }),
  ]);
}, "ToastShowcase");

