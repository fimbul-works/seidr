import { isObj } from "@fimbul-works/hvat";
import {
  $,
  createValue,
  inClient,
  onUnmounted,
  type ReactiveStyleDeclaration,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { ToastProgressFillProps } from "./types.js";

/**
 * Visual indicator (`data-part="progress-fill"`) representing the toast's remaining lifetime.
 */
export function ToastProgressFill<T extends keyof SeidrElementTagNameMap = "div">(
  props: ToastProgressFillProps<T> = {},
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance: toast,
    style: userStyle,
    dataComponent,
    ...rest
  } = props;

  if (!toast) {
    throw new SeidrError("ToastProgressFill requires a Toast instance coordinator");
  }

  const lifeTime = createValue(100, { hydrate: false });
  let totalElapsedTime = 0;

  inClient(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const clearTick = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const startTick = () => {
      clearTick();
      if ((toast.region?.isPaused() ?? false) || toast.isPersistent()) {
        return;
      }
      intervalId = setInterval(() => {
        const elapsedTime = Date.now() - toast.closeTimerStartTime() + totalElapsedTime;
        const totalDuration = toast.duration();
        const life = totalDuration > 0 ? Math.trunc(100 - (elapsedTime / totalDuration) * 100) : 0;
        lifeTime(life < 0 ? 0 : life);
      }, 16);
    };

    startTick();

    const unwatchPaused = toast.region?.isPaused.watch((paused) => {
      if (paused) {
        totalElapsedTime += Math.max(0, Date.now() - toast.closeTimerStartTime());
        clearTick();
      } else {
        startTick();
      }
    });

    onUnmounted(() => {
      clearTick();
      unwatchPaused?.();
    });
  });

  const widthVar = lifeTime.as((pct) => `${pct}%`);

  const fillStyle: ReactiveStyleDeclaration = {
    width: widthVar,
    ...(isObj(userStyle) ? userStyle : {}),
  };

  const el = $<T>(
    as,
    {
      style: fillStyle,
      dataComponent: dataComponent ?? toast.dataComponent,
      dataPart: "progress-fill",
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );

  widthVar.bind((val) => {
    el.style.setProperty("--toast-progress-fill-width", val);
    el.style.setProperty("--kb-toast-progress-fill-width", val);
  });

  return el;
}

