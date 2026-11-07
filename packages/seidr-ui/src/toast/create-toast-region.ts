import type { SeidrChild, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { ToastList } from "./toast-list.js";
import { ToastRegionRoot } from "./toast-region-root.js";
import type {
  ToastListProps,
  ToastRegionInstance,
  ToastRegionRootProps,
  UseToastRegionOptions,
} from "./types.js";
import { useToastRegion } from "./use-toast-region.js";

/**
 * Creates a headless coordinator for a ToastRegion (Tier 2).
 * Returns pre-bound Region and List subcomponents.
 */
export function createToastRegion(options: UseToastRegionOptions = {}): ToastRegionInstance {
  const instance = useToastRegion(options);

  return {
    ...instance,
    Region: <T extends keyof SeidrElementTagNameMap = "div">(
      props?: ToastRegionRootProps<T>,
      children?: SeidrChild | SeidrChild[],
    ) => ToastRegionRoot<T>({ instance, ...props } as ToastRegionRootProps<T>, children),
    List: <T extends keyof SeidrElementTagNameMap = "ol">(
      props?: ToastListProps<T>,
      children?: SeidrChild | SeidrChild[],
    ) => ToastList<T>({ instance, ...props } as ToastListProps<T>, children),
  };
}

