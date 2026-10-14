import { createValue, getDocument, isServer, onUnmounted, type Value } from "@fimbul-works/seidr";

export type ColorMode = "light" | "dark" | "system";

export interface UseColorModeOptions {
  /** The initial color mode. Defaults to 'system'. */
  initialValue?: ColorMode;

  /** Attribute to set on `document.documentElement` (e.g. 'data-theme'). If not set, toggles 'light'/'dark' classes. */
  attribute?: string;

  /** Storage key to read/write to localStorage. Defaults to 'seidr-color-mode'. Set to null to disable storage. */
  storageKey?: string | null;
}

export interface UseColorModeResult {
  /** The configured color mode: 'light', 'dark', or 'system'. */
  mode: Value<ColorMode>;

  /** The actual active theme: 'light' or 'dark'. */
  resolvedMode: Value<"light" | "dark">;
}

const DEFAULT_STORAGE_KEY = "seidr-color-mode";

/**
 * Manages light, dark, and system color mode preferences.
 * Updates the `class` or `data-theme` attribute on `document.documentElement`.
 */
export function useColorMode(options: UseColorModeOptions = {}): UseColorModeResult {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;

  const getStoredMode = (): ColorMode | null => {
    if (isServer()) {
      return null;
    }
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch {
      // Ignore storage access errors
    }
    return null;
  };

  const getSystemTheme = () =>
    !isServer() && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const initial = getStoredMode() ?? options.initialValue ?? "system";
  const mode = createValue<ColorMode>(initial, { hydrate: false });
  const resolvedMode = mode.as((mode) => (mode === "system" ? getSystemTheme() : mode));

  if (isServer()) {
    return {
      mode,
      resolvedMode,
    };
  }

  const updateResolved = () => {
    const currentMode = mode();
    const theme = currentMode === "system" ? getSystemTheme() : currentMode;

    const root = getDocument().documentElement;
    if (root) {
      if (options.attribute) {
        root.setAttribute(options.attribute, theme);
      } else {
        root.classList.remove("light", "dark");
        root.classList.add(theme);
      }
    }

    try {
      window.localStorage.setItem(storageKey, currentMode);
    } catch {
      // Ignore storage access errors
    }
  };

  if (window.matchMedia) {
    const handleMediaChange = () => mode() === "system" && updateResolved();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
      onUnmounted(() => mediaQuery.removeEventListener("change", handleMediaChange));
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleMediaChange);
      onUnmounted(() => (mediaQuery as any).removeListener(handleMediaChange));
    }
  }

  onUnmounted(mode.bind(updateResolved));

  return {
    mode,
    resolvedMode,
  };
}
