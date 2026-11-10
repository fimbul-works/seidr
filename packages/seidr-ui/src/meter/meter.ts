import { createComponent } from "@fimbul-works/seidr";
import { DATA_COMPONENT_METEER } from "../constants.js";
import { createProgress, Progress } from "../progress/index.js";
import type { MeterInstance, MeterProps, UseMeterOptions } from "./types.js";

/**
 * Creates a headless coordinator for a Meter gauge (Tier 2).
 * Configured with role="meter" and dataComponent="meter".
 */
export function createMeter(options: UseMeterOptions = {}): MeterInstance {
  return createProgress({ ...options, role: "meter", dataComponent: DATA_COMPONENT_METEER });
}

/**
 * Unified all-in-one Meter component (Tier 1).
 * Renders an accessible gauge (role="meter", dataComponent="meter") with label, value label, track, and fill.
 */
export const Meter = createComponent((props: MeterProps = {}) => {
  return Progress({ ...props, role: "meter", dataComponent: DATA_COMPONENT_METEER });
}, "Meter");
