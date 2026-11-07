import type {
  DerivedValue,
  SeidrChild,
  SeidrElementTagNameMap,
} from "@fimbul-works/seidr";
import { FileFieldDescription } from "./file-field-description.js";
import { FileFieldDropzone } from "./file-field-dropzone.js";
import { FileFieldErrorMessage } from "./file-field-error-message.js";
import { FileFieldHiddenInput } from "./file-field-hidden-input.js";
import { FileFieldItemDeleteTrigger } from "./file-field-item-delete-trigger.js";
import { FileFieldItemList } from "./file-field-item-list.js";
import { FileFieldItemName } from "./file-field-item-name.js";
import { FileFieldItemPreviewImage } from "./file-field-item-preview-image.js";
import { FileFieldItemPreview } from "./file-field-item-preview.js";
import { FileFieldItemSize } from "./file-field-item-size.js";
import { FileFieldItem } from "./file-field-item.js";
import { FileFieldLabel } from "./file-field-label.js";
import { FileFieldRoot } from "./file-field-root.js";
import { FileFieldTrigger } from "./file-field-trigger.js";
import type {
  FileFieldDescriptionProps,
  FileFieldDropzoneProps,
  FileFieldErrorMessageProps,
  FileFieldHiddenInputProps,
  FileFieldInstance,
  FileFieldItemDeleteTriggerProps,
  FileFieldItemListProps,
  FileFieldItemNameProps,
  FileFieldItemPreviewImageProps,
  FileFieldItemPreviewProps,
  FileFieldItemProps,
  FileFieldItemSizeProps,
  FileFieldLabelProps,
  FileFieldRootProps,
  FileFieldTriggerProps,
  UseFileFieldOptions,
} from "./types.js";
import { useFileField } from "./use-file-field.js";

/**
 * Creates a headless coordinator for a FileField system (Tier 2).
 * Returns pre-bound element helpers and fine-grained reactive state.
 */
export function createFileField(
  options: UseFileFieldOptions = {},
): FileFieldInstance {
  const fileField = useFileField(options);

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: FileFieldRootProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldRoot<T>(
      { instance: fileField, ...props } as FileFieldRootProps<T>,
      children,
    );

  const Dropzone = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: FileFieldDropzoneProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldDropzone<T>(
      { instance: fileField, ...props } as FileFieldDropzoneProps<T>,
      children,
    );

  const HiddenInput = (
    props?: FileFieldHiddenInputProps,
  ): HTMLInputElement =>
    FileFieldHiddenInput({
      instance: fileField,
      ...props,
    });

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props?: FileFieldTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldTrigger<T>(
      { instance: fileField, ...props } as FileFieldTriggerProps<T>,
      children,
    );

  const Label = <T extends keyof SeidrElementTagNameMap = "label">(
    props?: FileFieldLabelProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldLabel<T>(
      { instance: fileField, ...props } as FileFieldLabelProps<T>,
      children,
    );

  const ItemList = <T extends keyof SeidrElementTagNameMap = "ul">(
    props?: FileFieldItemListProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldItemList<T>(
      { instance: fileField, ...props } as FileFieldItemListProps<T>,
      children,
    );

  const Item = <T extends keyof SeidrElementTagNameMap = "li">(
    props: FileFieldItemProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldItem<T>(
      { instance: fileField, ...props } as FileFieldItemProps<T>,
      children,
    );

  const ItemName = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: FileFieldItemNameProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldItemName<T>(
      { instance: fileField, ...props } as FileFieldItemNameProps<T>,
      children,
    );

  const ItemSize = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: FileFieldItemSizeProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldItemSize<T>(
      { instance: fileField, ...props } as FileFieldItemSizeProps<T>,
      children,
    );

  const ItemPreview = <T extends keyof SeidrElementTagNameMap = "div">(
    props?: FileFieldItemPreviewProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): DerivedValue<SeidrElementTagNameMap[T] | null> =>
    FileFieldItemPreview<T>(
      { instance: fileField, ...props } as FileFieldItemPreviewProps<T>,
      children,
    );

  const ItemPreviewImage = (
    props?: FileFieldItemPreviewImageProps,
  ): SeidrChild =>
    FileFieldItemPreviewImage({
      instance: fileField,
      ...props,
    });

  const ItemDeleteTrigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: FileFieldItemDeleteTriggerProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldItemDeleteTrigger<T>(
      { instance: fileField, ...props } as FileFieldItemDeleteTriggerProps<T>,
      children,
    );

  const Description = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: FileFieldDescriptionProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldDescription<T>(
      { instance: fileField, ...props } as FileFieldDescriptionProps<T>,
      children,
    );

  const ErrorMessage = <T extends keyof SeidrElementTagNameMap = "span">(
    props?: FileFieldErrorMessageProps<T>,
    children?: SeidrChild | SeidrChild[],
  ): SeidrElementTagNameMap[T] =>
    FileFieldErrorMessage<T>(
      { instance: fileField, ...props } as FileFieldErrorMessageProps<T>,
      children,
    );

  return {
    ...fileField,
    Root,
    Dropzone,
    HiddenInput,
    Trigger,
    Label,
    ItemList,
    Item,
    ItemName,
    ItemSize,
    ItemPreview,
    ItemPreviewImage,
    ItemDeleteTrigger,
    Description,
    ErrorMessage,
  };
}
