import { describe, expect, it, vi } from "vitest";
import { Seidr } from "./seidr";

describe("Seidr", () => {
  describe("Basic Functionality", () => {
    it("should initialize with a value", () => {
      const s = new Seidr(10);
      expect(s.value).toBe(10);
      s.destroy();
      expect(s.observerCount).toBe(0);
    });

    it("should allow custom ID", () => {
      const s = new Seidr(0, "custom-id");
      expect(s.id).toBe("custom-id");
      s.destroy();
      expect(s.observerCount).toBe(0);
    });

    it("should generate unique auto-incrementing IDs", () => {
      const s1 = new Seidr(0);
      const s2 = new Seidr(0);
      expect(s1.id).not.toBe(s2.id);
      expect(typeof s1.id).toBe("number");
      s1.destroy();
      s2.destroy();
    });

    it("should update value", () => {
      const s = new Seidr(10);
      s.value = 20;
      expect(s.value).toBe(20);
      s.destroy();
      expect(s.observerCount).toBe(0);
    });

    it("should not notify if value is same (Object.is)", () => {
      const s = new Seidr(10);
      const cb = vi.fn();
      s.observe(cb);
      s.value = 10;
      expect(cb).not.toHaveBeenCalled();
      s.destroy();
      expect(s.observerCount).toBe(0);
    });

    it("should handle Object.is edge cases", () => {
      const s = new Seidr(0);
      const cb = vi.fn();
      s.observe(cb);

      // -0 and +0 are different in Object.is
      s.value = -0;
      expect(cb).toHaveBeenCalledTimes(1);

      // NaN is equal to itself in Object.is
      const nanS = new Seidr(Number.NaN);
      const nanCb = vi.fn();
      nanS.observe(nanCb);
      nanS.value = Number.NaN;
      expect(nanCb).not.toHaveBeenCalled();

      s.destroy();
      nanS.destroy();
    });

    it("should notify observers on change", () => {
      const s = new Seidr(10);
      const cb = vi.fn();
      s.observe(cb);
      s.value = 20;
      expect(cb).toHaveBeenCalledWith(20);
      s.destroy();
      expect(s.observerCount).toBe(0);
    });

    it("should return cleanup function from observe", () => {
      const s = new Seidr(10);
      const cb = vi.fn();
      const unsub = s.observe(cb);
      expect(s.observerCount).toBe(1);

      s.value = 20;
      expect(cb).toHaveBeenCalledTimes(1);

      unsub();
      expect(s.observerCount).toBe(0);

      s.value = 30;
      expect(cb).toHaveBeenCalledTimes(1);

      s.destroy();
      expect(s.observerCount).toBe(0);
    });
  });

  describe("bind", () => {
    it("should call binder immediately and on change", () => {
      const s = new Seidr("a");
      const target = { text: "" };
      const binder = vi.fn((v, t) => (t.text = v));

      const unsub = s.bind(target, binder);
      expect(s.observerCount).toBe(1);
      expect(target.text).toBe("a");
      expect(binder).toHaveBeenCalledWith("a", target);

      s.value = "b";
      expect(target.text).toBe("b");
      expect(binder).toHaveBeenCalledWith("b", target);

      unsub();
      expect(s.observerCount).toBe(0);

      s.value = "c";
      expect(target.text).toBe("b");

      s.destroy();
      expect(s.observerCount).toBe(0);
    });
  });

  describe("as (derived)", () => {
    it("should create a derived Seidr", () => {
      const root = new Seidr(1);
      const derived = root.as((v) => v * 2);

      expect(derived.value).toBe(2);
      expect(root.observerCount).toBe(1);

      root.value = 2;
      expect(derived.value).toBe(4);

      derived.destroy();
      expect(derived.observerCount).toBe(0);

      // Important: parent should have no observers after child is destroyed
      expect(root.observerCount).toBe(0);

      root.destroy();
      expect(root.observerCount).toBe(0);
    });

    it("should support multiple derivations", () => {
      const a = new Seidr(1);
      const b = a.as((v) => v + 1);
      const c = a.as((v) => v + 2);

      expect(a.observerCount).toBe(2);
      expect(b.value).toBe(2);
      expect(c.value).toBe(3);

      b.destroy();
      expect(a.observerCount).toBe(1);

      c.destroy();
      expect(a.observerCount).toBe(0);

      a.destroy();
    });
  });

  describe("computed", () => {
    it("should create a computed Seidr from multiple parents", () => {
      const a = new Seidr(1);
      const b = new Seidr(2);
      const c = Seidr.computed(() => a.value + b.value, [a, b]);

      expect(c.value).toBe(3);
      expect(a.observerCount).toBe(1);
      expect(b.observerCount).toBe(1);

      a.value = 10;
      expect(c.value).toBe(12);

      b.value = 20;
      expect(c.value).toBe(30);

      c.destroy();
      expect(c.observerCount).toBe(0);

      // Computed should unsubscribe from parents on destroy
      expect(a.observerCount).toBe(0);
      expect(b.observerCount).toBe(0);

      a.destroy();
      b.destroy();
    });

    it("should throw if parents are not Seidr instances", () => {
      expect(() => Seidr.computed(() => 1, [{} as any])).toThrow(
        "Seidr.computed must have an array of Seidr instances as parents",
      );
      expect(() => Seidr.computed(() => 1, "not-an-array" as any)).toThrow(
        "Seidr.computed must have an array of Seidr instances as parents",
      );
    });
  });

  describe("destroy and cleanup", () => {
    it("should call registered cleanup functions", () => {
      const s = new (class extends Seidr {
        constructor() {
          super(0);
        }
        public addC(fn: () => void) {
          this.addCleanup(fn);
        }
      })();

      const cleanup = vi.fn();
      s.addC(cleanup);

      s.destroy();
      expect(cleanup).toHaveBeenCalled();
      expect(s.observerCount).toBe(0);
    });

    it("should handle error in cleanup functions", () => {
      const s = new (class extends Seidr {
        constructor() {
          super(0);
        }
        public addC(fn: () => void) {
          this.addCleanup(fn);
        }
      })();

      const error = new Error("cleanup fail");
      s.addC(() => {
        throw error;
      });

      const onError = vi.fn();
      s.destroy(onError);

      expect(onError).toHaveBeenCalledWith(error);
      expect(s.observerCount).toBe(0);
    });

    it("should default to console.error if no onError provided", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const s = new (class extends Seidr {
        constructor() {
          super(0);
        }
        public addC(fn: () => void) {
          this.addCleanup(fn);
        }
      })();

      const error = new Error("cleanup fail");
      s.addC(() => {
        throw error;
      });

      s.destroy();

      expect(spy).toHaveBeenCalledWith(error);
      spy.mockRestore();
    });
  });

  describe("isDerived and parents", () => {
    it("should report correctly for root Seidr", () => {
      const s = new Seidr(0);
      expect(s.isDerived).toBe(false);
      expect(s.parents).toEqual([]);
      s.destroy();
    });

    it("should report correctly for .as()", () => {
      const a = new Seidr(0);
      const b = a.as((v) => v);
      expect(b.isDerived).toBe(true);
      expect(b.parents).toEqual([a]);
      // Verify parents returns a copy
      expect(b.parents).not.toBe((b as any).p);
      b.destroy();
      a.destroy();
    });

    it("should report correctly for Seidr.computed()", () => {
      const a = new Seidr(0);
      const b = new Seidr(1);
      const c = Seidr.computed(() => a.value + b.value, [a, b]);
      expect(c.isDerived).toBe(true);
      expect(c.parents).toEqual([a, b]);
      c.destroy();
      a.destroy();
      b.destroy();
    });
  });
});
