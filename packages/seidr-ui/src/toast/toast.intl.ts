export const TOAST_HOTKEY_PLACEHOLDER = "{hotkey}";

export const TOAST_INTL_TRANSLATIONS = {
  close: "Close",
};

export type ToastIntlTranslations = typeof TOAST_INTL_TRANSLATIONS;

export const TOAST_REGION_INTL_TRANSLATIONS = {
  notifications: (hotkeyPlaceholder: string) => `Notifications (${hotkeyPlaceholder})`,
};

export type ToastRegionIntlTranslations = typeof TOAST_REGION_INTL_TRANSLATIONS;

