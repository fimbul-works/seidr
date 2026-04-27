import { $, Seidr, unwrapSeidr, withStorage, wrapSeidr } from "@fimbul-works/seidr";
import { describe, expect, test, vi } from "vitest";

describe("docs/Seidr.md Examples", () => {
  test("Seidr class instantiations", () => {
    const count = new Seidr<number>(0);
    const name = new Seidr<string>("Alice");
    const isActive = new Seidr<boolean>(false);

    expect(count.value).toBe(0);
    expect(name.value).toBe("Alice");
    expect(isActive.value).toBe(false);

    // Using options
    const transient = new Seidr(0, { hydrate: false });
    const fastUpdate = new Seidr(0, { sync: true });

    expect(transient.value).toBe(0);
    expect(fastUpdate.value).toBe(0);
  });

  test("Properties: id, value, isDerived, parents", () => {
    const count = new Seidr(0, { id: "count" });
    expect(count.id).toBe("count");

    count.value = 5;
    expect(count.value).toBe(5);

    const doubled = count.as((n) => n * 2);
    expect(doubled.isDerived).toBe(true);
    expect(doubled.parents).toContain(count);
  });

  test("as() transformation", () => {
    const count = new Seidr(0);
    const doubled = count.as((n) => n * 2);
    const message = count.as((n) => `Count: ${n}`);

    count.value = 5;
    expect(doubled.value).toBe(10);
    expect(message.value).toBe("Count: 5");
  });

  test("observe()", () => {
    const count = new Seidr(0);
    const handler = vi.fn();
    const cleanup = count.observe(handler);

    count.value = 5;
    expect(handler).toHaveBeenCalledWith(5);
    // Observe is batched by default unless sync: true
    // But in tests typically we want to check it.
    // Seidr uses microtasks for batching.
  });

  test("observe() with sync: true", () => {
    const count = new Seidr(0, { sync: true });
    const handler = vi.fn();
    const cleanup = count.observe(handler);

    count.value = 5;
    expect(handler).toHaveBeenCalledWith(5);
    cleanup();
  });

  test("bind()", () => {
    const count = new Seidr(0, { sync: true });
    const display = document.createElement("span");

    const cleanup = count.bind(display, (value, el) => {
      el.textContent = value > 5 ? "Many clicks!" : `Count: ${value}`;
      el.style.color = (value > 5 ? "red" : "black") as string;
    });

    expect(display.textContent).toBe("Count: 0");
    expect(display.style.color).toBe("black");

    count.value = 3;
    expect(display.textContent).toBe("Count: 3");

    count.value = 7;
    expect(display.textContent).toBe("Many clicks!");
    expect(display.style.color).toBe("red");

    cleanup();
  });

  test("Automatic binding with $", () => {
    const textContent = new Seidr("", { sync: true });
    const div = $("div", { textContent }) as HTMLDivElement;

    textContent.value = "Hello!";
    expect(div.textContent).toBe("Hello!");
  });

  test("Seidr.merge", () => {
    const firstName = new Seidr("John", { sync: true });
    const lastName = new Seidr("Doe", { sync: true });

    const fullName = Seidr.merge(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

    expect(fullName.value).toBe("John Doe");

    firstName.value = "Jane";
    expect(fullName.value).toBe("Jane Doe");

    lastName.value = "Smith";
    expect(fullName.value).toBe("Jane Smith");
  });

  test("withStorage()", () => {
    const mockStorage: Storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    const count = withStorage("count", new Seidr(0), mockStorage);
    expect(count.value).toBe(0);
  });

  test("wrapSeidr() and unwrapSeidr()", () => {
    const s1 = wrapSeidr(10);
    expect(s1 instanceof Seidr).toBe(true);
    expect(s1.value).toBe(10);

    const s2 = wrapSeidr(s1);
    expect(s2).toBe(s1);

    expect(unwrapSeidr(s1)).toBe(10);
    expect(unwrapSeidr("Alice")).toBe("Alice");
  });
});
