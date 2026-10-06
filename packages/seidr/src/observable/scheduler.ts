// import type { Value } from "./value.js";

// const pending = new Set<Value<any>>();
// let isScheduled = false;

// /**
//  * Schedules an update for a Value instance.
//  * Notifications are batched using queueMicrotask.
//  *
//  * @param {Value<any>} item - The Value instance to schedule for update
//  */
// export const scheduleUpdate = (item: Value<any>): void => {
//   pending.add(item);

//   // Flush immediately in tests unless SEIDR_USE_SCHEDULER is enabled
//   if (!process.env.SEIDR_USE_SCHEDULER) {
//     flushSync();
//     return;
//   }

//   if (!isScheduled) {
//     isScheduled = true;
//     queueMicrotask(() => {
//       isScheduled = false;
//       flushSync();
//     });
//   }
// };

// /**
//  * Immediately flushes all pending updates.
//  */
// export const flushSync = (): void => {
//   while (pending.size > 0) {
//     const batch = Array.from(pending);
//     pending.clear();
//     batch.forEach((item) => item.notify());
//   }
// };
