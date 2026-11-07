import {
  $,
  createValue,
  inClient,
  List,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  type Value,
} from "@fimbul-works/seidr";
import { contains, getActiveElement, getOwnerDocument, getOwnerWindow } from "../utils/dom.js";
import { focusWithoutScrolling } from "../utils/focus-without-scrolling.js";
import type { ToastConfig, ToastListProps } from "./types.js";

/**
 * Ordered list (`<ol>`) containing all rendered toasts in a ToastRegion.
 */
export function ToastList<T extends keyof SeidrElementTagNameMap = "ol">(
  props: ToastListProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "ol" as T,
    instance: region,
    id: customId,
    tabIndex = -1,
    dataComponent,
    onfocusin: userOnFocusIn,
    onfocusout: userOnFocusOut,
    onpointermove: userOnPointerMove,
    onpointerleave: userOnPointerLeave,
    ...rest
  } = props;

  if (!region) {
    throw new SeidrError("ToastList requires a ToastRegion instance coordinator");
  }

  let listEl: HTMLElement | undefined;

  const handleFocusIn = (e: FocusEvent) => {
    if (typeof userOnFocusIn === "function") {
      userOnFocusIn.call(listEl as SeidrElementTagNameMap[T], e);
    }
    if (region.pauseOnInteraction() && !region.isPaused()) {
      region.pauseAllTimer();
    }
  };

  const handleFocusOut = (e: FocusEvent) => {
    if (typeof userOnFocusOut === "function") {
      userOnFocusOut.call(listEl as SeidrElementTagNameMap[T], e);
    }
    if (!contains(listEl, e.relatedTarget as Node | null)) {
      region.resumeAllTimer();
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (typeof userOnPointerMove === "function") {
      userOnPointerMove.call(listEl as SeidrElementTagNameMap[T], e);
    }
    if (region.pauseOnInteraction() && !region.isPaused()) {
      region.pauseAllTimer();
    }
  };

  const handlePointerLeave = (e: PointerEvent) => {
    if (typeof userOnPointerLeave === "function") {
      userOnPointerLeave.call(listEl as SeidrElementTagNameMap[T], e);
    }
    if (!contains(listEl, getActiveElement(listEl))) {
      region.resumeAllTimer();
    }
  };

  const renderedList = List(
    region.toasts as unknown as Value<ToastConfig[]>,
    (toast) => toast.id,
    (toastVal) => {
      const initialCfg = toastVal();
      const renderedToast = createValue<SeidrChild>(
        initialCfg.toastComponent({
          toastId: initialCfg.id,
          region,
        }),
        { hydrate: false },
      );

      toastVal.watch((cfg, prevCfg) => {
        if (cfg.toastComponent !== prevCfg.toastComponent) {
          renderedToast(
            cfg.toastComponent({
              toastId: cfg.id,
              region,
            }),
          );
        }
      });

      return renderedToast;
    },
    "ToastRegionList",
  );

  const el = $<T>(
    as,
    {
      id: customId ?? region.generateId("list"),
      tabIndex,
      dataComponent: dataComponent ?? region.dataComponent,
      dataPart: "list",
      onpointermove: handlePointerMove,
      onpointerleave: handlePointerLeave,
      ...rest,
    } as SeidrElementProps<T>,
    [renderedList, children],
  );

  listEl = el;

  inClient(() => {
    const doc = getOwnerDocument(el);
    const win = getOwnerWindow(el);

    el.addEventListener("focusin", handleFocusIn as EventListener);
    el.addEventListener("focusout", handleFocusOut as EventListener);

    const onKeyDown = (event: KeyboardEvent) => {
      if (region.hotkey.length === 0) return;
      const eventRecord = event as unknown as Record<string, unknown>;
      const isHotkeyPressed = region.hotkey.every((key) => Boolean(eventRecord[key]) || event.code === key);
      if (isHotkeyPressed) {
        focusWithoutScrolling(el);
      }
    };

    const onWindowBlur = () => {
      if (region.pauseOnPageIdle()) {
        region.pauseAllTimer();
      }
    };

    const onWindowFocus = () => {
      if (region.pauseOnPageIdle()) {
        region.resumeAllTimer();
      }
    };

    doc.addEventListener("keydown", onKeyDown);
    win.addEventListener("blur", onWindowBlur);
    win.addEventListener("focus", onWindowFocus);

    onUnmounted(() => {
      el.removeEventListener("focusin", handleFocusIn as EventListener);
      el.removeEventListener("focusout", handleFocusOut as EventListener);
      doc.removeEventListener("keydown", onKeyDown);
      win.removeEventListener("blur", onWindowBlur);
      win.removeEventListener("focus", onWindowFocus);
    });
  });

  return el;
}
