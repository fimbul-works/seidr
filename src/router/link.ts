import { component } from "../component/component";
import type { SeidrComponent } from "../component/types";
import { useScope } from "../component/use-scope";
import { $, type SeidrElementProps, type SeidrNode } from "../element";
import { Seidr, unwrapSeidr } from "../seidr";
import { NO_HYDRATE } from "../seidr/constants";
import { cn } from "../util/cn";
import { isSeidr } from "../util/type-guards";
import { getCurrentPath } from "./get-current-path";
import { navigate } from "./navigate";
import { normalizePath } from "./normalize-path";

/**
 * Link component props.
 */
export interface LinkProps<K extends keyof HTMLElementTagNameMap> {
  to: string | Seidr<string>;
  tagName?: K;
  activeClass?: string;
  activeProp?: string;
  activeValue?: string;
  className?: string | Seidr<string>;
}

/**
 * Link component for Route.
 * @param {LinkProps & SeidrElementProps<K>} props - Link props with reactive bindings
 * @param {(SeidrNode | (() => SeidrNode))[]} [children] - Optional child nodes (default: `[]`)
 * @returns {SeidrComponent} SeidrComponent that wraps an anchor element
 */
export function Link<K extends keyof HTMLElementTagNameMap = "a">(
  {
    to,
    tagName = "a" as K,
    activeClass = "active",
    activeProp = "className",
    activeValue = undefined,
    className,
    ...restProps
  }: LinkProps<K> & SeidrElementProps<K>,
  children: SeidrNode[] = [],
): SeidrComponent {
  return component(() => {
    const scope = useScope();

    // If to is a Seidr, observe it; otherwise wrap it in a Seidr
    // We opt-out of hydration for this internal Seidr to save space
    const toValue = isSeidr(to) ? to : new Seidr(to, NO_HYDRATE);
    const val = activeValue ?? activeClass;
    const currentPath = getCurrentPath();

    // Create a combined merge that depends on both currentPath and toValue
    const isActive = Seidr.merge(
      () => normalizePath(currentPath.value) === normalizePath(unwrapSeidr(toValue)),
      [currentPath, toValue],
      NO_HYDRATE,
    );

    // Build props object with reactive bindings
    const props: Record<string, any> = {
      ...restProps,
      href: toValue,
    };

    // Handle className reactively if activeProp is className
    if (activeProp === "className") {
      props.className = isActive.as((active) => cn(active ? val : "", className), NO_HYDRATE);
    } else {
      props.className = className;
      // Set up reactive binding for custom prop (like aria-current)
      const activeValueBinding = new Seidr<string | null>(val, NO_HYDRATE);
      scope.track(isActive.bind(activeValueBinding, (active, binding) => (binding.value = active ? val : null)));
      props[activeProp] = activeValueBinding;
    }

    const el = $(tagName as K, props as any, children);
    scope.track(
      el.on("click", (e: Event) => {
        e.preventDefault();
        navigate(unwrapSeidr(toValue));
      }),
    );

    return el;
  }, "Link")();
}
