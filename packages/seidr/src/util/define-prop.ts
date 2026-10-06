/**
 * Define a value property on an object.
 *
 * @template T - The type of the object
 * @template K - The key of the property to define
 * @template V - The type of the property
 * @param {T} obj - The object on which to define the property
 * @param {K} prop - The key of the property to define
 * @param {any} value - The value of the property to define
 * @param {boolean} writable - Whether the property should be writable (default: `true`)
 */
export const defineValueProp = <T extends object, K extends keyof T, V = any>(
  obj: T,
  prop: K,
  value: V,
  writable: boolean = true,
): T =>
  Object.defineProperty(obj, prop, {
    value,
    writable,
    enumerable: true,
  });

/**
 * Define a getter property on an object.
 *
 * @template T - The type of the object
 * @template K - The key of the property to define
 * @template V - The type of the returned value
 * @param {T} obj - The object on which to define the property
 * @param {K} prop - The key of the property to define
 * @param {() => V} get - The getter function
 */
export const defineGetProp = <T extends object, K extends keyof T, V = any>(obj: T, prop: K, get: () => V): T =>
  Object.defineProperty(obj, prop, {
    get,
    enumerable: true,
  });

/**
 * Define a getter and setter property on an object.
 *
 * @template T - The type of the object
 * @template K - The key of the property to define
 * @template V - The type of the returned value
 * @param {T} obj - The object on which to define the property
 * @param {K} prop - The key of the property to define
 * @param {() => V} get - The getter function
 * @param {(value: V) => void} set - The setter function
 */
export const defineGetSetProp = <T extends object, K extends keyof T, V = any>(
  obj: T,
  prop: K,
  get: () => V,
  set: (value: V) => void,
): T =>
  Object.defineProperty(obj, prop, {
    get,
    set,
    enumerable: true,
  });
