import { isUndef } from "@fimbul-works/hvat";
import type { SeidrChild, SeidrElementProps, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { AccordionContent, type AccordionContentProps } from "./accordion-content.js";
import { AccordionHeader, type AccordionHeaderProps } from "./accordion-header.js";
import { AccordionItem, type AccordionItemProps } from "./accordion-item.js";
import { AccordionRoot, type AccordionRootProps } from "./accordion-root.js";
import { AccordionTrigger, type AccordionTriggerProps } from "./accordion-trigger.js";
import type {
  AccordionInstance,
  AccordionItemBoundHelpers,
  AccordionItemDescriptor,
  AccordionItemInstance,
  AccordionItemOptions,
  UseAccordionOptions,
} from "./types.js";
import { useAccordion } from "./use-accordion.js";
import { useAccordionItem } from "./use-accordion-item.js";

/**
 * Creates an Accordion state coordinator instance with pre-bound compound element helpers.
 */
export function createAccordion(options: UseAccordionOptions = {}): AccordionInstance {
  const { animation: defaultAnimation, ...accordionOptions } = options;
  const instance = useAccordion(accordionOptions);

  let currentItemInstance: AccordionItemInstance | null = null;

  const createItem = (itemOptions: AccordionItemOptions): AccordionItemInstance & AccordionItemBoundHelpers => {
    const itemInstance = useAccordionItem(instance, itemOptions);

    const Root = <T extends keyof SeidrElementTagNameMap = "div">(
      props: AccordionItemProps<T> = {},
      children?: SeidrChild,
    ) => AccordionItem<T>({ instance: itemInstance, ...props } as AccordionItemProps<T>, children);

    const Header = <T extends keyof SeidrElementTagNameMap = "h3">(
      props: AccordionHeaderProps<T> = {},
      children?: SeidrChild,
    ) => AccordionHeader<T>({ instance: itemInstance, ...props } as AccordionHeaderProps<T>, children);

    const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
      props: AccordionTriggerProps<T> = {},
      children?: SeidrChild,
    ) => AccordionTrigger<T>({ instance: itemInstance, ...props } as AccordionTriggerProps<T>, children);

    const Content = <T extends keyof SeidrElementTagNameMap = "div">(
      props: AccordionContentProps<T> = {},
      children?: SeidrChild,
    ) =>
      AccordionContent<T>(
        { instance: itemInstance, animation: defaultAnimation, ...props } as AccordionContentProps<T>,
        children,
      );

    return {
      ...itemInstance,
      Root,
      Item: Root,
      Header,
      Trigger,
      Content,
    };
  };

  const Root = <T extends keyof SeidrElementTagNameMap = "div">(
    props: AccordionRootProps<T> = {},
    children?: SeidrChild,
  ) => AccordionRoot<T>({ instance, ...props } as AccordionRootProps<T>, children);

  const Item = <T extends keyof SeidrElementTagNameMap = "div">(
    optionsOrProps: SeidrElementProps<T> & AccordionItemDescriptor, // No specific type can be distinguished
    children?: SeidrChild,
  ) => {
    const {
      value,
      disabled,
      forceMount,
      id,
      trigger,
      content,
      animation,
      headerAs = "h3",
      itemProps,
      headerProps,
      triggerProps,
      contentProps,
      ...rootProps
    } = optionsOrProps;

    const itemInstance = useAccordionItem(instance, { value, disabled, forceMount, id: id as string });

    if (!isUndef(children)) {
      const prev = currentItemInstance;
      currentItemInstance = itemInstance;
      try {
        return AccordionItem<T>(
          { instance: itemInstance, ...(itemProps ?? {}), ...rootProps } as AccordionItemProps<T>,
          children,
        );
      } finally {
        currentItemInstance = prev;
      }
    }

    const headerEl = AccordionHeader<T>(
      { instance: itemInstance, as: headerAs, ...(headerProps ?? {}) } as AccordionHeaderProps<T>,
      AccordionTrigger<T>({ instance: itemInstance, ...(triggerProps ?? {}) } as AccordionTriggerProps<T>, trigger),
    );

    const contentEl = AccordionContent<T>(
      {
        instance: itemInstance,
        animation: animation ?? defaultAnimation,
        ...(contentProps ?? {}),
      } as AccordionContentProps<T>,
      content,
    );

    return AccordionItem<T>({ instance: itemInstance, ...(itemProps ?? {}), ...rootProps } as AccordionItemProps<T>, [
      headerEl as typeof headerEl,
      contentEl as typeof contentEl,
    ]);
  };

  const Header = <T extends keyof SeidrElementTagNameMap = "h3">(
    props: AccordionHeaderProps<T> = {},
    children?: SeidrChild,
  ) =>
    AccordionHeader<T>(
      { instance: props.instance ?? currentItemInstance, ...props } as AccordionHeaderProps<T>,
      children,
    );

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: AccordionTriggerProps<T> = {},
    children?: SeidrChild,
  ) =>
    AccordionTrigger<T>(
      { instance: props.instance ?? currentItemInstance, ...props } as AccordionTriggerProps<T>,
      children,
    );

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: AccordionContentProps<T> = {},
    children?: SeidrChild,
  ) =>
    AccordionContent<T>(
      {
        instance: props.instance ?? currentItemInstance,
        animation: props.animation ?? defaultAnimation,
        ...props,
      } as AccordionContentProps<T>,
      children,
    );

  return {
    ...instance,
    Root,
    Item,
    Header,
    Trigger,
    Content,
    createItem,
  };
}
