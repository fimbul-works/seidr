import {
  createRef,
  createValue,
  unwrapValue,
  useId,
  wrapValue,
} from "@fimbul-works/seidr";
import { useFormControl } from "../form-control/use-form-control.js";
import type {
  FileDetails,
  FileFieldIntlTranslations,
  UseFileFieldOptions,
  UseFileFieldResult,
} from "./types.js";
import {
  DEFAULT_FILE_FIELD_INTL,
  getFiles,
  parseAcceptedTypes,
} from "./util.js";

/**
 * Headless state and coordination hook for FileField.
 */
export function useFileField(options: UseFileFieldOptions = {}): UseFileFieldResult {
  const {
    translations: userTranslations,
    multiple: userMultiple = false,
    accept: userAccept,
    maxFiles: userMaxFiles,
    allowDragAndDrop: userAllowDragAndDrop = true,
    minFileSize: userMinFileSize = 0,
    maxFileSize: userMaxFileSize = Number.POSITIVE_INFINITY,
    validate,
    onFileAccept,
    onFileReject,
    onFileChange,
    ...formControlOptions
  } = options;

  const translations: FileFieldIntlTranslations = {
    ...DEFAULT_FILE_FIELD_INTL,
    ...userTranslations,
  };

  const formControl = useFormControl(formControlOptions);
  const inputId = useId("file-field-input");

  const multiple = wrapValue(userMultiple).as((m) => !!m);
  const accept = wrapValue(userAccept).as((a) => parseAcceptedTypes(a));
  const allowDragAndDrop = wrapValue(userAllowDragAndDrop).as((d) => !!d);
  const minFileSize = wrapValue(userMinFileSize).as((s) => s ?? 0);
  const maxFileSize = wrapValue(userMaxFileSize).as(
    (s) => s ?? Number.POSITIVE_INFINITY,
  );
  const maxFiles = wrapValue(userMaxFiles as number | undefined).as((m) => {
    if (m !== undefined) return m;
    return multiple() ? Number.POSITIVE_INFINITY : 1;
  });

  const acceptedFilesState = createValue<File[]>([]);
  const rejectedFilesState = createValue<FileDetails["rejectedFiles"]>([]);
  const isDraggingState = createValue(false);

  const fileInputRef = createRef<HTMLInputElement>();
  const dropzoneRef = createRef<HTMLElement>();

  const isDisabled = formControl.isDisabled;
  const isReadOnly = formControl.isReadOnly;
  const isRequired = formControl.isRequired;

  const openFilePicker = () => {
    if (isDisabled() || isReadOnly()) {
      return;
    }
    const input = fileInputRef();
    if (input) {
      input.click();
    }
  };

  const processFiles = (newFiles: File[]) => {
    if (isDisabled() || isReadOnly()) {
      return;
    }

    const isMulti = multiple();
    const max = maxFiles();
    const minSize = minFileSize();
    const maxSize = maxFileSize();
    const acceptTypes = accept();

    const { acceptedFiles, rejectedFiles } = getFiles(
      newFiles,
      acceptTypes,
      isMulti,
      max,
      minSize,
      maxSize,
      validate,
    );

    if (isMulti) {
      const current = acceptedFilesState();
      let combined = [...current, ...acceptedFiles];
      const rejections = [...rejectedFiles];

      if (combined.length > max) {
        const excess = combined.slice(max);
        combined = combined.slice(0, max);
        for (const file of excess) {
          rejections.push({ file, errors: ["TOO_MANY_FILES"] });
        }
      }

      acceptedFilesState(combined);
      rejectedFilesState(rejections);
    } else {
      if (acceptedFiles.length === 1) {
        acceptedFilesState([acceptedFiles[0]]);
        rejectedFilesState(rejectedFiles);
      } else if (rejectedFiles.length > 0) {
        rejectedFilesState(rejectedFiles);
      }
    }

    if (acceptedFiles.length > 0) {
      onFileAccept?.(acceptedFiles);
    }
    if (rejectedFiles.length > 0) {
      onFileReject?.(rejectedFiles);
    }

    onFileChange?.({
      acceptedFiles: acceptedFilesState(),
      rejectedFiles: rejectedFilesState(),
    });
  };

  const removeFile = (file: File) => {
    if (isDisabled() || isReadOnly()) {
      return;
    }

    const nextFiles = acceptedFilesState().filter((f) => f !== file);
    acceptedFilesState(nextFiles);

    onFileChange?.({
      acceptedFiles: nextFiles,
      rejectedFiles: rejectedFilesState(),
    });
  };

  const clearFiles = () => {
    if (isDisabled() || isReadOnly()) {
      return;
    }

    acceptedFilesState([]);
    rejectedFilesState([]);

    onFileChange?.({
      acceptedFiles: [],
      rejectedFiles: [],
    });
  };

  return {
    files: acceptedFilesState.as((f) => f),
    rejectedFiles: rejectedFilesState.as((rf) => rf),
    isDragging: isDraggingState.as((d) => d),
    inputId,
    fileInputRef,
    dropzoneRef,
    translations,
    multiple,
    accept,
    allowDragAndDrop,
    formControl,
    isDisabled,
    isReadOnly,
    isRequired,
    setIsDragging: (dragging: boolean) => isDraggingState(dragging),
    openFilePicker,
    processFiles,
    removeFile,
    clearFiles,
  };
}
