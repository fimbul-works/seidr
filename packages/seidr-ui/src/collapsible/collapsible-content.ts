import {
  $,
  type DerivedValue,
  mergeValues,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
  Show,
  unwrapValue,
} from "@fimbul-works/seidr";
import type { UseCollapsibleResult } from "./types.js";
import { wrapValue } from "@fimbul-works/seidr";
import { ObservableValue } from "@fimbul-works/seidr";

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
}

export type CollapsibleContentProps<T extends keyof SeidrElementTagNameMap = "div"> = CollapsibleContentOptions<T> &
  SeidrElementProps<T>;

/**
 * Contains the content to be rendered when the collapsible is expanded.
 */
export function CollapsibleContent<T extends keyof SeidrElementTagNameMap = "div">(
  props: CollapsibleContentProps<T>,
  children?: SeidrChild | SeidrChild[],
): DerivedValue<SeidrElementTagNameMap[T] | null> {
  const { as = "div" as T, instance: col, forceMount, id: customId, ...rest } = props;

  if (!col) {
    throw new SeidrError(
      "CollapsibleContent requires an instance prop",
    );
  }

  const wrappedId = wrapValue(customId as string)
  const id = mergeValues(() => wrappedId() ?? col.contentId(), { parents: [wrappedId, col.contentId] })
  id.bind(id => col.registerContentId(id))

  const elementProps = {
    id,
    ...col.dataset,
    ...rest,
  };

  const condition = mergeValues(() => !!(unwrapValue(forceMount ?? col.forceMount) || col.isOpen()), {
    parents: [forceMount, col.forceMount, col.isOpen],
  });

  return Show(condition, () =>
    $(
      as as T,
      {
        hidden: col.isOpen.as((v: boolean) => !v),
        dataComponent: "collapsible",
        dataPart: "content",
        ...elementProps,
      } as SeidrElementProps<T>,
      children,
    ),
  ) as DerivedValue<SeidrElementTagNameMap[T] | null>;
}
