/**
 * Ease linearly; no easing, no acceleration.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const linear = (t: number) => t;

/**
 * Ease in quadratic; accelerating from zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInQuad = (t: number) => t * t;

/**
 * Ease out quadratic; decelerating to zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeOutQuad = (t: number) => t * (2 - t);

/**
 * Ease in-out quadratic; acceleration until halfway, then deceleration.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

/**
 * Ease in cubic; accelerating from zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInCubic = (t: number) => t * t * t;

/**
 * Ease out cubic; decelerating to zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeOutCubic = (t: number) => --t * t * t + 1;

/**
 * Ease in-out cubic; acceleration until halfway, then deceleration.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

/**
 * Ease in quartic; accelerating from zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInQuart = (t: number) => t * t * t * t;

/**
 * Ease out quartic; decelerating to zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeOutQuart = (t: number) => 1 - --t * t * t * t;

/**
 * Ease in-out quartic; acceleration until halfway, then deceleration.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t);

/**
 * Ease in quintic; accelerating from zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInQuint = (t: number) => t * t * t * t * t;

/**
 * Ease out quntic; decelerating to zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeOutQuint = (t: number) => 1 + --t * t * t * t * t;

/**
 * Ease in-out quintic; acceleration until halfway, then deceleration.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInOutQuint = (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t);

/**
 * Ease in exponentially; accelerating from zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInExpo = (t: number) => (t <= 0 ? 0 : 2 ** (10 * t - 10));

/**
 * Ease out exponentially; decelerating to zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Ease in-out exponentially; acceleration until halfway, then deceleration.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInOutExpo = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2;

const ELASTIC_ANGULAR_FREQUENCY = (2 * Math.PI) / 3;
const INOUT_ELASTIC_ANGULAR_FREQUENCY = (2 * Math.PI) / 4.5;

/**
 * Ease in elastically; accelerating from zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInElastic = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * ELASTIC_ANGULAR_FREQUENCY);

/**
 * Ease out elastically; decelerating to zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeOutElastic = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ELASTIC_ANGULAR_FREQUENCY) + 1;

/**
 * Ease in-out elastically.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInOutElastic = (t: number) =>
  t <= 0
    ? 0
    : t >= 1
      ? 1
      : t < 0.5
        ? -(2 ** (20 * t - 10) * Math.sin((20 * t - 11.125) * INOUT_ELASTIC_ANGULAR_FREQUENCY)) / 2
        : (2 ** (-20 * t + 10) * Math.sin((20 * t - 11.125) * INOUT_ELASTIC_ANGULAR_FREQUENCY)) / 2 + 1;

/**
 * Ease in bouncing; accelerating from zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInBounce = (t: number) => 1 - easeOutBounce(1 - t);

/**
 * Ease out bouncing; decelerating to zero velocity.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeOutBounce = (t: number) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

/**
 * Ease in-out bouncing.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInOutBounce = (t: number) =>
  t < 0.5 ? (1 - easeOutBounce(1 - 2 * t)) / 2 : (1 + easeOutBounce(2 * t - 1)) / 2;

const BACK_CONSTANT = 1.70158;

/**
 * Ease in with anticipation (pulls back before going forward).
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInBack = (t: number) => {
  const c = BACK_CONSTANT;
  return t * t * ((c + 1) * t - c);
};

/**
 * Ease out with overshoot (goes past target then settles).
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeOutBack = (t: number) => {
  const c = BACK_CONSTANT;
  return 1 + (t - 1) * (t - 1) * ((c + 1) * (t - 1) + c);
};

/**
 * Ease in-out with anticipation and overshoot.
 * @param {number} t - Number to ease
 * @returns {number} Interpolated value
 */
export const easeInOutBack = (t: number) => {
  const c = BACK_CONSTANT * 1.525;
  return t < 0.5
    ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2
    : ((2 * t - 2) ** 2 * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
};

/**
 * Smoothly interpolate between two values.
 * @param {number} x - Number to ease
 * @returns {number} Interpolated value
 */
export const smoothstep = (x: number): number => x * x * (3 - 2 * x);
