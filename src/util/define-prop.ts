/**
 * Define a non-writable, non-configurable property on an object.
 *
 * @template T - The type of the object
 * @template K - The key of the property to define
 * @param {T} obj - The object on which to define the property
 * @param {K} prop - The key of the property to define
 * @param {any} value - The value of the property to define
 */
export const defineProp = <T extends object, K extends keyof T>(obj: T, prop: K, value: any): void => {
  Object.defineProperties(obj, {
    [prop]: {
      value: value,
      writable: false,
      configurable: false,
      enumerable: true,
    },
  });
};
