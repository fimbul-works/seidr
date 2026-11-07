import { createValue, type Value } from "@fimbul-works/seidr";
import type { ToastConfig } from "./types.js";

const TOAST_STORE_ID = "seidr-ui-toast-store";

function getToastsValue(): Value<ToastConfig[]> {
  return createValue<ToastConfig[]>([], { id: TOAST_STORE_ID, hydrate: false });
}

function add(toast: ToastConfig): void {
  const state = getToastsValue();
  state((prev) => [...prev, toast]);
}

function get(id: number): ToastConfig | undefined {
  return getToastsValue()().find((toast) => toast.id === id);
}

function update(id: number, toast: ToastConfig): void {
  const state = getToastsValue();
  state((prev) => {
    const index = prev.findIndex((t) => t.id === id);
    if (index === -1) return prev;
    return [...prev.slice(0, index), toast, ...prev.slice(index + 1)];
  });
}

function dismiss(id: number): void {
  const state = getToastsValue();
  state((prev) => prev.map((toast) => (toast.id === id ? { ...toast, dismiss: true } : toast)));
}

function remove(id: number): void {
  const state = getToastsValue();
  state((prev) => prev.filter((toast) => toast.id !== id));
}

function clear(): void {
  getToastsValue()([]);
}

export const toastStore = {
  get toasts(): Value<ToastConfig[]> {
    return getToastsValue();
  },
  add,
  get,
  update,
  dismiss,
  remove,
  clear,
};
