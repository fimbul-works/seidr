import { resolvePropsAndChildren, type SeidrChild, type SeidrElementTagNameMap } from "@fimbul-works/seidr";
import { BreadcrumbsItem } from "./breadcrumbs-item.js";
import { BreadcrumbsLink } from "./breadcrumbs-link.js";
import { BreadcrumbsList } from "./breadcrumbs-list.js";
import { BreadcrumbsRoot } from "./breadcrumbs-root.js";
import { BreadcrumbsSeparator } from "./breadcrumbs-separator.js";
import type {
  BreadcrumbsInstance,
  BreadcrumbsItemProps,
  BreadcrumbsLinkProps,
  BreadcrumbsListProps,
  BreadcrumbsRootProps,
  BreadcrumbsSeparatorProps,
  UseBreadcrumbsOptions,
} from "./types.js";
import { useBreadcrumbs } from "./use-breadcrumbs.js";

/**
 * Creates a Breadcrumbs coordinator instance with pre-bound compound element helpers.
 *
 * @param {UseBreadcrumbsOptions} [options={}] - Configuration options
 * @returns {BreadcrumbsInstance} Breadcrumbs coordinator instance
 */
export function createBreadcrumbs(options: UseBreadcrumbsOptions = {}): BreadcrumbsInstance {
  const instance = useBreadcrumbs(options);

  return {
    ...instance,
    Root: <T extends keyof SeidrElementTagNameMap = "nav">(
      propsOrChildren?: BreadcrumbsRootProps<T> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren<BreadcrumbsRootProps<T>>(propsOrChildren, children);
      return BreadcrumbsRoot({ instance, ...props }, content);
    },
    List: <T extends keyof SeidrElementTagNameMap = "ol">(
      propsOrChildren?: BreadcrumbsListProps<T> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren<BreadcrumbsListProps<T>>(propsOrChildren, children);
      return BreadcrumbsList({ instance, ...props }, content);
    },
    Item: <T extends keyof SeidrElementTagNameMap = "li">(
      propsOrChildren?: BreadcrumbsItemProps<T> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren<BreadcrumbsItemProps<T>>(propsOrChildren, children);
      return BreadcrumbsItem({ instance, ...props }, content);
    },
    Link: <T extends keyof SeidrElementTagNameMap = "a">(
      propsOrChildren?: BreadcrumbsLinkProps<T> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren<BreadcrumbsLinkProps<T>>(propsOrChildren, children);
      return BreadcrumbsLink({ instance, ...props }, content);
    },
    Separator: <T extends keyof SeidrElementTagNameMap = "span">(
      propsOrChildren?: BreadcrumbsSeparatorProps<T> | SeidrChild | SeidrChild[],
      children?: SeidrChild | SeidrChild[],
    ) => {
      const [props, content] = resolvePropsAndChildren<BreadcrumbsSeparatorProps<T>>(propsOrChildren, children);
      return BreadcrumbsSeparator({ instance, ...props }, content);
    },
  };
}
