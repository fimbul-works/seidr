import { describe, it, expect, beforeEach } from 'vitest';
import { ObservableValue } from '@fimbul-works/observable';
import {
  createScope,
  component,
  mount,
  mountConditional,
  mountList,
  mountSwitch
} from './component';
import type { Component } from './component';

// Mock DOM elements for testing
function createMockElement(tagName = 'div') {
  return document.createElement(tagName);
}

describe('createScope', () => {
  it('should create a scope with track, child, and destroy methods', () => {
    const scope = createScope();

    expect(scope).toHaveProperty('track');
    expect(scope).toHaveProperty('child');
    expect(scope).toHaveProperty('destroy');
    expect(typeof scope.track).toBe('function');
    expect(typeof scope.child).toBe('function');
    expect(typeof scope.destroy).toBe('function');
  });

  it('should track cleanup functions and call them on destroy', () => {
    const scope = createScope();
    let cleanupCalled = false;

    scope.track(() => {
      cleanupCalled = true;
    });

    expect(cleanupCalled).toBe(false);

    scope.destroy();

    expect(cleanupCalled).toBe(true);
  });

  it('should track multiple cleanup functions', () => {
    const scope = createScope();
    let cleanup1Called = false;
    let cleanup2Called = false;

    scope.track(() => { cleanup1Called = true; });
    scope.track(() => { cleanup2Called = true; });

    scope.destroy();

    expect(cleanup1Called).toBe(true);
    expect(cleanup2Called).toBe(true);
  });

  it('should not execute cleanup functions twice on multiple destroy calls', () => {
    const scope = createScope();
    let cleanupCount = 0;

    scope.track(() => { cleanupCount++; });

    scope.destroy();
    scope.destroy();

    expect(cleanupCount).toBe(1);
  });

  it('should execute cleanup immediately if tracked after destroy', () => {
    const scope = createScope();
    let cleanupCalled = false;

    scope.destroy();

    scope.track(() => { cleanupCalled = true; });

    expect(cleanupCalled).toBe(true);
  });

  it('should track child components and destroy them when parent is destroyed', () => {
    const scope = createScope();
    let childDestroyed = false;

    const mockChild: Component = {
      element: createMockElement(),
      destroy: () => { childDestroyed = true; }
    };

    scope.child(mockChild);
    scope.destroy();

    expect(childDestroyed).toBe(true);
  });
});

describe('component', () => {
  it('should create a component with element and destroy method', () => {
    const mockElement = createMockElement();
    const comp = component((scope) => {
      return mockElement;
    });

    expect(comp).toHaveProperty('element');
    expect(comp).toHaveProperty('destroy');
    expect(comp.element).toBe(mockElement);
    expect(typeof comp.destroy).toBe('function');
  });

  it('should call destroy on scope when component is destroyed', () => {
    let scopeDestroyed = false;

    const comp = component((scopeParam) => {
      // Override destroy for testing
      const originalDestroy = scopeParam.destroy;
      scopeParam.destroy = () => {
        scopeDestroyed = true;
        originalDestroy();
      };
      return createMockElement();
    });

    expect(scopeDestroyed).toBe(false);

    comp.destroy();

    expect(scopeDestroyed).toBe(true);
  });
});

describe('mount', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createMockElement();
  });

  it('should mount component into container', () => {
    const mockElement = createMockElement();
    const comp = component(() => mockElement);

    mount(comp, container);

    expect(container.contains(mockElement)).toBe(true);
  });

  it('should return unmount function', () => {
    const mockElement = createMockElement();
    const comp = component(() => mockElement);

    const unmount = mount(comp, container);

    expect(typeof unmount).toBe('function');
    expect(container.contains(mockElement)).toBe(true);

    unmount();

    expect(container.contains(mockElement)).toBe(false);
  });
});

describe('mountConditional', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createMockElement();
  });

  it('should mount component when condition is true', () => {
    const condition = new ObservableValue(true);
    const mockElement = createMockElement();

    mountConditional(
      condition,
      () => component(() => mockElement),
      container
    );

    expect(container.contains(mockElement)).toBe(true);
  });

  it('should not mount component when condition is false', () => {
    const condition = new ObservableValue(false);
    const mockElement = createMockElement();

    mountConditional(
      condition,
      () => component(() => mockElement),
      container
    );

    expect(container.contains(mockElement)).toBe(false);
  });

  it('should toggle component based on condition changes', () => {
    const condition = new ObservableValue(false);
    const mockElement = createMockElement();

    const conditional = mountConditional(
      condition,
      () => component(() => mockElement),
      container
    );

    expect(container.contains(mockElement)).toBe(false);

    condition.set(true);

    expect(container.contains(mockElement)).toBe(true);

    condition.set(false);

    expect(container.contains(mockElement)).toBe(false);
  });

  it('should clean up when destroyed', () => {
    const condition = new ObservableValue(true);
    const mockElement = createMockElement();
    let componentDestroyed = false;

    const conditional = mountConditional(
      condition,
      () => {
        const comp = component(() => mockElement);
        // Override destroy to track if it was called
        const originalDestroy = comp.destroy;
        comp.destroy = () => {
          componentDestroyed = true;
          originalDestroy();
        };
        return comp;
      },
      container
    );

    expect(container.contains(mockElement)).toBe(true);
    expect(componentDestroyed).toBe(false);

    conditional.destroy();

    expect(container.contains(mockElement)).toBe(false);
    expect(componentDestroyed).toBe(true);
  });
});

