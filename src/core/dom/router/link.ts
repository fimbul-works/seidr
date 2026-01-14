import { Seidr } from "../../seidr";
import { cn, unwrapSeidr, wrapSeidr } from "../../util/index";
import { component, type SeidrComponent, useScope } from "../component";
import { $, type ReactiveProps, type SeidrElement, type SeidrNode } from "../element";
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
 * @param {LinkProps & ReactiveProps<K, HTMLElementTagNameMap[K]>} props - Link props with reactive bindings
 * @param {(SeidrNode | (() => SeidrNode))[]} [children] - Optional child nodes (default: `[]`)
 * @returns {SeidrComponent<K, SeidrElement<K>>} SeidrComponent that wraps an anchor element
 *
 * @example
 * Basic Link
 * ```typescript
 * import { Link, component, $div } from '@fimbul-works/seidr';
 *
 * const App = component(() => {
 *   return $div({}, [
 *     Link({ to: '/about' }, ['About']),
 *     Link({ to: '/', activeClass: 'current' }, ['Home'])
 *   ]);
 * });
 * ```
 *
 * @example
 * Link with custom tagName and reactive active state
 * ```typescript
 * const currentPath = new Seidr('/');
 *
 * const App = component(() => {
 *   return $div({}, [
 *     Link({
 *       to: currentPath.as(p => p === '/home' ? '/' : '/home'),
 *       tagName: 'button',
 *       activeProp: 'aria-current',
 *       activeValue: 'page'
 *     }, ['Home'])
 *   ]);
 * });
 * ```
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
  }: LinkProps<K> & ReactiveProps<K, HTMLElementTagNameMap[K]>,
  children: (SeidrNode | (() => SeidrNode))[] = [],
): SeidrComponent<SeidrElement<K>> {
  return component(() => {
    const scope = useScope();

    // If to is a Seidr, observe it; otherwise wrap it in a Seidr
    const toValue = wrapSeidr(to);
    const val = activeValue ?? activeClass;
    const currentPath = getCurrentPath();

    // Create a combined computed that depends on both currentPath and toValue
    const isActive = Seidr.computed(
      () => normalizePath(currentPath.value) === normalizePath(unwrapSeidr(toValue)),
      [currentPath, toValue],
    );

    // Build props object with reactive bindings
    const props: Record<string, any> = {
      ...restProps,
      href: toValue,
      onclick: (e: Event) => {
        e.preventDefault();
        navigate(unwrapSeidr(toValue));
      },
    };

    // Handle className reactively if activeProp is className
    if (activeProp === "className") {
      props.className = isActive.as((active) => cn(active ? val : "", className));
    } else {
      props.className = className;
      // Set up reactive binding for custom prop (like aria-current)
      const activeValueBinding = new Seidr<string | null>(val);
      scope.track(isActive.bind(activeValueBinding, (active, binding) => (binding.value = active ? val : null)));
      props[activeProp] = activeValueBinding;
    }

    return $(tagName as K, props as any, children);
  })();
}
