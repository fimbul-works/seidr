/**
 * Interface for objects that can be scheduled for updates.
 */
export interface Schedulable {
  runFlush(): void;
}

const pending = new Set<Schedulable>();
let isScheduled = false;

/**
 * Schedules an update for a Schedulable object.
 * Notifications are batched using queueMicrotask.
 *
 * @param {Schedulable} item - The object to schedule for update
 */
export function scheduleUpdate(item: Schedulable): void {
  pending.add(item);

  if (!isScheduled) {
    isScheduled = true;
    queueMicrotask(() => {
      isScheduled = false;

      // Exhaust the queue in circular updates
      while (pending.size > 0) {
        const batch = Array.from(pending);
        pending.clear();
        for (const item of batch) {
          item.runFlush();
        }
      }
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
    for (const item of batch) {
      item.runFlush();
    }
  }
}
