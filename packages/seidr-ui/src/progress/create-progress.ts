import type { SeidrChild, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { ProgressFill } from "./progress-fill.js";
import { ProgressHeader } from "./progress-header.js";
import { ProgressLabel } from "./progress-label.js";
import { ProgressRoot } from "./progress-root.js";
import { ProgressTrack } from "./progress-track.js";
import { ProgressValueLabel } from "./progress-value-label.js";
import type {
  ProgressFillProps,
  ProgressHeaderProps,
  ProgressInstance,
  ProgressLabelProps,
  ProgressRootProps,
  ProgressTrackProps,
  ProgressValueLabelProps,
  UseProgressOptions,
} from "./types.js";
import { useProgress } from "./use-progress.js";

/**
 * Creates a headless coordinator for a Progress bar (Tier 2).
 * Returns pre-bound subcomponents (Root, Header, Track, Fill, Label, ValueLabel).
 */
export function createProgress(options: UseProgressOptions = {}): ProgressInstance {
  const instance = useProgress(options);

  return {
    ...instance,
    Root: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: Omit<ProgressRootProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ProgressRoot({ instance, ...props } as ProgressRootProps<T>, children),
    Header: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: Omit<ProgressHeaderProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ProgressHeader({ instance, ...props } as ProgressHeaderProps<T>, children),
    Track: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: Omit<ProgressTrackProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ProgressTrack({ instance, ...props } as ProgressTrackProps<T>, children),
    Fill: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: Omit<ProgressFillProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ProgressFill({ instance, ...props } as ProgressFillProps<T>, children),
    Label: <T extends keyof SeidrElementTagNameMap = "span">(
      props?: Omit<ProgressLabelProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ProgressLabel({ instance, ...props } as ProgressLabelProps<T>, children),
    ValueLabel: <T extends keyof SeidrElementTagNameMap = "span">(
      props?: Omit<ProgressValueLabelProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => ProgressValueLabel({ instance, ...props } as ProgressValueLabelProps<T>, children),
  };
}
