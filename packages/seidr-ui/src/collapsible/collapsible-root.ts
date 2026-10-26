import { isUndef } from "@fimbul-works/hvat";
import {
  $,
  isValidSeidrChild,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  type Value,
} from "@fimbul-works/seidr";
import { collapsibleContext, type UseCollapsibleResult } from "./collapsible-context.js";
import { CollapsibleContent, type CollapsibleContentProps } from "./collapsible-content.js";
import { CollapsibleTrigger, type CollapsibleTriggerProps } from "./collapsible-trigger.js";
import { useCollapsible, type UseCollapsibleOptions } from "./use-collapsible.js";

export interface CollapsibleInstance extends UseCollapsibleResult {
  /**
   * Pre-bound Collapsible.Root container.
   */
  Root: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: CollapsibleRootProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound Collapsible.Trigger element.
   */
  Trigger: <T extends keyof SeidrElementTagNameMap = "button">(
    propsOrChildren?: CollapsibleTriggerProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T];

  /**
   * Pre-bound Collapsible.Content element.
   */
  Content: <T extends keyof SeidrElementTagNameMap = "div">(
    propsOrChildren?: CollapsibleContentProps<T> | SeidrChild | SeidrChild[] | null,
    children?: SeidrChild | SeidrChild[],
  ) => SeidrElementTagNameMap[T] | Value<SeidrElementTagNameMap[T] | null>;
}

/**
 * Creates a collapsible state instance with pre-bound compound element helpers.
 */
export function createCollapsible(options: UseCollapsibleOptions = {}): CollapsibleInstance {
  
  const instance = useCollapsible(options);

  return {
    ...instance,
    Root: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return CollapsibleRoot({ instance, ...props }, content);
    },
    Trigger: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return CollapsibleTrigger({ instance, ...props }, content);
    },
    Content: (propsOrChildren, children) => {
      let props: any;
      let content: any;
      if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
        props = propsOrChildren ?? {};
        content = children;
      } else {
        props = {};
        content = propsOrChildren;
      }
      return CollapsibleContent({ instance, ...props }, content);
    },
  };
}

export interface CollapsibleRootOptions<T extends keyof SeidrElementTagNameMap = "div">
  extends UseCollapsibleOptions {
  /**
   * The HTML element tag name to render.
   * @default "div"
   */
  as?: T;

  /**
   * Explicit instance providing reactive state.
   */
  instance?: UseCollapsibleResult;
}

export type CollapsibleRootProps<T extends keyof SeidrElementTagNameMap = "div"> =
  CollapsibleRootOptions<T> & SeidrElementProps<T>;

/**
 * CollapsibleRoot is the top-level container for a collapsible disclosure widget.
 */
export function CollapsibleRoot<T extends keyof SeidrElementTagNameMap = "div">(
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CollapsibleRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props?: CollapsibleRootProps<T> | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T];
export function CollapsibleRoot<T extends keyof SeidrElementTagNameMap = "div">(
  propsOrChildren?: CollapsibleRootProps<T> | SeidrChild | SeidrChild[] | null,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  let props: CollapsibleRootProps<T>;
  let content: SeidrChild | SeidrChild[] | undefined;

  if (!isUndef(children) || !isValidSeidrChild(propsOrChildren)) {
    props = (propsOrChildren as CollapsibleRootProps<T>) ?? ({} as CollapsibleRootProps<T>);
    content = children;
  } else {
    props = {} as CollapsibleRootProps<T>;
    content = propsOrChildren as SeidrChild | SeidrChild[];
  }

  const {
    as = "div" as T,
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    forceMount,
    id,
    instance,
    ...rest
  } = props as any;

  const col =
    instance ??
    useCollapsible({
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      forceMount,
      id,
    });

  return $(
    as as keyof SeidrElementTagNameMap,
    {
      id: col.id,
      ...col.dataset,
      ...rest,
    } as SeidrElementProps<any>,
    content,
  ) as SeidrElementTagNameMap[T];
}

export interface CollapsibleProps<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TTrigger extends keyof SeidrElementTagNameMap = "button",
  TContent extends keyof SeidrElementTagNameMap = "div",
> extends UseCollapsibleOptions {
  /** Tag for root container. Default "div". */
  as?: TRoot;
  /** Props for root container. */
  rootProps?: Omit<CollapsibleRootProps<TRoot>, "open" | "defaultOpen" | "onOpenChange" | "disabled" | "forceMount" | "id">;
  /** Content for trigger. */
  trigger?: SeidrChild | SeidrChild[];
  /** Props for trigger button. */
  triggerProps?: CollapsibleTriggerProps<TTrigger>;
  /** Content for the collapsible panel. */
  children?: SeidrChild | SeidrChild[];
  /** Props for content panel. */
  contentProps?: CollapsibleContentProps<TContent>;
}

/**
 * Unified all-in-one Collapsible component.
 */
function CollapsibleUnified<
  TRoot extends keyof SeidrElementTagNameMap = "div",
  TTrigger extends keyof SeidrElementTagNameMap = "button",
  TContent extends keyof SeidrElementTagNameMap = "div",
>(props: CollapsibleProps<TRoot, TTrigger, TContent>): SeidrElementTagNameMap[TRoot] {
  const {
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    forceMount,
    id,
    as = "div" as TRoot,
    rootProps = {},
    trigger,
    triggerProps = {},
    children,
    contentProps = {},
  } = props;

  const col = createCollapsible({
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    forceMount,
    id,
  });

  return col.Root(
    { as, ...rootProps } as any,
    [
      col.Trigger(triggerProps as any, trigger),
      col.Content(contentProps as any, children),
    ],
  );
}

export const Collapsible = Object.assign(CollapsibleUnified, {
  create: createCollapsible,
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
});
