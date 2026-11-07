import {
  createComponent,
  createValue,
  List,
  Show,
} from "@fimbul-works/seidr";
import {
  $div,
  $h2,
  $h3,
  $p,
  $section,
  $span,
} from "@fimbul-works/seidr/html";
import {
  createFileField,
  FileField,
  type FileRejection,
} from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./file-field.css";

export const FileFieldShowcase = createComponent(() => {
  // Live states for demo feedback
  const docFilesCount = createValue(0);
  const imageFilesCount = createValue(0);
  const rejections = createValue<FileRejection[]>([]);

  // Fine-grained coordinator for Section 3 (Custom validation & rejections display)
  const customFileField = createFileField({
    accept: ["image/*", ".pdf"],
    maxFileSize: 2 * 1024 * 1024, // 2MB limit
    multiple: true,
    maxFiles: 3,
    onFileReject: (rej) => {
      rejections(rej);
    },
    onFileAccept: () => {
      rejections([]);
    },
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "FileField"),
      $span({ className: "card-badge" }, "Form / Upload"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible drag-and-drop and file-picker interface featuring automatic MIME/size validation, thumbnail previews, clean object-URL lifecycle cleanup, and form control integration.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "file-field-showcase" }, [
        // 1. Basic Single Document Upload (Tier 1)
        $div({ className: "file-field-section" }, [
          $h3(
            { className: "file-field-heading" },
            "1. Single Document Upload (Tier 1 All-in-One)",
          ),
          $p(
            { className: "file-field-subtext" },
            "Accepts a single document (PDF or DOCX). Selecting a new document replaces the previous one.",
          ),
          FileField({
            id: "doc-upload",
            label: "Identity Document or Resume",
            description: "Supported formats: .pdf, .docx, up to 10MB",
            accept: [".pdf", ".docx"],
            multiple: false,
            dropzoneText: "Drag & drop your document here, or",
            triggerText: "Browse Files",
            onFileChange: (details) => {
              docFilesCount(details.acceptedFiles.length);
            },
          }),
          $span(
            {
              className: "file-status-badge",
              dataActive: docFilesCount.as((c) => (c > 0 ? "true" : "false")),
            },
            docFilesCount.as((c) =>
              c > 0 ? "✓ 1 document uploaded" : "No document uploaded yet",
            ),
          ),
        ]),

        // 2. Multiple Images with Previews (Tier 1)
        $div({ className: "file-field-section" }, [
          $h3(
            { className: "file-field-heading" },
            "2. Gallery Image Upload (Tier 1 with Previews)",
          ),
          $p(
            { className: "file-field-subtext" },
            "Accepts up to 4 images (JPG, PNG, WebP) with automatic thumbnail previews and object-URL revoking.",
          ),
          FileField({
            id: "gallery-upload",
            label: "Photo Gallery",
            description: "Upload up to 4 photos",
            accept: "image/*",
            multiple: true,
            maxFiles: 4,
            dropzoneText: "Drag your photos here, or",
            triggerText: "Select Photos",
            onFileChange: (details) => {
              imageFilesCount(details.acceptedFiles.length);
            },
          }),
          $span(
            {
              className: "file-status-badge",
              dataActive: imageFilesCount.as((c) => (c > 0 ? "true" : "false")),
            },
            imageFilesCount.as((c) => `Uploaded: ${c} / 4 photos`),
          ),
        ]),

        // 3. Fine-Grained Sculpting with Rejections Alert (Tier 2)
        $div({ className: "file-field-section" }, [
          $h3(
            { className: "file-field-heading" },
            "3. Fine-Grained Coordinator with Validation (Tier 2)",
          ),
          $p(
            { className: "file-field-subtext" },
            "Strict 2MB limit per file. Rejections are captured reactively and surfaced in a custom alert.",
          ),
          customFileField.Root({}, [
            customFileField.Label({}, "Profile Media"),
            customFileField.Description(
              {},
              "Images or PDFs only · Max 2MB per file · Max 3 files",
            ),
            customFileField.Dropzone({}, [
              $p(
                { style: { margin: 0, marginBottom: "0.5rem" } },
                "Drop files here or click to open picker",
              ),
              customFileField.Trigger({}, "Choose Media"),
            ]),
            customFileField.HiddenInput(),

            // Custom Rejection Notification
            Show(
              rejections.as((r) => r.length > 0),
              () =>
                $div(
                  { className: "rejection-alert" },
                  rejections.as((rejList) =>
                    rejList.map((rej) =>
                      $span(
                        {},
                        `⚠️ "${rej.file.name}" rejected: ${rej.errors.join(", ")}`,
                      ),
                    ),
                  ),
                ),
            ),

            // Fine-grained Item List
            customFileField.ItemList({}, [
              List(
                customFileField.files,
                (f) => `${f.name}-${f.size}-${f.lastModified}`,
                (fileVal) =>
                  customFileField.Item({ file: fileVal }, [
                    $div({ className: "file-item-left" }, [
                      customFileField.ItemPreviewImage({ file: fileVal }),
                      $div({ className: "file-item-meta" }, [
                        customFileField.ItemName({ file: fileVal }),
                        customFileField.ItemSize({
                          file: fileVal,
                          precision: 1,
                        }),
                      ]),
                    ]),
                    customFileField.ItemDeleteTrigger(
                      { file: fileVal },
                      "✕",
                    ),
                  ]),
              ),
            ]),
          ]),
        ]),
      ]),
    ]),

    // Documentation / Usage Snippet
    CodeBlock({
      language: "typescript",
      code: `import { FileField, createFileField } from "@fimbul-works/seidr-ui";

// --- Tier 1: All-in-One Component ---
const MyUploader = () =>
  FileField({
    label: "Attach Documents",
    description: "PDF or PNG up to 5MB",
    accept: ["image/png", ".pdf"],
    multiple: true,
    maxFiles: 5,
    onFileChange: ({ acceptedFiles, rejectedFiles }) => {
      console.log("Accepted:", acceptedFiles, "Rejected:", rejectedFiles);
    },
  });

// --- Tier 2: Fine-Grained Coordinator ---
const ff = createFileField({
  accept: "image/*",
  maxFileSize: 2 * 1024 * 1024,
  multiple: true,
});

const CustomUploader = () =>
  ff.Root({}, [
    ff.Label({}, "Profile Photos"),
    ff.Dropzone({}, [
      ff.Trigger({}, "Browse"),
    ]),
    ff.HiddenInput(),
    ff.ItemList({}, [
      List(ff.files, f => f.name, (fileVal) =>
        ff.Item({ file: fileVal }, [
          ff.ItemPreviewImage({ file: fileVal }),
          ff.ItemName({ file: fileVal }),
          ff.ItemSize({ file: fileVal }),
          ff.ItemDeleteTrigger({ file: fileVal }, "✕"),
        ])
      ),
    ]),
  ]);`,
    }),
  ]);
});

