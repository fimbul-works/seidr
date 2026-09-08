import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { assignProp } from "../../element/assign-prop";
import { createValue } from "../../observable/value";
import { onAttached } from "./on-attached";
import { onMounted } from "./on-mounted";
import { onUnmounted } from "./on-unmounted";
import { watchMutations } from "./watch-mutations";
import { onAttachedFns } from "./on-attached";
import { onMountedFns } from "./on-mounted";
import { onUnmountedFns } from "./on-unmounted";

// Helper to wait for MutationObserver records and microtasks to flush
const flushMutationQueue = async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));
};

describe("watchMutations (MutationObserver lifecycle)", () => {
  let root: HTMLDivElement;
  let stopWatching: () => void;
  let prevEnv: string | undefined;

  beforeAll(() => {
    prevEnv = process.env.SEIDR_USE_MUTATION_OBSERVER;
    process.env.SEIDR_USE_MUTATION_OBSERVER = "true";
  });

  afterAll(() => {
    if (prevEnv === undefined) {
      delete process.env.SEIDR_USE_MUTATION_OBSERVER;
    } else {
      process.env.SEIDR_USE_MUTATION_OBSERVER = prevEnv;
    }
  });

  beforeEach(() => {
    root = document.createElement("div");
    root.id = "app-root";
    document.body.appendChild(root);
    stopWatching = watchMutations(root);
  });

  afterEach(() => {
    stopWatching?.();
    root.remove();
    onMountedFns?.clear();
    onAttachedFns?.clear();
    onUnmountedFns?.clear();
  });

  describe("Mount detection (onMounted)", () => {
    it("should trigger onMounted when a single child element is appended to root", async () => {
      const child = document.createElement("button");
      const onMountCb = vi.fn();

      onMounted(onMountCb, child);
      expect(onMountCb).not.toHaveBeenCalled();

      root.appendChild(child);
      await flushMutationQueue();

      expect(onMountCb).toHaveBeenCalledTimes(1);
      expect(onMountCb).toHaveBeenCalledWith(root);
      expect(onMountedFns?.has(child)).toBe(false);
    });

    it("should trigger onMounted for all registered descendants when a subtree is appended", async () => {
      const card = document.createElement("div");
      const header = document.createElement("h2");
      const actionBtn = document.createElement("button");

      card.appendChild(header);
      card.appendChild(actionBtn);

      const cardMount = vi.fn();
      const headerMount = vi.fn();
      const btnMount = vi.fn();

      onMounted(cardMount, card);
      onMounted(headerMount, header);
      onMounted(btnMount, actionBtn);

      // Append only top-level card to root
      root.appendChild(card);
      await flushMutationQueue();

      expect(cardMount).toHaveBeenCalledTimes(1);
      expect(cardMount).toHaveBeenCalledWith(root);

      expect(headerMount).toHaveBeenCalledTimes(1);
      expect(headerMount).toHaveBeenCalledWith(card);

      expect(btnMount).toHaveBeenCalledTimes(1);
      expect(btnMount).toHaveBeenCalledWith(card);
    });
  });

  describe("Attachment detection (onAttached)", () => {
    it("should trigger onAttached when an element is attached into connected root", async () => {
      const canvas = document.createElement("canvas");
      const onAttachCb = vi.fn();

      onAttached(onAttachCb, canvas);
      expect(onAttachCb).not.toHaveBeenCalled();

      root.appendChild(canvas);
      await flushMutationQueue();

      expect(onAttachCb).toHaveBeenCalledTimes(1);
      expect(onAttachedFns?.has(canvas)).toBe(false);
    });

    it("should not trigger onAttached when added to detached container, until container connects", async () => {
      const detachedContainer = document.createElement("div");
      const child = document.createElement("div");
      const onAttachCb = vi.fn();

      onAttached(onAttachCb, child);

      detachedContainer.appendChild(child);
      await flushMutationQueue();

      // Still detached from Document
      expect(child.isConnected).toBe(false);
      expect(onAttachCb).not.toHaveBeenCalled();

      // Now attach container to root (which is connected to document.body)
      root.appendChild(detachedContainer);
      await flushMutationQueue();

      expect(child.isConnected).toBe(true);
      expect(onAttachCb).toHaveBeenCalledTimes(1);
    });
  });

  describe("Unmount detection (onUnmounted)", () => {
    it("should trigger onUnmounted when an element is removed from the DOM", async () => {
      const child = document.createElement("div");
      const unmountCb = vi.fn();

      onUnmounted(unmountCb, child);
      root.appendChild(child);
      await flushMutationQueue();

      expect(unmountCb).not.toHaveBeenCalled();

      child.remove();
      await flushMutationQueue();

      expect(unmountCb).toHaveBeenCalledTimes(1);
      expect(onUnmountedFns?.has(child)).toBe(false);
    });

    it("should trigger onUnmounted for all registered descendants when parent subtree is removed", async () => {
      const card = document.createElement("div");
      const header = document.createElement("h2");
      const btn = document.createElement("button");

      card.appendChild(header);
      card.appendChild(btn);

      const cardUnmount = vi.fn();
      const headerUnmount = vi.fn();
      const btnUnmount = vi.fn();

      onUnmounted(cardUnmount, card);
      onUnmounted(headerUnmount, header);
      onUnmounted(btnUnmount, btn);

      root.appendChild(card);
      await flushMutationQueue();

      expect(cardUnmount).not.toHaveBeenCalled();
      expect(headerUnmount).not.toHaveBeenCalled();
      expect(btnUnmount).not.toHaveBeenCalled();

      // Remove the top-level card
      card.remove();
      await flushMutationQueue();

      expect(cardUnmount).toHaveBeenCalledTimes(1);
      expect(headerUnmount).toHaveBeenCalledTimes(1);
      expect(btnUnmount).toHaveBeenCalledTimes(1);
    });
  });

  describe("Moving and reparenting nodes without unmounting", () => {
    it("should not trigger onUnmounted when a node is moved within the observed DOM tree", async () => {
      const containerA = document.createElement("div");
      const containerB = document.createElement("div");
      const movableItem = document.createElement("span");

      root.appendChild(containerA);
      root.appendChild(containerB);
      containerA.appendChild(movableItem);
      await flushMutationQueue();

      const unmountCb = vi.fn();
      onUnmounted(unmountCb, movableItem);

      // Move item from containerA to containerB synchronously
      containerB.appendChild(movableItem);
      await flushMutationQueue();

      // Node remained connected throughout, so onUnmounted must NOT have fired
      expect(movableItem.isConnected).toBe(true);
      expect(unmountCb).not.toHaveBeenCalled();
      expect(onUnmountedFns?.has(movableItem)).toBe(true);

      // Now actually removing the item should trigger unmount
      movableItem.remove();
      await flushMutationQueue();

      expect(unmountCb).toHaveBeenCalledTimes(1);
    });
  });

  describe("Reactive binding integration with assignProp", () => {
    it("should automatically clean up reactive property observers when element is removed from DOM", async () => {
      const button = document.createElement("button");
      const titleValue = createValue("Click Me");
      const disabledValue = createValue(false);

      assignProp(button, "title", titleValue);
      assignProp(button, "disabled", disabledValue);

      root.appendChild(button);
      await flushMutationQueue();

      expect(button.title).toBe("Click Me");
      expect(titleValue.observerCount).toBe(1);
      expect(disabledValue.observerCount).toBe(1);

      // Reactive update works while element is in DOM
      titleValue("Submit Form");
      expect(button.title).toBe("Submit Form");

      // Remove button from DOM
      button.remove();
      await flushMutationQueue();

      // MutationObserver should have triggered unmount cleanup
      expect(titleValue.observerCount).toBe(0);
      expect(disabledValue.observerCount).toBe(0);

      // Subsequent value updates do not alter the removed button
      titleValue("New Detached Title");
      expect(button.title).toBe("Submit Form");
    });
  });

  describe("Disconnecting observer", () => {
    it("should stop observing mutations when cleanup function is called", async () => {
      stopWatching();

      const child = document.createElement("div");
      const mountCb = vi.fn();
      onMounted(mountCb, child);

      root.appendChild(child);
      await flushMutationQueue();

      expect(mountCb).not.toHaveBeenCalled();
    });
  });

  describe("Multiple entry points and reference counting", () => {
    it("should keep observer alive when same node is watched multiple times until all cleanup functions are called", async () => {
      // root is already watched in beforeEach (count: 1)
      const secondCleanup = watchMutations(root); // count: 2

      // First cleanup called
      secondCleanup();

      // Observer should still be active because stopWatching is still active
      const child = document.createElement("div");
      const mountCb = vi.fn();
      onMounted(mountCb, child);

      root.appendChild(child);
      await flushMutationQueue();

      expect(mountCb).toHaveBeenCalledTimes(1);

      // Now call main cleanup
      stopWatching();

      const child2 = document.createElement("div");
      const mountCb2 = vi.fn();
      onMounted(mountCb2, child2);

      root.appendChild(child2);
      await flushMutationQueue();

      expect(mountCb2).not.toHaveBeenCalled();
    });

    it("should keep observer active across multiple watched containers until all cleanups run", async () => {
      const containerA = document.createElement("div");
      const containerB = document.createElement("div");
      document.body.appendChild(containerA);
      document.body.appendChild(containerB);

      const cleanupA = watchMutations(containerA);
      const cleanupB = watchMutations(containerB);

      // Clean up containerA watcher
      cleanupA();

      // Observer must still be active because cleanupB (and stopWatching) are active
      const child = document.createElement("button");
      const mountCb = vi.fn();
      onMounted(mountCb, child);

      containerB.appendChild(child);
      await flushMutationQueue();

      expect(mountCb).toHaveBeenCalledTimes(1);

      cleanupB();
      containerA.remove();
      containerB.remove();
    });
  });
});