describe('mountList', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createMockElement();
  });

  it('should render initial list of items', () => {
    const items = new ObservableValue([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) => component(() => {
        const el = createMockElement('li');
        el.textContent = item.name;
        return el;
      }),
      container
    );

    expect(container.children.length).toBe(2);
    expect(container.children[0].textContent).toBe('Item 1');
    expect(container.children[1].textContent).toBe('Item 2');
  });

  it('should add new items when array grows', () => {
    const items = new ObservableValue([
      { id: 1, name: 'Item 1' }
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) => component(() => {
        const el = createMockElement('li');
        el.textContent = item.name;
        return el;
      }),
      container
    );

    expect(container.children.length).toBe(1);

    items.set([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ]);

    expect(container.children.length).toBe(2);
    expect(container.children[1].textContent).toBe('Item 2');
  });

  it('should remove items when array shrinks', () => {
    const items = new ObservableValue([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) => component(() => {
        const el = createMockElement('li');
        el.textContent = item.name;
        return el;
      }),
      container
    );

    expect(container.children.length).toBe(3);

    items.set([
      { id: 1, name: 'Item 1' },
      { id: 3, name: 'Item 3' }
    ]);

    expect(container.children.length).toBe(2);
    expect(container.children[0].textContent).toBe('Item 1');
    expect(container.children[1].textContent).toBe('Item 3');
  });

  it('should reorder items when order changes', () => {
    const items = new ObservableValue([
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ]);

    mountList(
      items,
      (item) => item.id,
      (item) => component(() => {
        const el = createMockElement('li');
        el.textContent = item.name;
        return el;
      }),
      container
    );

    expect(container.children[0].textContent).toBe('Item 1');
    expect(container.children[1].textContent).toBe('Item 2');

    items.set([
      { id: 2, name: 'Item 2' },
      { id: 1, name: 'Item 1' }
    ]);

    expect(container.children[0].textContent).toBe('Item 2');
    expect(container.children[1].textContent).toBe('Item 1');
  });

  it('should clean up when destroyed', () => {
    const items = new ObservableValue([
      { id: 1, name: 'Item 1' }
    ]);
    let componentDestroyed = false;

    const list = mountList(
      items,
      (item) => item.id,
      (item) => {
        const comp = component(() => {
          const el = createMockElement('li');
          el.textContent = item.name;
          return el;
        });
        const originalDestroy = comp.destroy;
        comp.destroy = () => {
          componentDestroyed = true;
          originalDestroy();
        };
        return comp;
      },
      container
    );

    expect(container.children.length).toBe(1);
    expect(componentDestroyed).toBe(false);

    list.destroy();

    expect(container.children.length).toBe(0);
    expect(componentDestroyed).toBe(true);
  });
});

describe('mountSwitch', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = createMockElement();
  });

  it('should render component based on initial value', () => {
    const mode = new ObservableValue<'list' | 'grid'>('list');
    const listElement = createMockElement('div');
    const gridElement = createMockElement('div');

    mountSwitch(
      mode,
      {
        list: () => component(() => listElement),
        grid: () => component(() => gridElement)
      },
      container
    );

    expect(container.contains(listElement)).toBe(true);
    expect(container.contains(gridElement)).toBe(false);
  });

  it('should switch components when observable value changes', () => {
    const mode = new ObservableValue<'list' | 'grid'>('list');
    const listElement = createMockElement('div');
    const gridElement = createMockElement('div');

    mountSwitch(
      mode,
      {
        list: () => component(() => listElement),
        grid: () => component(() => gridElement)
      },
      container
    );

    expect(container.contains(listElement)).toBe(true);
    expect(container.contains(gridElement)).toBe(false);

    mode.set('grid');

    expect(container.contains(listElement)).toBe(false);
    expect(container.contains(gridElement)).toBe(true);
  });

  it('should handle missing component factories gracefully', () => {
    const mode = new ObservableValue<'list' | 'grid' | 'unknown'>('unknown' as const);
    const listElement = createMockElement('div');
    const gridElement = createMockElement('div');

    // Use type assertion to allow 'unknown' key
    mountSwitch(
      mode as ObservableValue<'list' | 'grid'>,
      {
        list: () => component(() => listElement),
        grid: () => component(() => gridElement)
      },
      container
    );

    expect(container.contains(listElement)).toBe(false);
    expect(container.contains(gridElement)).toBe(false);
    expect(container.children.length).toBe(0);
  });

  it('should clean up when destroyed', () => {
    const mode = new ObservableValue<'list' | 'grid'>('list');
    const listElement = createMockElement('div');
    let componentDestroyed = false;

    const switcher = mountSwitch(
      mode,
      {
        list: () => {
          const comp = component(() => listElement);
          const originalDestroy = comp.destroy;
          comp.destroy = () => {
            componentDestroyed = true;
            originalDestroy();
          };
          return comp;
        },
        grid: () => component(() => createMockElement('div'))
      },
      container
    );

    expect(container.contains(listElement)).toBe(true);
    expect(componentDestroyed).toBe(false);

    switcher.destroy();

    expect(container.contains(listElement)).toBe(false);
    expect(componentDestroyed).toBe(true);
  });
});