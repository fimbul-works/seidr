import {
  $,
  type DerivedValue,
  createValue,
  inClient,
  mergeStyleProps,
  mergeValues,
  onUnmounted,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  unwrapValue,
  wrapValue,
  wrapValueObject,
} from "@fimbul-works/seidr";
import { easeInOutCubic, tween } from "@fimbul-works/flaedi";
import type { CollapsibleAnimationOptions, UseCollapsibleResult } from "./types.js";

export interface CollapsibleContentOptions<T extends keyof SeidrElementTagNameMap = "div"> {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit instance providing reactive state.
   */
  instance?: UseCollapsibleResult;

  /**
   * Animation configuration using Flaedi, or `false` to disable JS tweening.
   * @default true
   */
  animation?: boolean | CollapsibleAnimationOptions;
}

export type CollapsibleContentProps<T extends keyof SeidrElementTagNameMap = "div"> = CollapsibleContentOptions<T> &
  SeidrElementProps<T>;

/**
 * Contains the content to be rendered when the collapsible is expanded.
 * Supports smooth JavaScript height tweening via Flaedi and CSS custom property animations.
 */
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: CollapsibleContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const {
    as = "div" as T,
    instance: col,
    forceMount,
    id: customId,
    ref: userRef,
    style,
    animation = true,
    ...rest
  } = props;

  if (!col) {
    throw new SeidrError("CollapsibleContent requires an instance prop");
  }

  const isAnimationEnabled = animation !== false;
  const animOptions = typeof animation === "object" ? animation : {};
  const durationMs = animOptions.duration ?? 250;
  const easingFn = animOptions.easing ?? easeInOutCubic;

  const wrappedId = wrapValue(customId as string);
  const id = mergeValues(() => wrappedId() ?? col.contentId(), { parents: [wrappedId, col.contentId] });
  id.bind((id) => col.registerContentId(id));

  const forceMountVal = forceMount ?? col.forceMount;
  const isForceMounted = mergeValues(() => !!unwrapValue(forceMountVal), { parents: [forceMountVal] });

  const isPresent = createValue<boolean>(!!(isForceMounted() || col.isOpen()));
  const fullHeight = createValue<number>(0);
  const fullWidth = createValue<number>(0);
  const height = createValue<number>(0);
  const padTopVal = createValue<number>(0);
  const padBottomVal = createValue<number>(0);
  const isAnimating = createValue<boolean>(false);

  const animTarget = wrapValueObject(height, "height");

  const progress = mergeValues(
    () => {
      const th = fullHeight();
      return th > 0 ? Math.min(1, Math.max(0, height() / th)) : 1;
    },
    { parents: [height, fullHeight] },
  );

  const inlineHeight = mergeValues(
    () => (isAnimating() ? `${height()}px` : ""),
    { parents: [isAnimating, height] },
  );

  const inlineOverflow = mergeValues(
    () => (isAnimating() ? "hidden" : ""),
    { parents: [isAnimating] },
  );

  const inlinePaddingTop = mergeValues(
    () => (isAnimating() && padTopVal() > 0 ? `${progress() * padTopVal()}px` : ""),
    { parents: [isAnimating, progress, padTopVal] },
  );

  const inlinePaddingBottom = mergeValues(
    () => (isAnimating() && padBottomVal() > 0 ? `${progress() * padBottomVal()}px` : ""),
    { parents: [isAnimating, progress, padBottomVal] },
  );

  const dynamicStyles = {
    "--seidr-collapsible-content-height": fullHeight.as((h: number) => (h ? `${h}px` : "")),
    "--seidr-collapsible-content-width": fullWidth.as((w: number) => (w ? `${w}px` : "")) as any,
    height: inlineHeight,
    overflow: inlineOverflow,
    paddingTop: inlinePaddingTop,
    paddingBottom: inlinePaddingBottom,
  };

  const elementProps = {
    id,
    style: mergeStyleProps(dynamicStyles as any, style as any),
    ...col.dataset,
    ...rest,
  };

  let contentEl: HTMLElement | null = null;

  inClient(() => {
    let activeTween: (Promise<void> & { stop: () => void }) | null = null;

    const measureFull = () => {
      if (!contentEl) return 0;

      const prevAnim = contentEl.style.animationName;
      const prevTrans = contentEl.style.transitionDuration;
      const prevHeight = contentEl.style.height;
      const prevOverflow = contentEl.style.overflow;
      const prevPadTop = contentEl.style.paddingTop;
      const prevPadBottom = contentEl.style.paddingBottom;
      const prevHidden = contentEl.hidden;

      contentEl.style.animationName = "none";
      contentEl.style.transitionDuration = "0s";
      contentEl.style.height = "auto";
      contentEl.style.overflow = "visible";
      contentEl.style.paddingTop = "";
      contentEl.style.paddingBottom = "";
      contentEl.hidden = false;

      const measuredHeight = contentEl.offsetHeight || contentEl.scrollHeight;
      const measuredWidth = contentEl.offsetWidth || contentEl.scrollWidth;

      try {
        const comp = window.getComputedStyle(contentEl);
        const pt = parseFloat(comp.paddingTop) || 0;
        const pb = parseFloat(comp.paddingBottom) || 0;
        padTopVal(pt);
        padBottomVal(pb);
      } catch {
        // Safe fallback in test environments without full computed styles
      }

      contentEl.style.animationName = prevAnim;
      contentEl.style.transitionDuration = prevTrans;
      contentEl.style.height = prevHeight;
      contentEl.style.overflow = prevOverflow;
      contentEl.style.paddingTop = prevPadTop;
      contentEl.style.paddingBottom = prevPadBottom;
      contentEl.hidden = prevHidden;

      if (measuredWidth > 0) {
        fullWidth(measuredWidth);
        contentEl.style.setProperty("--seidr-collapsible-content-width", `${measuredWidth}px`);
      }
      if (measuredHeight > 0) {
        fullHeight(measuredHeight);
        contentEl.style.setProperty("--seidr-collapsible-content-height", `${measuredHeight}px`);
      }
      return measuredHeight;
    };

    // Initial client measurement if already open
    if (col.isOpen()) {
      measureFull();
    }

    const unwatchForce = isForceMounted.watch((forced) => {
      if (forced) {
        isPresent(true);
      } else if (!col.isOpen() && !isAnimating()) {
        isPresent(false);
      }
    });

    const unwatchOpen = col.isOpen.watch((isOpen: boolean) => {
      if (isOpen) {
        // --- OPENING ---
        activeTween?.stop();
        activeTween = null;

        isPresent(true);

        if (!isAnimationEnabled) {
          isAnimating(false);
          measureFull();
          return;
        }

        const currentH = isAnimating() ? height() : 0;
        const targetH = measureFull();

        if (targetH <= 0) {
          isAnimating(false);
          return;
        }

        height(currentH);
        isAnimating(true);

        activeTween = tween(animTarget, "height", targetH, durationMs, easingFn);
        activeTween.then(() => {
          activeTween = null;
          isAnimating(false);
          height(targetH);
        });
      } else {
        // --- CLOSING ---
        activeTween?.stop();
        activeTween = null;

        if (!isAnimationEnabled) {
          isAnimating(false);
          if (!isForceMounted()) {
            isPresent(false);
          }
          return;
        }

        const startH = contentEl ? contentEl.offsetHeight || height() : height();
        if (startH <= 0) {
          isAnimating(false);
          if (!isForceMounted()) {
            isPresent(false);
          }
          return;
        }

        height(startH);
        isAnimating(true);

        activeTween = tween(animTarget, "height", 0, durationMs, easingFn);
        activeTween.then(() => {
          activeTween = null;
          isAnimating(false);
          height(0);
          if (!col.isOpen() && !isForceMounted()) {
            isPresent(false);
          }
        });
      }
    });

    onUnmounted(() => {
      activeTween?.stop();
      unwatchForce();
      unwatchOpen();
    });
  });

  return Show(isPresent, () => {
    const el = $(
      as as T,
      {
        hidden: mergeValues(
          () => !col.isOpen() && !isAnimating(),
          { parents: [col.isOpen, isAnimating] },
        ),
        dataComponent: "collapsible",
        dataPart: "content",
        ...elementProps,
      } as unknown as SeidrElementProps<T>,
      children,
    );

    contentEl = el as unknown as HTMLElement;

    if (userRef) {
      userRef(el as any);
      onUnmounted(() => userRef(null as any));
    }

    onUnmounted(() => {
      contentEl = null;
    });

    return el;
  }) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
