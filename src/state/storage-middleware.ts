import type { Seidr } from "../seidr/seidr";
import { type CleanupFunction, SeidrError } from "../types";
import { isServer } from "../util/environment/server";
import { isEmpty } from "../util/index";
import { wrapError } from "../util/wrap-error";
import { storageConfig } from "./storage";
import {
  STORAGE_LOCAL,
  STORAGE_SESSION,
  type StateKey,
  type StorageErrorHandler,
  type StorageOperation,
  type StorageType,
} from "./types";

/**
 * Get the storage instance based on type
 */
export const getStorageInstance = (type: StorageType): Storage | null => {
  if (isServer()) return null;
  return type === STORAGE_SESSION ? sessionStorage : type === STORAGE_LOCAL ? localStorage : null;
};

/**
 * Handle storage errors
 */
const handleStorageError = (
  err: unknown,
  operation: StorageOperation,
  key: string,
  observable: Seidr<any>,
  onError?: StorageErrorHandler,
) => {
  const error = wrapError(err);
  if (onError) {
    onError(error, operation);
  } else {
    throw new SeidrError(`Failed to ${operation} from storage (key: ${key}): ${error.message}`, observable);
  }
};

/**
 * Read value from storage
 */
export const readFromStorage = <T>(
  key: string,
  observable: Seidr<T>,
  storage: Storage,
  onError?: StorageErrorHandler,
): void => {
  try {
    const item = storage.getItem(key);
    if (!isEmpty(item)) {
      observable.value = JSON.parse(item);
    }
  } catch (error) {
    handleStorageError(error, "read", key, observable, onError);
  }
};

/**
 * Write value to storage
 */
export const writeToStorage = <T = any>(
  key: string,
  value: T,
  storage: Storage,
  observable: Seidr<T>,
  onError?: StorageErrorHandler,
): void => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    handleStorageError(error, "write", key, observable, onError);
  }
};

/**
 * Bind a Seidr observable to storage
 */
export const bindStorage = <T>(
  key: StateKey<T> | string,
  observable: Seidr<T>,
  storageType: StorageType,
  onError?: StorageErrorHandler,
): CleanupFunction => {
  if (isServer()) return () => {};

  const strKey = String(key);
  const storage = getStorageInstance(storageType);

  if (!storage) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Storage type ${storageType} is not supported`);
    }
    return () => {};
  }

  // Load initial value
  readFromStorage(strKey, observable, storage, onError);

  // Subscribe to changes
  const stopObserving = observable.observe((val) => {
    writeToStorage(strKey, val, storage, observable, onError);
  });

  const cleanup = () => {
    stopObserving();
    storageConfig.delete(key as StateKey<T>);
  };

  // Register in config
  storageConfig.set(key as StateKey<T>, [storageType, cleanup]);

  return cleanup;
};
