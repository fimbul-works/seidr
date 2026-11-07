import type { SeidrChild, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { PopperArrow } from "./popper-arrow.js";
import { PopperPositioner } from "./popper-positioner.js";
import { PopperRoot } from "./popper-root.js";
import type {
  PopperArrowProps,
  PopperInstance,
  PopperPositionerProps,
  PopperRootProps,
  UsePopperOptions,
} from "./types.js";
import { usePopper } from "./use-popper.js";

/**
 * Creates a Popper state coordinator instance with pre-bound compound element helpers (Tier 2).
 */
export function createPopper(options: UsePopperOptions = {}): PopperInstance {
  const instance = usePopper(options);

  return {
    ...instance,
    Root: <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<PopperRootProps<T>, "instance"> = {} as Omit<PopperRootProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => PopperRoot({ instance, ...props } as PopperRootProps<T>, children),

    Positioner: <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<PopperPositionerProps<T>, "instance"> = {} as Omit<PopperPositionerProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => PopperPositioner({ instance, ...props } as PopperPositionerProps<T>, children),

    Arrow: <T extends keyof SeidrElementTagNameMap = "div">(
      props: Omit<PopperArrowProps<T>, "instance"> = {} as Omit<PopperArrowProps<T>, "instance">,
      children?: SeidrChild | SeidrChild[],
    ) => PopperArrow({ instance, ...props } as PopperArrowProps<T>, children),
  };
}

