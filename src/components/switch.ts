import { component } from "../component/component";
import type { SeidrComponent, SeidrComponentChildren, SeidrComponentFactory } from "../component/types";
import { useScope } from "../component/use-scope";
import { wrapComponent } from "../component/wrap-component";
import { getMarkerComments } from "../dom/get-marker-comments";
import type { Seidr } from "../seidr";
import { isDOMNode } from "../util/type-guards/dom-node-types";
import { isArray } from "../util/type-guards/primitive-types";

/**
 * Switches between different components based on an observable value.
 *
 * @template T - The type of the observable value
 * @template {Map<T, (val: T) => SeidrComponentChildren> | Record<string, (val: T) => SeidrComponentChildren>} M - The type of the factories object
 *
 * @param {Seidr<T>} observable - Observable value to switch on
 * @param {M} factories - Map or object of cases to component factories (raw or wrapped)
 * @param {(val: T) => SeidrComponentChildren} [defaultCase] - Optional fallback component factory
 * @returns {SeidrComponent} A component
 */
export const Switch = <
  T,
  M extends Map<T, (val: T) => SeidrComponentChildren> | Record<string, (val: T) => SeidrComponentChildren>,
>(
  observable: Seidr<T>,
  factories: M,
  defaultCase?: (val: T) => SeidrComponentChildren,
): SeidrComponent =>
  component(() => {
    const scope = useScope();
    const markers = getMarkerComments(scope.id);
    let currentComponent: SeidrComponent | null = null;

    const update = (value: T) => {
      const end = markers[1];
      const parent = end.parentNode;
      if (!parent) {
        console.error("Switch: parent node not found");
        return;
      }

      const caseFactory = factories instanceof Map ? factories.get(value) : factories[value as keyof M];
      const factory = caseFactory || defaultCase;

      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = null;
      }

      if (factory) {
        currentComponent = wrapComponent(factory as SeidrComponentFactory<typeof value>)(value);

        if (currentComponent.start) {
          parent.insertBefore(currentComponent.start, end);
        }

        const el = currentComponent.element;
        if (isArray(el)) {
          el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, end));
        } else if (isDOMNode(el)) {
          parent.insertBefore(el, end);
        }

        if (currentComponent.end) {
          parent.insertBefore(currentComponent.end, end);
        }

        currentComponent.scope.attached(parent);
      }
    };

    scope.track(observable.observe(update));
    scope.track(() => currentComponent?.unmount());
    scope.onAttached = () => update(observable.value);

    return [];
  }, "Switch")();
