import { type SeidrComponent, wrapComponent } from "../component";
import { $fragment, clearBetween, type SeidrElement, type SeidrNode } from "../element";
import { getRenderContext } from "../render-context";
import type { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";

// ... (comments)

export function mountConditional<T extends SeidrNode>(
  condition: Seidr<boolean>,
  factory: () => T,
  container: HTMLElement | SeidrElement,
): CleanupFunction {
  // Bind the container to the render context if not already bound
  const ctx = getRenderContext();
  if (!ctx.rootNode) {
    ctx.rootNode = container;
  }

  const fragment = $fragment([], `mount-conditional:${ctx.ctxID}-:${ctx.idCounter++}`);
  // Use standard DOM API
  container.appendChild(fragment as Node);

  let currentComponent: SeidrComponent | null = null;

  // ... (update function remains mostly same, remove() on component is fine if unmount() handles it,
  // but wait, component.element.remove() was monkey-patched in component.ts to allow unmount.
  // The user kept monkey-patching for Elements but not Fragments.
  // Conditional factory usually returns a Component or Element.
  // If it's a component, verify wrapComponent handles it.
  // If it returns a Node, wrapComponent wraps it.
  // So currentComponent is a SeidrComponent.
  // So currentComponent.unmount() is safer than .element.remove() if fragment.
  // I will switch to unmount() here too.)

  const update = (shouldShow: boolean) => {
    if (shouldShow && !currentComponent) {
      currentComponent = wrapComponent(factory)();
      // Fragment support: appendChild works for both Element and Fragment
      fragment.appendChild(currentComponent.element as any);

      // Trigger onAttached when component is added to DOM
      if (currentComponent.scope.onAttached) {
        currentComponent.scope.onAttached(container as any);
      }
    } else if (!shouldShow && currentComponent) {
      currentComponent.unmount();
      currentComponent = null;
    }
  };

  // Initial state
  update(condition.value);

  // Reactive updates
  const cleanup = condition.observe((val) => update(val));

  // Return combined cleanup
  return () => {
    cleanup();
    if (currentComponent) {
      currentComponent.unmount();
    }
    // Inline Fragment Cleanup
    if (fragment.start && fragment.end) {
      clearBetween(fragment.start, fragment.end);
      if (fragment.start.parentNode) fragment.start.remove();
      if (fragment.end.parentNode) fragment.end.remove();
    }
  };
}
