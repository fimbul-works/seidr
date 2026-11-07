import type {
  Accept,
  FileError,
  FileFieldIntlTranslations,
  FileRejection,
} from "./types.js";

export const DEFAULT_FILE_FIELD_INTL: FileFieldIntlTranslations = {
  bytes: "Bytes",
  kb: "KB",
  mb: "MB",
  gb: "GB",
  tb: "TB",
};

export function parseAcceptedTypes(accept: Accept): string | undefined {
  if (typeof accept === "string") {
    return accept;
  }
  if (Array.isArray(accept)) {
    return accept.join(",");
  }
  return undefined;
}

export function isFileAccepted(
  file: File | null,
  accept: string | undefined,
): boolean {
  if (!file || !accept) {
    return true;
  }

  const types = accept.split(",");
  const fileName = (file.name || "").toLowerCase();
  const mimeType = (file.type || "").toLowerCase();
  const baseMimeType = mimeType.replace(/\/.*$/, "");

  return types.some((rawType) => {
    const validType = rawType.trim().toLowerCase();
    if (!validType) return false;

    if (validType.startsWith(".")) {
      return fileName.endsWith(validType);
    }

    if (validType.endsWith("/*")) {
      const typeBase = validType.replace(/\/.*$/, "");
      return baseMimeType === typeBase;
    }

    return mimeType === validType;
  });
}

export function isValidFileSize(
  file: File,
  minSize = 0,
  maxSize = Number.POSITIVE_INFINITY,
): [boolean, FileError | null] {
  if (typeof file.size === "number") {
    if (file.size > maxSize) {
      return [false, "FILE_TOO_LARGE"];
    }
    if (file.size < minSize) {
      return [false, "FILE_TOO_SMALL"];
    }
  }
  return [true, null];
}

export function isValidFileType(
  file: File,
  accept: string | undefined,
): [boolean, FileError | null] {
  const isAcceptable =
    file.type === "application/x-moz-file" || isFileAccepted(file, accept);
  return [isAcceptable, isAcceptable ? null : "FILE_INVALID_TYPE"];
}

export function isFilesWithinMaxRange(
  count: number,
  multiple: boolean,
  maxFiles: number,
): boolean {
  if (!multiple && count > 1) {
    return false;
  }
  return count <= maxFiles;
}

export function getFiles(
  files: File[],
  accept: string | undefined,
  multiple: boolean,
  maxFiles: number,
  minFileSize = 0,
  maxFileSize = Number.POSITIVE_INFINITY,
  validate?: (file: File) => FileError[] | null,
): { acceptedFiles: File[]; rejectedFiles: FileRejection[] } {
  const acceptedFiles: File[] = [];
  const rejectedFiles: FileRejection[] = [];

  for (const file of files) {
    const [, acceptError] = isValidFileType(file, accept);
    const [, sizeError] = isValidFileSize(file, minFileSize, maxFileSize);

    const customErrors = validate ? validate(file) : null;
    const isCustomValid = !customErrors || customErrors.length === 0;

    if (!acceptError && !sizeError && isCustomValid) {
      acceptedFiles.push(file);
    } else {
      const errors: FileError[] = [];
      if (acceptError) errors.push(acceptError);
      if (sizeError) errors.push(sizeError);
      if (customErrors) errors.push(...customErrors);
      rejectedFiles.push({ file, errors });
    }
  }

  if (!isFilesWithinMaxRange(acceptedFiles.length, multiple, maxFiles)) {
    for (const file of acceptedFiles) {
      rejectedFiles.push({ file, errors: ["TOO_MANY_FILES"] });
    }
    acceptedFiles.length = 0;
  }

  return { acceptedFiles, rejectedFiles };
}

export function isDragEventWithFiles(event: DragEvent): boolean {
  if (!event.dataTransfer) {
    return !!event.target && "files" in event.target;
  }
  return Array.from(event.dataTransfer.types).some(
    (type) => type === "Files" || type === "application/x-moz-file",
  );
}

export function formatBytes(
  bytes: number,
  precision = 2,
  translations: FileFieldIntlTranslations = DEFAULT_FILE_FIELD_INTL,
): string {
  if (bytes === 0) return `0 ${translations.bytes}`;
  const sizes = [
    translations.bytes,
    translations.kb,
    translations.mb,
    translations.gb,
    translations.tb,
  ];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);
  const formatted = Number.parseFloat((bytes / k ** unitIndex).toFixed(precision));
  return `${formatted} ${sizes[unitIndex]}`;
}

