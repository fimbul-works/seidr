import {
  $,
  createComponent,
  createValue,
  isClient,
  isValue,
  onUnmounted,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  unwrapValue,
} from "@fimbul-works/seidr";
import type { FileFieldItemPreviewImageProps } from "./types.js";

/**
 * Thumbnail image preview for image files, managing URL.createObjectURL lifecycle cleanly with onUnmounted.
 */
export const FileFieldItemPreviewImage = createComponent(
  (
    props: FileFieldItemPreviewImageProps = {} as FileFieldItemPreviewImageProps,
  ): SeidrElementTagNameMap["img"] => {
    const {
      as = "img",
      file,
      alt: userAlt,
      instance,
      dataComponent = "file-field",
      ...rest
    } = props;

    const rawFile = unwrapValue(file);
    const defaultAlt = rawFile?.name ?? "File preview";
    const urlValue = createValue<string>("");

    if (isClient()) {
      let activeUrl = "";

      const updateUrl = (f: File | null | undefined) => {
        if (activeUrl) {
          URL.revokeObjectURL(activeUrl);
          activeUrl = "";
        }
        if (f && f.type.startsWith("image/")) {
          activeUrl = URL.createObjectURL(f);
          urlValue(activeUrl);
        } else {
          urlValue("");
        }
      };

      updateUrl(rawFile);

      if (isValue<File>(file)) {
        file.watch((f) => {
          updateUrl(f);
        });
      }

      onUnmounted(() => {
        if (activeUrl) {
          URL.revokeObjectURL(activeUrl);
          activeUrl = "";
        }
      });
    }

    return $(
      as,
      {
        src: urlValue,
        alt: userAlt ?? defaultAlt,
        dataComponent,
        dataPart: "item-preview-image",
        ...rest,
      } as SeidrElementProps<"img">,
    );
  },
  "FileFieldItemPreviewImage",
);
