/** Function to capture data from AppState for hydration */
export type CaptureDataFn<T> = () => T;

/** Function to restore data to AppState for hydration */
export type RestoreDataFn<T> = (data: T) => void;

/**
 * Data strategy for features and addons, for SSR friendly initialization and hydration.
 *
 * A strategy consists of a capture function, and a restore function.
 */
export type DataStrategy<T = any> = [CaptureDataFn<T>, RestoreDataFn<T>];
