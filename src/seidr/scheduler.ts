import type { Seidr } from "./seidr";

const pending = new Set<Seidr>();
let isScheduled = false;

/**
 * Schedules an update for a Seidr instance.
 * Notifications are batched using queueMicrotask.
 *
 * @param {Seidr} item - The Seidr instance to schedule for update
 */
export function scheduleUpdate(item: Seidr): void {
  pending.add(item);

  if (!isScheduled) {
    isScheduled = true;
    queueMicrotask(() => {
      isScheduled = false;
      flushSync();
    });
  }
}

/**
 * Immediately flushes all pending updates.
 */
export function flushSync(): void {
  while (pending.size > 0) {
    const batch = Array.from(pending);
    pending.clear();
    batch.forEach((item) => item.notify());
  }
}
