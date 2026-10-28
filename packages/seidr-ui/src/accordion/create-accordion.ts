import { isUndef } from "@fimbul-works/hvat";
import type { SeidrChild, SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { AccordionContent } from "./accordion-content.js";
import { AccordionHeader } from "./accordion-header.js";
import { AccordionItem } from "./accordion-item.js";
import { AccordionRoot } from "./accordion-root.js";
import { AccordionTrigger } from "./accordion-trigger.js";
import type {
  AccordionInstance,
  AccordionItemBoundHelpers,
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

  const createItem = (
    itemOptions: AccordionItemOptions,
  ): AccordionItemInstance & AccordionItemBoundHelpers => {
    const itemInstance = useAccordionItem(instance, itemOptions);

    const Root = <T extends keyof SeidrElementTagNameMap = "div">(
      props = {},
      children?: SeidrChild | SeidrChild[],
    ) => AccordionItem<T>({ instance: itemInstance, ...props } as any, children);

    const Header = <T extends keyof SeidrElementTagNameMap = "h3">(
      props = {},
      children?: SeidrChild | SeidrChild[],
    ) => AccordionHeader<T>({ instance: itemInstance, ...props } as any, children);

    const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
      props = {},
      children?: SeidrChild | SeidrChild[],
    ) => AccordionTrigger<T>({ instance: itemInstance, ...props } as any, children);

    const Content = <T extends keyof SeidrElementTagNameMap = "div">(
      props = {},
      children?: SeidrChild | SeidrChild[],
    ) => AccordionContent<T>({ instance: itemInstance, animation: defaultAnimation, ...props } as any, children);

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
    props = {},
    children?: SeidrChild | SeidrChild[],
  ) => AccordionRoot<T>({ instance, ...props } as any, children);

  const Item = <T extends keyof SeidrElementTagNameMap = "div">(
    optionsOrProps: any,
    children?: SeidrChild | SeidrChild[],
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

    const itemInstance = useAccordionItem(instance, { value, disabled, forceMount, id });

    if (!isUndef(children)) {
      const prev = currentItemInstance;
      currentItemInstance = itemInstance;
      try {
        return AccordionItem<T>(
          { instance: itemInstance, ...(itemProps ?? {}), ...rootProps } as any,
          children,
        );
      } finally {
        currentItemInstance = prev;
      }
    }

    const headerEl = AccordionHeader(
      { instance: itemInstance, as: headerAs, ...(headerProps ?? {}) },
      [
        AccordionTrigger(
          { instance: itemInstance, ...(triggerProps ?? {}) },
          trigger,
        ),
      ],
    );

    const contentEl = AccordionContent(
      { instance: itemInstance, animation: animation ?? defaultAnimation, ...(contentProps ?? {}) },
      content,
    );

    return AccordionItem<T>(
      { instance: itemInstance, ...(itemProps ?? {}), ...rootProps } as any,
      [headerEl, contentEl as any],
    );
  };

  const Header = <T extends keyof SeidrElementTagNameMap = "h3">(
    props: any = {},
    children?: SeidrChild | SeidrChild[],
  ) => {
    const inst = props.instance ?? currentItemInstance;
    return AccordionHeader<T>({ instance: inst, ...props }, children);
  };

  const Trigger = <T extends keyof SeidrElementTagNameMap = "button">(
    props: any = {},
    children?: SeidrChild | SeidrChild[],
  ) => {
    const inst = props.instance ?? currentItemInstance;
    return AccordionTrigger<T>({ instance: inst, ...props }, children);
  };

  const Content = <T extends keyof SeidrElementTagNameMap = "div">(
    props: any = {},
    children?: SeidrChild | SeidrChild[],
  ) => {
    const inst = props.instance ?? currentItemInstance;
    return AccordionContent<T>({ instance: inst, animation: props.animation ?? defaultAnimation, ...props }, children);
  };

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
