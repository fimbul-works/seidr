import type { Seidr } from "../seidr";

/**
 * A function that returns the current animation progress between 0...1.
 *
 * @param {number} deltaMs - The time elapsed since the last frame in milliseconds
 * @returns {number} The current animation progress
 */
export type AnimationFunction = (deltaMs: number) => number;

/** Set of active animations */
const animations = new Set<AnimationFunction>();

/** ID of the current animation frame */
let animationFrameId: number | null = null;

/** Time of the last frame */
let lastFrameTime = 0;

/** Animation frame callback */
const animateFrame = (now: number) => {
  animationFrameId = requestAnimationFrame(animateFrame);
  if (lastFrameTime === 0) {
    lastFrameTime = now;
  }
  const deltaMs = lastFrameTime ? now - lastFrameTime : 0;
  lastFrameTime = now;
  let t = 0;
  animations.forEach((fn) => {
    t = fn(deltaMs);
    if (t >= 1) {
      stopAnimation(fn);
    }
  });
};

/**
 * Animate a tween
 * @param {AnimationFunction} callback - The tween to animate
 * @returns {() => void} A function to stop the animation
 */
export function animate(callback: AnimationFunction): () => void {
  // Disable in SSR
  if (typeof window === "undefined") {
    return () => {};
  }
  animations.add(callback);
  animationFrameId = requestAnimationFrame(animateFrame);
  return () => stopAnimation(callback);
}

/**
 * Stop a tween.
 * @param {AnimationFunction} callback - The tween to stop
 */
function stopAnimation(callback: AnimationFunction) {
  animations.delete(callback);
  if (animations.size === 0) {
    cancelAnimationFrame(animationFrameId as number);
    lastFrameTime = 0;
  }
}

/**
 * Create a tweening function.
 * @param {number} durationMs - Duration of the tween in milliseconds
 * @param {(t: number) => number} easing - Easing function
 * @returns {AnimationFunction} Tweening function, which optionally accepts the current delta in milliseconds, and reurns the current progress.
 */
function createTween(durationMs: number, easing = (t: number) => t): AnimationFunction {
  let current = 0;
  return (deltaMs: number) => {
    current += deltaMs;
    if (current >= durationMs) {
      return 1;
    }
    return easing(current / durationMs);
  };
}

/**
 * Tween a Seidr value to a target value.
 * @param {Seidr<number>} seidr The Seidr to tween
 * @param {number} to The target value
 * @param {number} durationMs The duration of the tween in milliseconds
 * @param {(t: number) => number} easing The easing function to use
 * @returns {() => void} A function to stop the tween
 */
export function tween(seidr: Seidr<number>, to: number, durationMs: number, easing = (t: number) => t): () => void {
  // Disable in SSR
  if (typeof window === "undefined") {
    return () => {};
  }
  const tween = createTween(durationMs, easing);
  const from = seidr.value;
  let t = 0;
  return animate((deltaMs: number) => ((t = tween(deltaMs)), (seidr.value = from + (to - from) * t), t));
}
