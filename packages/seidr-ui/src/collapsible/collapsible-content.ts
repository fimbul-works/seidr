import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  onUnmounted,
  SeidrError,
  Show,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  type Value,
} from "@fimbul-works/seidr";
import { collapsibleContext, type UseCollapsibleResult } from "./collapsible-context.js";

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
   * Keep mounted in the DOM when closed. Falls back to instance.forceMount.
   */
  forceMount?: boolean;
}

export type CollapsibleContentProps<T extends keyof SeidrElementTagNameMap = "div"> =
  CollapsibleContentOptions<T> & SeidrElementProps<T>;

/**
 * Contains the content to be rendered when the collapsible is expanded.
 */
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  props?: CollapsibleContentProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CollapsibleContentProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null> {
  let props: CollapsibleContentProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as CollapsibleContentProps<T>) ?? ({} as CollapsibleContentProps<T>);
    content = children;
  } else {
    props = {} as CollapsibleContentProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const {
    as = "div" as T,
    instance,
    forceMount: propsForceMount,
    id: customId,
    ...rest
  } = props as any;

  const col = instance ?? collapsibleContext.get();
  if (!col) {
    throw new SeidrError(
      "[seidr-ui]: CollapsibleContent requires an instance prop or must be used within a Collapsible.create() / Collapsible context.",
    );
  }

  if (customId) {
    onUnmounted(col.registerContentId(customId));
  }

  const resolvedContentId = customId ?? col.contentId();
  const shouldForceMount = propsForceMount ?? col.forceMount;

  const elementProps = {
    id: resolvedContentId,
    ...col.dataset,
    ...rest,
  };

  if (shouldForceMount) {
    return $(
      as as keyof SeidrElementTagNameMap,
      {
        hidden: col.isOpen.as((v: boolean) => !v),
        ...elementProps,
      } as SeidrElementProps<any>,
      content,
    ) as SeidrElementTagNameMap[T];
  }

  return Show(
    col.isOpen,
    () => $(as as keyof SeidrElementTagNameMap, elementProps as SeidrElementProps<any>, content) as SeidrElementTagNameMap[T],
  ) as Value<SeidrElementTagNameMap[T] | null>;
}
