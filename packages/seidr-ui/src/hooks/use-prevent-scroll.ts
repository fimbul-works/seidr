import {
  type EffectDependency,
  getAppState,
  getDocument,
  isObservable,
  isServer,
  type ObservableValue,
  type ReactiveValue,
  unwrapValue,
  useEffect,
  wrapValue,
} from "@fimbul-works/seidr";

const PREVENT_SCROLL_REFCOUNT_KEY = "seidr-ui.prevent-scroll:ref-count";
const PREVENT_SCROLL_ORIGINAL_STYLES_KEY = "seidr-ui.prevent-scroll:original-styles";

interface OriginalStyles {
  overflow: string;
  paddingRight: string;
}

export interface UsePreventScrollProps {
  /** Whether scroll lock is disabled or inactive. Defaults to false (active). */
  isDisabled?: ReactiveValue<boolean>;
  /** Optional owner document. Defaults to current active document. */
  ownerDocument?: Document | ObservableValue<Document | undefined>;
}

/**
 * Prevents body scrolling when active by setting body overflow to "hidden"
 * and compensating for scrollbar width with padding-right.
 * Uses a ref count to support nested/stacked dialogs safely.
 */
export function usePreventScroll(props: UsePreventScrollProps = {}): void {
  if (isServer()) {
    return;
  }

  const isDisabled = wrapValue(props.isDisabled ?? false);
  const deps = [isDisabled, props.ownerDocument].filter(isObservable) as EffectDependency[];

  useEffect(() => {
    if (isDisabled()) {
      return;
    }

    const doc = unwrapValue(props.ownerDocument) ?? getDocument();
    const body = doc.body;
    if (!body) {
      return;
    }

    const appState = getAppState();
    const currentCount = appState.getData<number>(PREVENT_SCROLL_REFCOUNT_KEY, 0);

    if (currentCount === 0) {
      const originalStyles: OriginalStyles = {
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight,
      };
      appState.setData(PREVENT_SCROLL_ORIGINAL_STYLES_KEY, originalStyles);

      // Check for scrollbar presence to prevent layout shift
      const win = doc.defaultView ?? window;
      const scrollbarWidth = win.innerWidth - doc.documentElement.clientWidth;

      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    appState.setData(PREVENT_SCROLL_REFCOUNT_KEY, currentCount + 1);

    return () => {
      const activeCount = appState.getData<number>(PREVENT_SCROLL_REFCOUNT_KEY, 1) - 1;
      appState.setData(PREVENT_SCROLL_REFCOUNT_KEY, Math.max(0, activeCount));

      if (activeCount <= 0) {
        const originalStyles = appState.getData<OriginalStyles | null>(PREVENT_SCROLL_ORIGINAL_STYLES_KEY, null);
        if (originalStyles) {
          body.style.overflow = originalStyles.overflow;
          body.style.paddingRight = originalStyles.paddingRight;
          appState.setData(PREVENT_SCROLL_ORIGINAL_STYLES_KEY, null);
        }
      }
    };
  }, deps);
}

