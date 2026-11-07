import { isFn } from "@fimbul-works/hvat";
import { toastStore } from "./toast-store.js";
import type { ShowToastOptions, ToastComponent, ToastPromiseComponent } from "./types.js";

let toastsCounter = 1;

/**
 * Adds a new toast to the visible toasts or queue depending on current state and limit,
 * and returns the id of the created toast.
 */
function show(toastComponent: ToastComponent, options?: ShowToastOptions): number {
  const id = toastsCounter++;
  toastStore.add({
    id,
    toastComponent,
    dismiss: false,
    update: false,
    region: options?.region,
  });
  return id;
}

/**
 * Updates the toast of the given id with a new rendered component.
 */
function update(id: number, toastComponent: ToastComponent): void {
  const existing = toastStore.get(id);
  toastStore.update(id, {
    id,
    toastComponent,
    dismiss: false,
    update: true,
    region: existing?.region,
  });
}

/**
 * Adds a new promise-based toast to the visible toasts or queue, updating its state
 * when the promise resolves or rejects. Returns the id of the created toast.
 */
function promise<T, U = Error>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
  toastComponent: ToastPromiseComponent<T, U>,
  options?: ShowToastOptions,
): number {
  const id = show(
    (props) =>
      toastComponent({
        toastId: props.toastId,
        region: props.region,
        state: "pending",
      }),
    options,
  );

  Promise.resolve(isFn(promiseOrFn) ? promiseOrFn() : promiseOrFn)
    .then((data) => {
      update(id, (props) =>
        toastComponent({
          toastId: props.toastId,
          region: props.region,
          state: "fulfilled",
          data,
        }),
      );
    })
    .catch((error: U) => {
      update(id, (props) =>
        toastComponent({
          toastId: props.toastId,
          region: props.region,
          state: "rejected",
          error,
        }),
      );
    });

  return id;
}

/**
 * Dismisses the toast with the given id.
 */
function dismiss(id: number): number {
  toastStore.dismiss(id);
  return id;
}

/**
 * Removes all toasts from visible toasts and queue.
 */
function clear(): void {
  toastStore.clear();
}

/**
 * Checks whether a toast with the given id is currently active (present and not dismissed).
 */
function isActive(id: number): boolean {
  const t = toastStore.get(id);
  return t !== undefined && !t.dismiss;
}

/**
 * Retrieves the toast configuration for the given id if present.
 */
function get(id: number) {
  return toastStore.get(id);
}

export const toaster = {
  show,
  update,
  promise,
  dismiss,
  clear,
  isActive,
  get,
  get toasts() {
    return toastStore.toasts;
  },
  get queue() {
    return {
      toasts() {
        return toastStore.toasts();
      },
    };
  },
};

