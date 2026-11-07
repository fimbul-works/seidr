import {
  createComponent,
  mount,
  type SeidrChild,
} from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createFileField, FileField } from "./index.js";

describeDualMode("FileField", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => SeidrChild) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  it("should render default structure, roles, and semantic data attributes (Tier 1)", () => {
    const root = setup(() =>
      FileField({
        id: "test-file-field",
        label: "Upload Document",
        description: "PDF or PNG up to 5MB",
        dropzoneText: "Drag and drop your files here",
        triggerText: "Browse Files",
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    expect(rootEl).not.toBeNull();
    expect(rootEl.getAttribute("role")).toBe("group");
    expect(rootEl.getAttribute("data-component")).toBe("file-field");

    const label = root.querySelector("[data-part='label']") as HTMLElement;
    expect(label).not.toBeNull();
    expect(label.textContent).toBe("Upload Document");

    const desc = root.querySelector("[data-part='description']") as HTMLElement;
    expect(desc).not.toBeNull();
    expect(desc.textContent).toBe("PDF or PNG up to 5MB");

    const dropzone = root.querySelector("[data-part='dropzone']") as HTMLElement;
    expect(dropzone).not.toBeNull();
    expect(dropzone.getAttribute("role")).toBe("region");
    expect(dropzone.getAttribute("aria-label")).toBe("dropzone");
    expect(dropzone.getAttribute("data-dragging")).toBe("false");

    const trigger = root.querySelector("[data-part='trigger']") as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.textContent).toBe("Browse Files");

    const hiddenInput = root.querySelector("input") as HTMLInputElement;
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput.type).toBe("file");
    expect(hiddenInput.getAttribute("aria-hidden")).toBe("true");
    expect(String(hiddenInput.getAttribute("tabindex"))).toBe("-1");
    expect(label.getAttribute("for")).toBe(hiddenInput.id);
  });

  it("supports fine-grained composition via createFileField (Tier 2)", () => {
    let ffInst!: ReturnType<typeof createFileField>;

    const root = setup(() => {
      ffInst = createFileField({
        id: "custom-file-field",
        multiple: true,
      });

      return ffInst.Root({}, [
        ffInst.Label({}, "Select Images"),
        ffInst.Dropzone({}, [
          ffInst.Trigger({}, "Choose"),
        ]),
        ffInst.HiddenInput(),
        ffInst.Description({}, "Multiple files supported"),
      ]);
    });

    const dropzone = root.querySelector("[data-part='dropzone']") as HTMLElement;
    expect(dropzone).not.toBeNull();
    expect(dropzone.getAttribute("role")).toBe("button");
    expect(String(dropzone.getAttribute("tabindex"))).toBe("0");
    expect(root.querySelector("[data-part='trigger']")).not.toBeNull();
    expect(root.querySelector("input")).not.toBeNull();
    expect(ffInst.multiple()).toBe(true);
  });

  if (!isSSR) {
    describe("Browser Interactivity", () => {
      it("processes files selected via hidden file input", () => {
        const acceptSpy = vi.fn();
        const changeSpy = vi.fn();
        let ffInst!: ReturnType<typeof createFileField>;

        const root = setup(() => {
          ffInst = createFileField({
            onFileAccept: acceptSpy,
            onFileChange: changeSpy,
          });

          return ffInst.Root({}, [
            ffInst.Dropzone({}, [ffInst.Trigger({}, "Upload")]),
            ffInst.HiddenInput(),
            ffInst.ItemList({}, [
              ffInst.Item({ file: new File(["content"], "report.pdf", { type: "application/pdf" }) }, [
                ffInst.ItemName({ file: new File(["content"], "report.pdf", { type: "application/pdf" }) }),
                ffInst.ItemSize({ file: new File(["content"], "report.pdf", { type: "application/pdf" }) }),
              ]),
            ]),
          ]);
        });

        const testFile = new File(["test file data"], "invoice.pdf", {
          type: "application/pdf",
        });

        ffInst.processFiles([testFile]);

        expect(ffInst.files().length).toBe(1);
        expect(ffInst.files()[0].name).toBe("invoice.pdf");
        expect(acceptSpy).toHaveBeenCalledWith([testFile]);
        expect(changeSpy).toHaveBeenCalled();
      });

      it("supports drag and drop interactions on dropzone", () => {
        let ffInst!: ReturnType<typeof createFileField>;

        const root = setup(() => {
          ffInst = createFileField({
            multiple: true,
          });

          return ffInst.Root({}, [
            ffInst.Dropzone({}, [ffInst.Trigger({}, "Browse")]),
            ffInst.HiddenInput(),
          ]);
        });

        const dropzone = root.querySelector("[data-part='dropzone']") as HTMLElement;

        const dragOverEvent = new Event("dragover", {
          bubbles: true,
          cancelable: true,
        }) as any;
        dragOverEvent.dataTransfer = {
          types: ["Files"],
          dropEffect: "none",
        };

        dropzone.dispatchEvent(dragOverEvent);
        expect(dropzone.getAttribute("data-dragging")).toBe("true");
        expect(ffInst.isDragging()).toBe(true);

        const dragLeaveEvent = new Event("dragleave", {
          bubbles: true,
          cancelable: true,
        });
        dropzone.dispatchEvent(dragLeaveEvent);
        expect(dropzone.getAttribute("data-dragging")).toBe("false");
        expect(ffInst.isDragging()).toBe(false);

        const dropFile = new File(["dropped content"], "sample.png", {
          type: "image/png",
        });
        const dropEvent = new Event("drop", {
          bubbles: true,
          cancelable: true,
        }) as any;
        dropEvent.dataTransfer = {
          types: ["Files"],
          files: [dropFile],
        };

        dropzone.dispatchEvent(dropEvent);
        expect(dropzone.getAttribute("data-dragging")).toBe("false");
        expect(ffInst.files().length).toBe(1);
        expect(ffInst.files()[0].name).toBe("sample.png");
      });

      it("enforces file type validation with accept", () => {
        const rejectSpy = vi.fn();
        let ffInst!: ReturnType<typeof createFileField>;

        setup(() => {
          ffInst = createFileField({
            accept: "image/*",
            onFileReject: rejectSpy,
          });

          return ffInst.Root({}, [
            ffInst.Dropzone(),
            ffInst.HiddenInput(),
          ]);
        });

        const textFile = new File(["plain text"], "notes.txt", {
          type: "text/plain",
        });

        ffInst.processFiles([textFile]);

        expect(ffInst.files().length).toBe(0);
        expect(ffInst.rejectedFiles().length).toBe(1);
        expect(ffInst.rejectedFiles()[0].errors).toContain("FILE_INVALID_TYPE");
        expect(rejectSpy).toHaveBeenCalled();
      });

      it("enforces file size validation with minFileSize and maxFileSize", () => {
        const rejectSpy = vi.fn();
        let ffInst!: ReturnType<typeof createFileField>;

        setup(() => {
          ffInst = createFileField({
            maxFileSize: 50,
            minFileSize: 10,
            onFileReject: rejectSpy,
          });

          return ffInst.Root({}, [
            ffInst.Dropzone(),
            ffInst.HiddenInput(),
          ]);
        });

        const tooSmall = new File(["tiny"], "tiny.txt", { type: "text/plain" }); // 4 bytes
        ffInst.processFiles([tooSmall]);
        expect(ffInst.rejectedFiles()[0].errors).toContain("FILE_TOO_SMALL");

        const largeBytes = new Uint8Array(100);
        const tooLarge = new File([largeBytes], "large.dat", {
          type: "application/octet-stream",
        });
        ffInst.processFiles([tooLarge]);
        expect(ffInst.rejectedFiles()[0].errors).toContain("FILE_TOO_LARGE");
      });

      it("enforces file quantity limits with multiple and maxFiles", () => {
        let ffInst!: ReturnType<typeof createFileField>;

        setup(() => {
          ffInst = createFileField({
            multiple: false,
            maxFiles: 1,
          });

          return ffInst.Root({}, [
            ffInst.Dropzone(),
            ffInst.HiddenInput(),
          ]);
        });

        const file1 = new File(["a"], "a.txt", { type: "text/plain" });
        const file2 = new File(["b"], "b.txt", { type: "text/plain" });

        // Passing 2 files when multiple is false
        ffInst.processFiles([file1, file2]);
        expect(ffInst.files().length).toBe(0);
        expect(ffInst.rejectedFiles().length).toBe(2);
        expect(ffInst.rejectedFiles()[0].errors).toContain("TOO_MANY_FILES");
      });

      it("deletes a file via ItemDeleteTrigger", () => {
        let ffInst!: ReturnType<typeof createFileField>;

        const fileA = new File(["content A"], "a.txt", { type: "text/plain" });
        const fileB = new File(["content B"], "b.txt", { type: "text/plain" });

        const root = setup(() => {
          ffInst = createFileField({
            multiple: true,
          });

          return ffInst.Root({}, [
            ffInst.Dropzone(),
            ffInst.HiddenInput(),
            ffInst.ItemList({}, [
              ffInst.Item({ file: fileA }, [
                ffInst.ItemName({ file: fileA }),
                ffInst.ItemDeleteTrigger({ file: fileA }, "Delete A"),
              ]),
            ]),
          ]);
        });

        ffInst.processFiles([fileA, fileB]);
        expect(ffInst.files().length).toBe(2);

        const deleteBtn = root.querySelector("[data-part='item-delete-trigger']") as HTMLButtonElement;
        expect(deleteBtn).not.toBeNull();
        deleteBtn.click();

        expect(ffInst.files().length).toBe(1);
        expect(ffInst.files()[0].name).toBe("b.txt");
      });

      it("creates and revokes image preview object URLs cleanly", () => {
        const createSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-preview-url");
        const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

        const imageFile = new File(["fake-image-bytes"], "picture.png", {
          type: "image/png",
        });

        const root = setup(() =>
          FileField({
            id: "img-test",
          }),
        );

        let imgPreviewEl!: HTMLElement;
        const subApp = createComponent(() => {
          const ff = createFileField();
          return ff.ItemPreviewImage({ file: imageFile });
        });

        const subTarget = getDocument().createElement("div");
        getDocument().body.appendChild(subTarget);
        const subUnmount = mount(subApp, subTarget);

        expect(createSpy).toHaveBeenCalledWith(imageFile);
        const img = subTarget.querySelector("img") as HTMLImageElement;
        expect(img).not.toBeNull();
        expect(img.src).toContain("blob:mock-preview-url");

        // Unmount should revoke object URL
        subUnmount();
        expect(revokeSpy).toHaveBeenCalledWith("blob:mock-preview-url");
        subTarget.remove();

        createSpy.mockRestore();
        revokeSpy.mockRestore();
      });

      it("respects disabled state", () => {
        let ffInst!: ReturnType<typeof createFileField>;

        const root = setup(() => {
          ffInst = createFileField({
            disabled: true,
          });

          return ffInst.Root({}, [
            ffInst.Dropzone({}, [ffInst.Trigger({}, "Upload")]),
            ffInst.HiddenInput(),
          ]);
        });

        const dropzone = root.querySelector("[data-part='dropzone']") as HTMLElement;
        expect(dropzone.getAttribute("aria-disabled")).toBe("true");
        expect(dropzone.getAttribute("tabindex")).toBe("-1");

        const trigger = root.querySelector("[data-part='trigger']") as HTMLButtonElement;
        expect(trigger.disabled).toBe(true);

        const input = root.querySelector("input") as HTMLInputElement;
        expect(input.disabled).toBe(true);

        const file = new File(["data"], "test.txt", { type: "text/plain" });
        ffInst.processFiles([file]);
        // Disabled should prevent processing files
        expect(ffInst.files().length).toBe(0);
      });

      it("has no accessibility violations (axe)", async () => {
        const root = setup(() =>
          FileField({
            id: "axe-file-field",
            label: "Documents",
            description: "Attach your invoices below",
            dropzoneText: "Drop files or browse",
            triggerText: "Browse Files",
          }),
        );

        const results = await axe(root);
        expect(results).toHaveNoViolations();
      });
    });
  }
});
