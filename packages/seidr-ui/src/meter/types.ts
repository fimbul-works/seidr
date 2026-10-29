import type { SeidrElementTagNameMap } from "@fimbul-works/seidr";
import type {
  GetProgressValueLabelParams,
  ProgressFillProps,
  ProgressHeaderProps,
  ProgressInstance,
  ProgressLabelProps,
  ProgressProps,
  ProgressRootProps,
  ProgressSubcomponentProps,
  ProgressTrackProps,
  ProgressValueLabelProps,
  UseProgressOptions,
  UseProgressResult,
} from "../progress/types.js";

export type GetMeterValueLabelParams = GetProgressValueLabelParams;
export type UseMeterOptions = UseProgressOptions;
export type UseMeterResult = UseProgressResult;
export type MeterInstance = ProgressInstance;
export type MeterSubcomponentProps = ProgressSubcomponentProps;
export type MeterRootProps<T extends keyof SeidrElementTagNameMap = "div"> = ProgressRootProps<T>;
export type MeterHeaderProps<T extends keyof SeidrElementTagNameMap = "div"> = ProgressHeaderProps<T>;
export type MeterTrackProps<T extends keyof SeidrElementTagNameMap = "div"> = ProgressTrackProps<T>;
export type MeterFillProps<T extends keyof SeidrElementTagNameMap = "div"> = ProgressFillProps<T>;
export type MeterLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = ProgressLabelProps<T>;
export type MeterValueLabelProps<T extends keyof SeidrElementTagNameMap = "span"> = ProgressValueLabelProps<T>;
export type MeterProps = ProgressProps;
