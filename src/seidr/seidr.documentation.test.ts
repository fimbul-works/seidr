import { describe, expect, it, vi } from "vitest";
import { describeDualMode } from "../test-setup";
import { Seidr } from "./seidr";

describeDualMode("Seidr - Documentation Examples", () => {
  describe("Basic reactive value example", () => {
    it("should demonstrate basic Seidr usage with observe and cleanup", () => {
      const count = new Seidr(0);
      const logSpy = vi.fn();

      // Subscribe to changes (doesn't call immediately)
      const unsubscribe = count.observe((value) => {
        logSpy(value);
      });

      expect(logSpy).not.toHaveBeenCalled();

      count.value = 5;
      expect(logSpy).toHaveBeenCalledWith(5);

      count.value = 5;
      expect(logSpy).toHaveBeenCalledTimes(1); // No notification for same value

      unsubscribe(); // Cleanup
      count.value = 10;
      expect(logSpy).toHaveBeenCalledTimes(1); // No more notifications
    });
  });

  describe("Simple numeric transformation example", () => {
    it("should create derived observables with numeric transformations", () => {
      const count = new Seidr(5);
      const doubled = count.as((n) => n * 2);
      const isEven = count.as((n) => n % 2 === 0);

      expect(doubled.value).toBe(10);
      expect(isEven.value).toBe(false);

      count.value = 6;
      expect(doubled.value).toBe(12);
      expect(isEven.value).toBe(true);
    });
  });

  describe("String formatting and concatenation example", () => {
    it("should demonstrate string-based transformations", () => {
      const firstName = new Seidr("John");
      const lastName = new Seidr("Doe");

      const fullName = firstName.as((name) => `${name} ${lastName.value}`);
      const displayName = firstName.as((name) => name.toUpperCase());

      expect(fullName.value).toBe("John Doe");
      expect(displayName.value).toBe("JOHN");

      firstName.value = "Jane";
      expect(fullName.value).toBe("Jane Doe");
      expect(displayName.value).toBe("JANE");
    });
  });

  describe("Complex object transformations example", () => {
    it("should handle object property extraction and formatting", () => {
      const user = new Seidr({ id: 1, name: "John", age: 30 });

      const userName = user.as((u) => u.name);
      const userDescription = user.as((u) => `${u.name} (${u.age} years old)`);
      const isAdult = user.as((u) => u.age >= 18);

      expect(userName.value).toBe("John");
      expect(userDescription.value).toBe("John (30 years old)");
      expect(isAdult.value).toBe(true);
    });
  });

  describe("Array filtering and mapping example", () => {
    it("should demonstrate array transformation patterns", () => {
      const numbers = new Seidr([1, 2, 3, 4, 5]);

      const evenNumbers = numbers.as((nums) => nums.filter((n) => n % 2 === 0));
      const squaredNumbers = numbers.as((nums) => nums.map((n) => n * n));
      const count = numbers.as((nums) => nums.length);

      expect(evenNumbers.value).toEqual([2, 4]);
      expect(squaredNumbers.value).toEqual([1, 4, 9, 16, 25]);
      expect(count.value).toBe(5);
    });
  });

  describe("Conditional transformations example", () => {
    it("should handle conditional logic in transformations", () => {
      const temperature = new Seidr(25);

      const temperatureStatus = temperature.as((temp) => {
        if (temp < 0) return "Freezing";
        if (temp < 10) return "Cold";
        if (temp < 20) return "Cool";
        if (temp < 30) return "Warm";
        return "Hot";
      });

      const temperatureColor = temperature.as((temp) => {
        if (temp < 10) return "blue";
        if (temp < 20) return "green";
        if (temp < 30) return "orange";
        return "red";
      });

      expect(temperatureStatus.value).toBe("Warm");
      expect(temperatureColor.value).toBe("orange");

      temperature.value = 5;
      expect(temperatureStatus.value).toBe("Cold");
      expect(temperatureColor.value).toBe("blue");
    });
  });

  describe("Computed value - Full name example", () => {
    it("should create computed values that depend on multiple sources", () => {
      const firstName = new Seidr("John");
      const lastName = new Seidr("Doe");

      const fullName = Seidr.computed(() => `${firstName.value} ${lastName.value}`, [firstName, lastName]);

      expect(fullName.value).toBe("John Doe");

      firstName.value = "Jane";
      expect(fullName.value).toBe("Jane Doe");

      lastName.value = "Smith";
      expect(fullName.value).toBe("Jane Smith");
    });
  });

  describe("Computed value - Complex calculations example", () => {
    it("should demonstrate computed values with mathematical operations", () => {
      const width = new Seidr(100);
      const height = new Seidr(200);

      const area = Seidr.computed(() => width.value * height.value, [width, height]);

      const perimeter = Seidr.computed(() => 2 * (width.value + height.value), [width, height]);

      expect(area.value).toBe(20000);
      expect(perimeter.value).toBe(600);

      width.value = 150;
      expect(area.value).toBe(30000);
      expect(perimeter.value).toBe(700);
    });
  });

  describe("Manual cleanup example", () => {
    it("should demonstrate proper cleanup patterns", () => {
      const counter = new Seidr(0);
      const observerSpy = vi.fn();

      const unsubscribe = counter.observe(observerSpy);
      expect(observerSpy).not.toHaveBeenCalled();

      counter.value = 5;
      expect(observerSpy).toHaveBeenCalledWith(5);

      // Remove specific observer
      unsubscribe();
      counter.value = 10;
      expect(observerSpy).toHaveBeenCalledTimes(1); // No more notifications

      // Clean up everything
      counter.destroy();
      counter.value = 15;
      expect(observerSpy).toHaveBeenCalledTimes(1); // Still no more notifications
    });
  });
});
