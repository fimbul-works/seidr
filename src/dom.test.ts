import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  makeEl,
  el,
  on,
  $,
  $$,
  TextNode,
  DivEl,
  ButtonEl,
  InputEl,
  SpanEl,
  AEl,
} from './dom';
import type { HTMLElementExtras } from './dom';

describe('makeEl', () => {
  it('should create basic HTML element', () => {
    const div = makeEl('div');

    expect(div.tagName).toBe('DIV');
    expect(div instanceof HTMLElement).toBe(true);
  });

  it('should assign properties to element', () => {
    const div = makeEl('div', {
      id: 'test-id',
      className: 'test-class',
      textContent: 'Hello World'
    });

    expect(div.id).toBe('test-id');
    expect(div.className).toBe('test-class');
    expect(div.textContent).toBe('Hello World');
  });

  it('should append children to element', () => {
    const child1 = document.createElement('span');
    const child2 = document.createTextNode('text');
    const div = makeEl('div', {}, [child1, child2]);

    expect(div.children.length).toBe(1);
    expect(div.children[0]).toBe(child1);
    expect(div.childNodes.length).toBe(2);
    expect(div.childNodes[1]).toBe(child2);
  });

  it('should add on method to element', () => {
    const div = makeEl('div');

    expect('on' in div).toBe(true);
    expect(typeof (div as any).on).toBe('function');
  });

  it('should work with different HTML elements', () => {
    const button = makeEl('button', { type: 'button', textContent: 'Click me' });
    const input = makeEl('input', { type: 'text', placeholder: 'Enter text' });
    const anchor = makeEl('a', { href: '#', textContent: 'Link' });

    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');
    expect(button.textContent).toBe('Click me');

    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('text');
    expect(input.placeholder).toBe('Enter text');

    expect(anchor.tagName).toBe('A');
    expect(anchor.href).toContain('#');
    expect(anchor.textContent).toBe('Link');
  });
});

describe('el', () => {
  it('should return a function that creates elements', () => {
    const createDiv = el('div');
    const div = createDiv({ className: 'test' });

    expect(typeof createDiv).toBe('function');
    expect(div.tagName).toBe('DIV');
    expect(div.className).toBe('test');
  });

  it('should create specialized element creators', () => {
    const createInput = el('input');
    const createButton = el('button');

    const input = createInput({ type: 'number', value: '42' });
    const button = createButton({ textContent: 'Submit' });

    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('number');
    expect(input.value).toBe('42');

    expect(button.tagName).toBe('BUTTON');
    expect(button.textContent).toBe('Submit');
  });

  it('should handle optional parameters correctly', () => {
    const createDiv = el('div');

    // No parameters
    const div1 = createDiv();
    expect(div1.tagName).toBe('DIV');

    // Only props
    const div2 = createDiv({ id: 'test' });
    expect(div2.id).toBe('test');

    // Props and children
    const child = document.createElement('span');
    const div3 = createDiv({ id: 'parent' }, [child]);
    expect(div3.id).toBe('parent');
    expect(div3.contains(child)).toBe(true);
  });
});

describe('on (event listeners)', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it('should add event listener and return cleanup function', () => {
    const handler = vi.fn();
    const cleanup = on(element, 'click', handler);

    expect(typeof cleanup).toBe('function');

    // Trigger event
    element.click();

    expect(handler).toHaveBeenCalledTimes(1);

    // Cleanup
    cleanup();

    // Trigger event again
    element.click();

    // Handler should not be called again
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should work with different event types', () => {
    const clickHandler = vi.fn();
    const keydownHandler = vi.fn();

    const clickCleanup = on(element, 'click', clickHandler);
    const keydownCleanup = on(element, 'keydown', keydownHandler);

    element.click();
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(keydownHandler).toHaveBeenCalledTimes(1);

    clickCleanup();
    keydownCleanup();
  });

  it('should pass correct event arguments to handler', () => {
    const handler = vi.fn();
    on(element, 'click', handler);

    element.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    // 'this' context is not captured in the mock calls array, so we can't test it directly
  });

  it('should work with event listener options', () => {
    const handler = vi.fn();
    const options = { once: true };

    on(element, 'click', handler, options);

    element.click();
    element.click();

    expect(handler).toHaveBeenCalledTimes(1); // Should only be called once due to 'once' option
  });
});

