import {
  $,
  createComponent,
  List,
  type ObservableValue,
  type SeidrChild,
  type SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { createFileField } from "./create-file-field.js";
import type { FileFieldProps, FileFieldRootProps } from "./types.js";

/**
 * All-in-One Tier 1 FileField component.
 * Provides an accessible drag-and-drop and file picker interface with automatic
 * validation, file list management, thumbnail previews, and form control integration.
 */
export const FileField = createComponent(
  <T extends keyof SeidrElementTagNameMap = "div">(
    props: FileFieldProps<T> = {} as FileFieldProps<T>,
  ): SeidrElementTagNameMap[T] => {
    const {
      as = "div" as T,
      label,
      description,
      errorMessage,
      dropzoneText,
      triggerText = "Browse files",
      showItemList = true,
      rootProps,
      dropzoneProps,
      hiddenInputProps,
      triggerProps,
      itemListProps,
      children,
      ...fileFieldOptions
    } = props;

    const fileField = createFileField(fileFieldOptions);

    if (children) {
      return fileField.Root(
        { as, ...rootProps } as FileFieldRootProps<T>,
        children,
      );
    }

    const content: (SeidrChild | undefined)[] = [];

    if (label) {
      content.push(fileField.Label({}, label));
    }

    const dropzoneChildren: (SeidrChild | undefined)[] = [];
    if (dropzoneText) {
      dropzoneChildren.push(
        $("p", { style: { margin: 0, marginBottom: "0.5rem" } }, dropzoneText),
      );
    }
    dropzoneChildren.push(fileField.Trigger(triggerProps, triggerText));

    const dropzoneRole = dropzoneProps?.role ?? "region";

    content.push(
      fileField.Dropzone(
        { role: dropzoneRole, ...dropzoneProps },
        dropzoneChildren,
      ),
      fileField.HiddenInput(hiddenInputProps),
    );

    if (description) {
      content.push(fileField.Description({}, description));
    }

    if (errorMessage) {
      content.push(fileField.ErrorMessage({}, errorMessage));
    }

    if (showItemList) {
      const getFileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

      const renderFileItem = (fileVal: ObservableValue<File>) =>
        fileField.Item({ file: fileVal }, [
          fileField.ItemPreviewImage({ file: fileVal }),
          fileField.ItemName({ file: fileVal }),
          fileField.ItemSize({ file: fileVal }),
          fileField.ItemDeleteTrigger({ file: fileVal }, "✕"),
        ]);

      const listItems = List(fileField.files, getFileKey, renderFileItem);
      content.push(fileField.ItemList(itemListProps, [listItems]));
    }

    return fileField.Root(
      { as, ...rootProps } as FileFieldRootProps<T>,
      content,
    );
  },
  "FileField",
);
