import type {
  DerivedValue,
  ObservableValue,
  ReactiveValue,
  Ref,
  SeidrChild,
  SeidrElementProps,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import type {
  UseFormControlOptions,
  UseFormControlResult,
} from "../form-control/types.js";

export type Accept = string | string[] | undefined;

export type FileError =
  | "TOO_MANY_FILES"
  | "FILE_INVALID_TYPE"
  | "FILE_TOO_LARGE"
  | "FILE_TOO_SMALL";

export interface FileRejection {
  file: File;
  errors: FileError[];
}

export type FileFieldRejection = FileRejection;

export interface FileDetails {
  acceptedFiles: File[];
  rejectedFiles: FileRejection[];
}

export interface FileFieldIntlTranslations {
  bytes: string;
  kb: string;
  mb: string;
  gb: string;
  tb: string;
}

export interface UseFileFieldOptions extends UseFormControlOptions {
  /** Localized size labels. */
  translations?: Partial<FileFieldIntlTranslations>;
  /** Whether multiple files can be selected. Defaults to false. */
  multiple?: ReactiveValue<boolean>;
  /** Allowed MIME types or extensions (e.g. "image/*", ".png", ["image/png", ".pdf"]). */
  accept?: ReactiveValue<Accept>;
  /** Maximum number of accepted files. Defaults to 1 (or Infinity if multiple is true without maxFiles). */
  maxFiles?: ReactiveValue<number>;
  /** Whether drag-and-drop into dropzone is enabled. Defaults to true. */
  allowDragAndDrop?: ReactiveValue<boolean>;
  /** Minimum file size in bytes. Defaults to 0. */
  minFileSize?: ReactiveValue<number>;
  /** Maximum file size in bytes. Defaults to Infinity. */
  maxFileSize?: ReactiveValue<number>;
  /** Custom validator returning FileError array or null if valid. */
  validate?: (file: File) => FileError[] | null;
  /** Callback fired when files are accepted. */
  onFileAccept?: (files: File[]) => void;
  /** Callback fired when files are rejected. */
  onFileReject?: (rejections: FileRejection[]) => void;
  /** Callback fired whenever accepted or rejected file lists change. */
  onFileChange?: (details: FileDetails) => void;
}

export interface UseFileFieldResult {
  /** Read-only reactive list of currently accepted files. */
  files: DerivedValue<File[]>;
  /** Read-only reactive list of rejected files from the most recent selection. */
  rejectedFiles: DerivedValue<FileRejection[]>;
  /** Reactive state indicating whether files are currently being dragged over the dropzone. */
  isDragging: DerivedValue<boolean>;
  /** Unique ID assigned to the file input. */
  inputId: string;
  /** Reference to the hidden native file input. */
  fileInputRef: Ref<HTMLInputElement>;
  /** Reference to the dropzone element. */
  dropzoneRef: Ref<HTMLElement>;
  /** Localized translation dictionary for byte formatting. */
  translations: FileFieldIntlTranslations;
  /** Reactive multiple attribute. */
  multiple: ObservableValue<boolean>;
  /** Normalized comma-separated accept string. */
  accept: ObservableValue<string | undefined>;
  /** Reactive allowDragAndDrop flag. */
  allowDragAndDrop: ObservableValue<boolean>;
  /** Underlying form control coordinator. */
  formControl: UseFormControlResult;
  /** Derived disabled state. */
  isDisabled: ObservableValue<boolean>;
  /** Derived read-only state. */
  isReadOnly: ObservableValue<boolean>;
  /** Derived required state. */
  isRequired: ObservableValue<boolean>;
  /** Manually sets the dragging state. */
  setIsDragging: (dragging: boolean) => void;
  /** Invokes the native file picker dialog. */
  openFilePicker: () => void;
  /** Evaluates and processes raw files according to acceptance and size rules. */
  processFiles: (files: File[]) => void;
  /** Removes an accepted file from the list. */
  removeFile: (file: File) => void;
  /** Clears all accepted and rejected files. */
  clearFiles: () => void;
}

// ---------------------------------------------------------------------------
// Subcomponent Options & Props
// ---------------------------------------------------------------------------

export interface FileFieldRootOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseFileFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldRootProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FileFieldRootOptions<T> & SeidrElementProps<T>;

export interface FileFieldDropzoneOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseFileFieldResult;
  dataComponent?: string;
  ariaLabel?: string;
  role?: string;
  tabIndex?: number | ObservableValue<number>;
  tabindex?: number | ObservableValue<number>;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldDropzoneProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FileFieldDropzoneOptions<T> & SeidrElementProps<T>;

export interface FileFieldHiddenInputOptions {
  as?: "input";
  instance?: UseFileFieldResult;
  dataComponent?: string;
}
export type FileFieldHiddenInputProps = FileFieldHiddenInputOptions &
  Omit<SeidrElementProps<"input">, "type">;

export interface FileFieldTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  instance?: UseFileFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> =
  FileFieldTriggerOptions<T> & SeidrElementProps<T>;

export interface FileFieldLabelOptions<T extends keyof SeidrElementTagNameMap = "label"> {
  as?: T;
  instance?: UseFileFieldResult;
  dataComponent?: string;
  for?: string;
  htmlFor?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldLabelProps<T extends keyof SeidrElementTagNameMap = "label"> =
  FileFieldLabelOptions<T> & SeidrElementProps<T>;

export interface FileFieldItemListOptions<T extends keyof SeidrElementTagNameMap = "ul"> {
  as?: T;
  instance?: UseFileFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldItemListProps<T extends keyof SeidrElementTagNameMap = "ul"> =
  FileFieldItemListOptions<T> & SeidrElementProps<T>;

export interface FileFieldItemOptions<T extends keyof SeidrElementTagNameMap = "li"> {
  as?: T;
  instance?: UseFileFieldResult;
  file: File | ObservableValue<File>;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldItemProps<T extends keyof SeidrElementTagNameMap = "li"> =
  FileFieldItemOptions<T> & SeidrElementProps<T>;

export interface FileFieldItemNameOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseFileFieldResult;
  file?: File | ObservableValue<File>;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldItemNameProps<T extends keyof SeidrElementTagNameMap = "span"> =
  FileFieldItemNameOptions<T> & SeidrElementProps<T>;

export interface FileFieldItemSizeOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseFileFieldResult;
  file?: File | ObservableValue<File>;
  precision?: number;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldItemSizeProps<T extends keyof SeidrElementTagNameMap = "span"> =
  FileFieldItemSizeOptions<T> & SeidrElementProps<T>;

export interface FileFieldItemPreviewOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  as?: T;
  instance?: UseFileFieldResult;
  file?: File | ObservableValue<File>;
  type?: string;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldItemPreviewProps<T extends keyof SeidrElementTagNameMap = "div"> =
  FileFieldItemPreviewOptions<T> & SeidrElementProps<T>;

export interface FileFieldItemPreviewImageOptions<T extends keyof SeidrElementTagNameMap = "img"> {
  as?: T;
  instance?: UseFileFieldResult;
  file?: File | ObservableValue<File>;
  alt?: string;
  dataComponent?: string;
}
export type FileFieldItemPreviewImageProps =
  FileFieldItemPreviewImageOptions<"img"> & Omit<SeidrElementProps<"img">, "src">;

export interface FileFieldItemDeleteTriggerOptions<T extends keyof SeidrElementTagNameMap = "button"> {
  as?: T;
  instance?: UseFileFieldResult;
  file: File | ObservableValue<File>;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldItemDeleteTriggerProps<T extends keyof SeidrElementTagNameMap = "button"> =
  FileFieldItemDeleteTriggerOptions<T> & SeidrElementProps<T>;

export interface FileFieldDescriptionOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseFileFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldDescriptionProps<T extends keyof SeidrElementTagNameMap = "span"> =
  FileFieldDescriptionOptions<T> & SeidrElementProps<T>;

export interface FileFieldErrorMessageOptions<T extends keyof SeidrElementTagNameMap = "span"> {
  as?: T;
  instance?: UseFileFieldResult;
  dataComponent?: string;
  children?: SeidrChild | SeidrChild[];
}
export type FileFieldErrorMessageProps<T extends keyof SeidrElementTagNameMap = "span"> =
  FileFieldErrorMessageOptions<T> & SeidrElementProps<T>;

// ---------------------------------------------------------------------------
// Coordinator Instance (Tier 2) & High-Level Component Props (Tier 1)
// ---------------------------------------------------------------------------

export interface FileFieldInstance extends UseFileFieldResult {
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: FileFieldRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Dropzone: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: FileFieldDropzoneProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  HiddenInput: (
    props?: FileFieldHiddenInputProps,
  ) => HTMLInputElement;
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props?: FileFieldTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Label: <T extends keyof SeidrElementTagNameMap = "label">(
    props?: FileFieldLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemList: <T extends keyof SeidrElementTagNameMap = "ul">(
    props?: FileFieldItemListProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Item: <T extends keyof SeidrElementTagNameMap = "li">(
    props: FileFieldItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemName: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: FileFieldItemNameProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemSize: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: FileFieldItemSizeProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ItemPreview: <T extends keyof SeidrElementTagNameMap = "div">(
    props?: FileFieldItemPreviewProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => DerivedValue<SeidrElementTagNameMap[T] | null>;
  ItemPreviewImage: (
    props?: FileFieldItemPreviewImageProps,
  ) => SeidrChild;
  ItemDeleteTrigger: <T extends keyof SeidrElementTagNameMap = "button">(
    props: FileFieldItemDeleteTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  Description: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: FileFieldDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
  ErrorMessage: <T extends keyof SeidrElementTagNameMap = "span">(
    props?: FileFieldErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];
}

export type FileFieldProps<T extends keyof SeidrElementTagNameMap = "div"> =
  UseFileFieldOptions & {
    as?: T;
    label?: SeidrChild;
    description?: SeidrChild;
    errorMessage?: SeidrChild;
    dropzoneText?: SeidrChild;
    triggerText?: SeidrChild;
    showItemList?: boolean;
    rootProps?: FileFieldRootProps<T>;
    dropzoneProps?: FileFieldDropzoneProps<"div">;
    hiddenInputProps?: FileFieldHiddenInputProps;
    triggerProps?: FileFieldTriggerProps<"button">;
    itemListProps?: FileFieldItemListProps<"ul">;
    children?: SeidrChild | SeidrChild[];
  } & Omit<SeidrElementProps<T>, "children" | "id">;