describe('element on method', () => {
  it('should provide on method on created elements', () => {
    const div = makeEl('div');
    const handler = vi.fn();

    expect('on' in div).toBe(true);

    // TypeScript should infer the correct types
    const cleanup = (div as HTMLElementExtras).on('click', handler);

    expect(typeof cleanup).toBe('function');

    div.click();

    expect(handler).toHaveBeenCalledTimes(1);

    cleanup();

    div.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('$ (query selector)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should find element by query', () => {
    const testDiv = document.createElement('div');
    testDiv.id = 'test-element';
    document.body.appendChild(testDiv);

    const found = $('div#test-element');

    expect(found).toBe(testDiv);
    expect(found?.id).toBe('test-element');
  });

  it('should return null when element not found', () => {
    const found = $('.non-existent');

    expect(found).toBeNull();
  });

  it('should search within specified element', () => {
    const container = document.createElement('div');
    const inner = document.createElement('span');
    inner.className = 'inner';

    container.appendChild(inner);
    document.body.appendChild(container);

    const found = $('.inner', container);

    expect(found).toBe(inner);
  });

  it('should use document.body as default search scope', () => {
    const testDiv = document.createElement('div');
    testDiv.className = 'body-element';
    document.body.appendChild(testDiv);

    const found = $('.body-element');

    expect(found).toBe(testDiv);
  });
});

describe('$$ (query selector all)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should find all matching elements', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    const span = document.createElement('span');

    div1.className = 'item';
    div2.className = 'item';
    span.className = 'item';

    document.body.appendChild(div1);
    document.body.appendChild(div2);
    document.body.appendChild(span);

    const found = $$('.item');

    expect(found.length).toBe(3);
    expect(found).toContain(div1);
    expect(found).toContain(div2);
    expect(found).toContain(span);
  });

  it('should return empty array when no elements found', () => {
    const found = $$('.non-existent');

    expect(found).toEqual([]);
  });

  it('should search within specified element', () => {
    const container = document.createElement('div');
    const inner1 = document.createElement('span');
    const inner2 = document.createElement('span');
    const outer = document.createElement('span');

    inner1.className = 'inner-item';
    inner2.className = 'inner-item';
    outer.className = 'inner-item';

    container.appendChild(inner1);
    container.appendChild(inner2);
    document.body.appendChild(container);
    document.body.appendChild(outer);

    const found = $$('.inner-item', container);

    expect(found.length).toBe(2);
    expect(found).toContain(inner1);
    expect(found).toContain(inner2);
    expect(found).not.toContain(outer);
  });
});

describe('predefined element creators', () => {
  it('should create elements with correct types', () => {
    const div = DivEl({ className: 'container' });
    const button = ButtonEl({ textContent: 'Click' });
    const input = InputEl({ type: 'text' });
    const span = SpanEl({ textContent: 'Hello' });
    const anchor = AEl({ href: '#', textContent: 'Link' });

    expect(div.tagName).toBe('DIV');
    expect(div.className).toBe('container');

    expect(button.tagName).toBe('BUTTON');
    expect(button.textContent).toBe('Click');

    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('text');

    expect(span.tagName).toBe('SPAN');
    expect(span.textContent).toBe('Hello');

    expect(anchor.tagName).toBe('A');
    expect(anchor.href).toContain('#');
    expect(anchor.textContent).toBe('Link');
  });

  it('should support children arrays', () => {
    const text1 = TextNode('Hello ');
    const text2 = TextNode('World');
    const span = SpanEl({}, [text1, text2]);

    expect(span.textContent).toBe('Hello World');
  });

  it('should maintain the on method on predefined creators', () => {
    const button = ButtonEl({ textContent: 'Click me' });
    const handler = vi.fn();

    expect('on' in button).toBe(true);

    const cleanup = (button as HTMLElementExtras).on('click', handler);

    button.click();

    expect(handler).toHaveBeenCalledTimes(1);

    cleanup();
  });
});

describe('TextNode', () => {
  it('should create text node with given text', () => {
    const textNode = TextNode('Hello World');

    expect(textNode.nodeType).toBe(3); // TEXT_NODE
    expect(textNode.textContent).toBe('Hello World');
  });

  it('should work with empty string', () => {
    const textNode = TextNode('');

    expect(textNode.textContent).toBe('');
  });

  it('should work with special characters', () => {
    const textNode = TextNode('Hello & <World>');

    expect(textNode.textContent).toBe('Hello & <World>');
  });
});

describe('integration tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should create complex DOM structures', () => {
    const form = makeEl('form', { id: 'contact-form' }, [
      makeEl('div', { className: 'form-group' }, [
        makeEl('label', { htmlFor: 'name', textContent: 'Name:' }),
        InputEl({ type: 'text', id: 'name', name: 'name' })
      ]),
      makeEl('div', { className: 'form-group' }, [
        makeEl('label', { htmlFor: 'email', textContent: 'Email:' }),
        InputEl({ type: 'email', id: 'email', name: 'email' })
      ]),
      makeEl('div', { className: 'form-group' }, [
        ButtonEl({ type: 'submit', textContent: 'Submit' })
      ])
    ]);

    document.body.appendChild(form);

    expect($('form#contact-form')).toBe(form);
    expect($('input#name')).toBeTruthy();
    expect($('input#email')).toBeTruthy();
    expect($('button[type="submit"]')).toBeTruthy();

    const nameLabel = $('label[for="name"]'); // Use 'for' instead of 'htmlFor' in CSS selector
    expect(nameLabel).toBeTruthy();
    expect(nameLabel?.textContent).toBe('Name:');
  });

  it('should handle event listeners in complex structures', () => {
    let clickCount = 0;

    const container = DivEl({ className: 'container' }, [
      ButtonEl({
        className: 'increment-btn',
        textContent: 'Increment'
      }),
      SpanEl({
        className: 'counter',
        textContent: 'Count: 0'
      })
    ]);

    document.body.appendChild(container);

    const button = $('.increment-btn') as HTMLButtonElement;
    const span = $('.counter') as HTMLSpanElement;

    const cleanup = (button as any).on('click', () => {
      clickCount++;
      span.textContent = `Count: ${clickCount}`;
    });

    expect(span.textContent).toBe('Count: 0');
    expect(clickCount).toBe(0);

    button.click();
    button.click();

    expect(span.textContent).toBe('Count: 2');
    expect(clickCount).toBe(2);

    cleanup();
  });
});