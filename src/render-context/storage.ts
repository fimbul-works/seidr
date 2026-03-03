import type { AppState } from "./types";

const strategies = new Map<string, [((value: any) => any) | undefined, ((value: any) => any) | undefined]>();

/** @type {AppState} Client-side application state */
export const appState: AppState = {
  ctxID: 0,
  sID: 0,
  cID: 0,
  markers: new Map<string, [Comment, Comment]>(),
  data: new Map<string, any>(),

  hasData(key: string) {
    return this.data.has(key);
  },
  getData<T>(key: string) {
    return this.data.get(key) as T | undefined;
  },
  setData<T>(key: string, value: T) {
    this.data.set(key, value);
  },
  deleteData(key: string) {
    return this.data.delete(key);
  },

  defineDataStrategy<T>(key: string, captureFn: (value: T) => any, restoreFn: (value: any) => T) {
    strategies.set(key, [captureFn, restoreFn]);
  },
  getDataStrategy(key: string) {
    return strategies.get(key);
  },
};
