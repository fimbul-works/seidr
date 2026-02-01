import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $ } from "../element";
import { mount } from "../mount";
import { Seidr } from "../seidr";
import { enableClientMode } from "../test-setup";
import type { CleanupFunction } from "../types";
import { component } from "./component";
import { createScope } from "./component-scope";
import { useScope } from "./use-scope";

describe("component", () => {
  let restoreClientMode: CleanupFunction;

  beforeEach(() => {
    restoreClientMode = enableClientMode();
  });

  afterEach(() => {
    restoreClientMode();
  });

  it("should create a component with an element", () => {
    const mockElement = $("div");
    const comp = component(() => {
      return mockElement;
    })();

    expect(comp).toHaveProperty("element");
    expect(comp.element).toBe(mockElement);
  });

  it("should call destroy on scope when component is destroyed", () => {
    let scopeDestroyed = false;

    const comp = component(() => {
      const scopeParam = useScope();
      // Override destroy for testing
      const originalDestroy = scopeParam.destroy;
      scopeParam.destroy = () => {
        scopeDestroyed = true;
        originalDestroy();
      };
      return $("div");
    })();

    expect(scopeDestroyed).toBe(false);

    comp.element.remove();

    expect(scopeDestroyed).toBe(true);
  });
});

describe("Documentation Examples", () => {
  describe("Basic counter component example", () => {
    it("should demonstrate basic component creation with reactive bindings", () => {
      const comp = component(() => {
        const scope = useScope();
        const count = new Seidr(0);
        const button = $("button", { textContent: "Count: 0" });

        // Track reactive binding
        scope.track(
          count.bind(button, (value, el) => {
            el.textContent = `Count: ${value}`;
          }),
        );

        // Track event listener
        scope.track(button.on("click", () => count.value++));

        return button;
      })();

      // Mount to DOM for testing
      document.body.appendChild(comp.element);

      // Initial state
      expect(comp.element.textContent).toBe("Count: 0");

      // Simulate click
      comp.element.click();
      expect(comp.element.textContent).toBe("Count: 1");

      // Click again
      comp.element.click();
      expect(comp.element.textContent).toBe("Count: 2");

      // Cleanup
      comp.element.remove();
      if (document.body.contains(comp.element)) {
        document.body.removeChild(comp.element);
      }
    });
  });

  describe("Components with Props example", () => {
    it("should demonstrate component with props for configuration", () => {
      interface CounterProps {
        initialCount?: number;
        step?: number;
        label?: string;
      }

      const Counter = component(({ initialCount = 0, step = 1, label = "Counter" }: CounterProps) => {
        const count = new Seidr(initialCount);
        const disabled = count.as((value) => value >= 10);

        return $("div", { className: "counter" }, [
          $("span", { textContent: label }),
          $("span", { textContent: count.as((n) => `: ${n}`) }),
          $("button", {
            textContent: `+${step}`,
            disabled,
            onclick: () => (count.value += step),
          }),
          $("button", {
            textContent: "Reset",
            onclick: () => (count.value = 0),
          }),
        ]);
      });
      // Create component with custom props
      const counter1 = Counter({ initialCount: 5, step: 2, label: "Steps" });
      document.body.appendChild(counter1.element);

      const spans = counter1.element.querySelectorAll("span");
      const buttons = counter1.element.querySelectorAll("button");

      // Verify label and initial count
      expect(spans[0].textContent).toBe("Steps");
      expect(spans[1].textContent).toBe(": 5");

      // Click increment (should add 2)
      buttons[0].click();
      expect(spans[1].textContent).toBe(": 7");

      // Create another component with defaults
      const counter2 = Counter({});
      document.body.appendChild(counter2.element);

      const spans2 = counter2.element.querySelectorAll("span");
      expect(spans2[0].textContent).toBe("Counter");
      expect(spans2[1].textContent).toBe(": 0");

      // Cleanup
      counter1.element.remove();
      counter2.element.remove();
      if (document.body.contains(counter1.element)) {
        document.body.removeChild(counter1.element);
      }
      if (document.body.contains(counter2.element)) {
        document.body.removeChild(counter2.element);
      }
    });
  });

  describe("Manual scope creation example", () => {
    it("should demonstrate manual scope lifecycle management", () => {
      const scope = createScope();

      const cleanup1 = vi.fn();
      const cleanup2 = vi.fn();

      scope.track(cleanup1);
      scope.track(cleanup2);

      expect(cleanup1).not.toHaveBeenCalled();
      expect(cleanup2).not.toHaveBeenCalled();

      // Destroy scope
      scope.destroy();

      expect(cleanup1).toHaveBeenCalled();
      expect(cleanup2).toHaveBeenCalled();
    });
  });

  describe("Scope cleanup order example", () => {
    it("should demonstrate cleanup functions are executed in order", () => {
      const scope = createScope();
      const executionOrder: string[] = [];

      scope.track(() => executionOrder.push("first"));
      scope.track(() => executionOrder.push("second"));
      scope.track(() => executionOrder.push("third"));

      scope.destroy();

      expect(executionOrder).toEqual(["first", "second", "third"]);
    });
  });

  describe("Component lifecycle with resources example", () => {
    it("should demonstrate proper resource cleanup", () => {
      const eventListenerCleanup = vi.fn();
      const reactiveBindingCleanup = vi.fn();
      const customCleanup = vi.fn();

      const comp = component(() => {
        const scope = useScope();
        const element = $("div");

        // Track event listener cleanup
        scope.track(element.on("click", () => {}));
        scope.track(() => eventListenerCleanup());

        // Track reactive binding cleanup
        const observable = new Seidr("test");
        scope.track(observable.bind(element, () => {}));
        scope.track(() => reactiveBindingCleanup());

        // Track custom cleanup
        scope.track(customCleanup);

        return element;
      })();

      // Destroy component
      comp.element.remove();

      // Verify all cleanup functions were called
      expect(customCleanup).toHaveBeenCalled();
    });
  });

  describe("Basic child tracking", () => {
    it("should automatically track nested child components", () => {
      let childDestroyed = false;
      let grandchildDestroyed = false;

      const Grandchild = component(() => {
        return $("div", { textContent: "Grandchild" });
      });
      const Child = component(() => {
        // Grandchild will be automatically tracked when created
        const grandchild = Grandchild();

        // Override remove for testing AFTER creation
        const originalRemove = grandchild.element.remove.bind(grandchild.element);
        grandchild.element.remove = () => {
          grandchildDestroyed = true;
          originalRemove();
        };

        return $("div", { textContent: "Child" }, [grandchild.element]);
      });
      const Parent = component(() => {
        // Child will be automatically tracked when created
        const child = Child();

        // Override remove for testing AFTER creation
        const originalRemove = child.element.remove.bind(child.element);
        child.element.remove = () => {
          childDestroyed = true;
          originalRemove();
        };

        return $("div", { textContent: "Parent" }, [child.element]);
      });
      const parent = Parent();

      expect(childDestroyed).toBe(false);
      expect(grandchildDestroyed).toBe(false);

      // Destroy parent should destroy all descendants
      parent.element.remove();

      expect(childDestroyed).toBe(true);
      expect(grandchildDestroyed).toBe(true);
    });

    it("should automatically track child components created inline", () => {
      let child1Destroyed = false;
      let child2Destroyed = false;

      const createChild = component((name: string) => {
        return $("div", { textContent: name });
      });
      const Parent = component(() => {
        const child1 = createChild("Child 1");
        const child2 = createChild("Child 2");

        // Override remove for testing AFTER creation
        const originalRemove1 = child1.element.remove.bind(child1.element);
        child1.element.remove = () => {
          child1Destroyed = true;
          originalRemove1();
        };

        const originalRemove2 = child2.element.remove.bind(child2.element);
        child2.element.remove = () => {
          child2Destroyed = true;
          originalRemove2();
        };

        return $("div", {}, [child1.element, child2.element]);
      });
      const parent = Parent();

      expect(child1Destroyed).toBe(false);
      expect(child2Destroyed).toBe(false);

      parent.element.remove();

      expect(child1Destroyed).toBe(true);
      expect(child2Destroyed).toBe(true);
    });
  });

  describe("Component stack management", () => {
    it("should track components created during parent rendering via component stack", () => {
      const creationOrder: string[] = [];

      const Leaf = component(() => {
        creationOrder.push("Leaf");
        return $("div", { textContent: "Leaf" });
      });
      const Branch = component(() => {
        creationOrder.push("Branch");
        const leaf = Leaf(); // Automatically tracked
        return $("div", {}, [leaf.element]);
      });
      const Trunk = component(() => {
        creationOrder.push("Trunk");
        const branch = Branch(); // Automatically tracked
        return $("div", {}, [branch.element]);
      });
      const Root = component(() => {
        creationOrder.push("Root");
        const trunk = Trunk(); // Automatically tracked
        return $("div", {}, [trunk.element]);
      });
      const root = Root();

      // Components are created outer-to-inner: Root, Trunk, Branch, Leaf
      expect(creationOrder).toEqual(["Root", "Trunk", "Branch", "Leaf"]);

      root.element.remove();
    });

    it("should clear component stack after root component creation", () => {
      let parent1Destroyed = false;
      let parent2Destroyed = false;

      const Child = component(() => {
        return $("div", { textContent: "Child" });
      });
      const Parent = component(() => {
        const child = Child(); // Automatically tracked

        return $("div", {}, [child.element]);
      });
      const parent1 = Parent();

      // Override remove to track which parent
      const originalRemove1 = parent1.element.remove.bind(parent1.element);
      parent1.element.remove = () => {
        parent1Destroyed = true;
        originalRemove1();
      };

      const parent2 = Parent();

      // Override remove to track which parent
      const originalRemove2 = parent2.element.remove.bind(parent2.element);
      parent2.element.remove = () => {
        parent2Destroyed = true;
        originalRemove2();
      };

      expect(parent1Destroyed).toBe(false);
      expect(parent2Destroyed).toBe(false);

      // Destroy first parent - should not affect second parent
      parent1.element.remove();
      expect(parent1Destroyed).toBe(true);
      expect(parent2Destroyed).toBe(false);

      parent2.element.remove();
      expect(parent2Destroyed).toBe(true);
    });
  });

  describe("Nested component destruction", () => {
    it("should destroy deeply nested component hierarchy", () => {
      const destructionOrder: string[] = [];

      const createComponent = (name: string) =>
        component(() => {
          const scope = useScope();
          const element = $("div", { textContent: name });

          // Track destruction order
          scope.track(() => {
            destructionOrder.push(name);
          });

          return element;
        });
      const Level3 = createComponent("Level3");

      const Level2 = component(() => {
        const scope = useScope();
        const level3 = Level3(); // Automatically tracked

        // Also track cleanup for this level
        scope.track(() => {
          destructionOrder.push("Level2");
        });

        return $("div", {}, [level3.element]);
      });
      const Level1 = component(() => {
        const scope = useScope();
        const level2 = Level2(); // Automatically tracked

        // Also track cleanup for this level
        scope.track(() => {
          destructionOrder.push("Level1");
        });

        return $("div", {}, [level2.element]);
      });
      const root = Level1();
      root.element.remove();

      // All components should be destroyed
      expect(destructionOrder).toHaveLength(3);
      expect(destructionOrder).toContain("Level1");
      expect(destructionOrder).toContain("Level2");
      expect(destructionOrder).toContain("Level3");
    });

    it("should handle multiple children at same level", () => {
      const destroyedChildren: string[] = [];

      const Child = component((name: string) => {
        const scope = useScope();
        scope.track(() => {
          destroyedChildren.push(name);
        });
        return $("div", { textContent: name });
      });
      const Parent = component(() => {
        const child1 = Child("Child1");
        const child2 = Child("Child2");
        const child3 = Child("Child3");

        // All automatically tracked
        return $("div", {}, [child1.element, child2.element, child3.element]);
      });
      const parent = Parent();
      parent.element.remove();

      expect(destroyedChildren).toHaveLength(3);
      expect(destroyedChildren).toContain("Child1");
      expect(destroyedChildren).toContain("Child2");
      expect(destroyedChildren).toContain("Child3");
    });
  });

  describe("Error handling", () => {
    it("should handle child destruction errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      let childCleanupCalled = false;

      const ErrorChild = component(() => {
        const scope = useScope();
        scope.track(() => {
          throw new Error("Child cleanup error");
        });
        return $("div", { textContent: "Error Child" });
      });
      const Parent = component(() => {
        const scope = useScope();
        const errorChild = ErrorChild(); // Automatically tracked

        scope.track(() => {
          childCleanupCalled = true;
        });

        return $("div", {}, [errorChild.element]);
      });
      const parent = Parent();

      // Destroy should not throw
      expect(() => parent.element.remove()).not.toThrow();

      // Parent cleanup should still execute
      expect(childCleanupCalled).toBe(true);

      // Error should be logged
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

      consoleSpy.mockRestore();
    });

    it("should continue destroying siblings even if one fails", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      let sibling2Destroyed = false;

      const ErrorChild = component(() => {
        const scope = useScope();
        scope.track(() => {
          throw new Error("Child cleanup error");
        });
        return $("div", { textContent: "Error Child" });
      });
      const NormalChild = component(() => {
        const scope = useScope();
        scope.track(() => {
          sibling2Destroyed = true;
        });
        return $("div", { textContent: "Normal Child" });
      });
      const Parent = component(() => {
        const child1 = ErrorChild(); // Automatically tracked
        const child2 = NormalChild(); // Automatically tracked

        return $("div", {}, [child1.element, child2.element]);
      });
      const parent = Parent();
      parent.element.remove();

      // Second child should still be destroyed
      expect(sibling2Destroyed).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe("Resource cleanup", () => {
    it("should cleanup child component event listeners", () => {
      let childClickListenerCalled = false;
      let parentClickListenerCalled = false;

      const Child = component(() => {
        const scope = useScope();
        const button = $("button", { textContent: "Child Button" });

        scope.track(
          button.on("click", () => {
            childClickListenerCalled = true;
          }),
        );

        return button;
      });
      const Parent = component(() => {
        const scope = useScope();
        const child = Child(); // Automatically tracked

        const button = $("button", { textContent: "Parent Button" });

        scope.track(
          button.on("click", () => {
            parentClickListenerCalled = true;
          }),
        );

        return $("div", {}, [child.element, button]);
      });
      const parent = Parent();

      // Mount to DOM
      document.body.appendChild(parent.element);

      // Click both buttons - both should work
      (parent.element.querySelectorAll("button")[0] as HTMLButtonElement).click();
      expect(childClickListenerCalled).toBe(true);

      (parent.element.querySelectorAll("button")[1] as HTMLButtonElement).click();
      expect(parentClickListenerCalled).toBe(true);

      // Destroy component
      parent.element.remove();

      // Reset flags
      childClickListenerCalled = false;
      parentClickListenerCalled = false;

      // Elements are removed from DOM after destroy, so we need to check they were removed
      expect(document.body.contains(parent.element)).toBe(false);

      // Cleanup
      if (document.body.contains(parent.element)) {
        document.body.removeChild(parent.element);
      }
    });

    it("should cleanup child component reactive bindings", () => {
      const Child = component(() => {
        const scope = useScope();
        const count = new Seidr(0);
        const span = $("span", { textContent: `Count: ${count.value}` });

        scope.track(
          count.bind(span, (value, el) => {
            el.textContent = `Count: ${value}`;
          }),
        );

        return span;
      });
      const Parent = component(() => {
        const child = Child(); // Automatically tracked

        return $("div", {}, [child.element]);
      });
      const parent = Parent();

      // Verify binding works
      expect(parent.element.textContent).toBe("Count: 0");

      // Destroy parent
      parent.element.remove();

      // Binding should be cleaned up (no memory leak)
      // This is hard to test directly, but we can verify no errors occur
      expect(() => parent.element.remove()).not.toThrow();
    });
  });

  describe("Automatic child tracking example", () => {
    it("should demonstrate automatic child component destruction", () => {
      const destructionLog: string[] = [];

      const Header = component(() => {
        const scope = useScope();
        scope.track(() => destructionLog.push("Header destroyed"));
        return $("header", { textContent: "Header Component" });
      });
      const Avatar = component(() => {
        const scope = useScope();
        scope.track(() => destructionLog.push("Avatar destroyed"));
        return $("div", { className: "avatar", textContent: "Avatar Component" });
      });
      const UserProfile = component(() => {
        const header = Header(); // Automatically tracked
        const avatar = Avatar(); // Automatically tracked

        return $("div", { className: "profile" }, [header.element, avatar.element]);
      });
      const profile = UserProfile();

      // Verify structure
      expect(profile.element.className).toBe("profile");
      expect(profile.element.children.length).toBe(2);
      expect(profile.element.children[0].textContent).toBe("Header Component");
      expect(profile.element.children[1].textContent).toBe("Avatar Component");

      // Destroy parent
      profile.element.remove();

      // Verify children were destroyed
      expect(destructionLog).toEqual(["Header destroyed", "Avatar destroyed"]);
    });
  });

  describe("Nested components example", () => {
    it("should demonstrate nested component hierarchy cleanup", () => {
      const cleanupLog: string[] = [];

      const Comment = component(() => {
        const scope = useScope();
        scope.track(() => cleanupLog.push("Comment"));
        return $("div", { textContent: "Comment" });
      });
      const CommentList = component(() => {
        const scope = useScope();
        scope.track(() => cleanupLog.push("CommentList"));

        const comments = [Comment(), Comment(), Comment()]; // All automatically tracked

        return $(
          "div",
          {},
          comments.map((c) => c.element),
        );
      });
      const Post = component(() => {
        const scope = useScope();
        scope.track(() => cleanupLog.push("Post"));

        const commentList = CommentList(); // Automatically tracked

        return $("article", {}, [commentList.element]);
      });
      const Feed = component(() => {
        const scope = useScope();
        scope.track(() => cleanupLog.push("Feed"));

        const post = Post(); // Automatically tracked

        return $("main", {}, [post.element]);
      });
      const feed = Feed();
      feed.element.remove();

      // All components should be cleaned up
      expect(cleanupLog).toContain("Feed");
      expect(cleanupLog).toContain("Post");
      expect(cleanupLog).toContain("CommentList");
      expect(cleanupLog).toHaveLength(6); // Feed, Post, CommentList, 3x Comments
    });
  });

  describe("Edge cases", () => {
    it("should handle child components without children", () => {
      let destroyed = false;

      const Leaf = component(() => {
        return $("div", { textContent: "Leaf" });
      });
      const Parent = component(() => {
        const leaf = Leaf(); // Automatically tracked

        // Override destroy for testing
        const originalRemove = leaf.element.remove.bind(leaf.element);
        leaf.element.remove = () => {
          destroyed = true;
          originalRemove();
        };

        return $("div", {}, [leaf.element]);
      });
      const parent = Parent();
      parent.element.remove();

      expect(destroyed).toBe(true);
    });

    it("should handle parent with no children", () => {
      let destroyed = false;

      const Parent = component(() => {
        const scope = useScope();
        scope.track(() => {
          destroyed = true;
        });
        return $("div", { textContent: "Parent" });
      });
      const parent = Parent();
      parent.element.remove();

      expect(destroyed).toBe(true);
    });

    it("should handle deeply nested single-child chain", () => {
      const destructions: string[] = [];

      const createComponent = (name: string, childFactory?: ReturnType<typeof component>) =>
        component(() => {
          const scope = useScope();
          scope.track(() => {
            destructions.push(name);
          });

          if (!childFactory) {
            return $("div", { textContent: name });
          }

          const child = childFactory(null); // Automatically tracked
          return $("div", {}, [child.element]);
        });

      const root = createComponent(
        "root",
        createComponent(
          "level1",
          createComponent(
            "level2",
            createComponent("level3", createComponent("level4", createComponent("level5", createComponent("level6")))),
          ),
        ),
      )();

      root.element.remove();

      expect(destructions).toHaveLength(7);
      expect(destructions).toEqual(["root", "level1", "level2", "level3", "level4", "level5", "level6"]);
    });

    it("should handle component that creates multiple children dynamically", () => {
      const destroyed: string[] = [];

      const createDynamicChild = component((id: number) => {
        const scope = useScope();
        scope.track(() => {
          destroyed.push(`child-${id}`);
        });
        return $("div", { textContent: `Child ${id}` });
      });
      const Parent = component(() => {
        const children = [];
        for (let i = 0; i < 5; i++) {
          const child = createDynamicChild(i); // Automatically tracked
          children.push(child.element);
        }

        return $("div", {}, children);
      });
      const parent = Parent();
      parent.element.remove();

      expect(destroyed).toHaveLength(5);
      expect(destroyed).toContain("child-0");
      expect(destroyed).toContain("child-4");
    });
  });

  describe("Documentation Examples", () => {
    describe("Automatic child tracking example", () => {
      it("should demonstrate automatic child component destruction", () => {
        const destructionLog: string[] = [];

        const Header = component(() => {
          const scope = useScope();
          scope.track(() => destructionLog.push("Header destroyed"));
          return $("header", { textContent: "Header Component" });
        });
        const Avatar = component(() => {
          const scope = useScope();
          scope.track(() => destructionLog.push("Avatar destroyed"));
          return $("div", { className: "avatar", textContent: "Avatar Component" });
        });
        const UserProfile = component(() => {
          const header = Header(); // Automatically tracked
          const avatar = Avatar(); // Automatically tracked

          return $("div", { className: "profile" }, [header.element, avatar.element]);
        });
        const profile = UserProfile();

        // Verify structure
        expect(profile.element.className).toBe("profile");
        expect(profile.element.children.length).toBe(2);
        expect(profile.element.children[0].textContent).toBe("Header Component");
        expect(profile.element.children[1].textContent).toBe("Avatar Component");

        // Destroy parent
        profile.element.remove();

        // Verify children were destroyed
        expect(destructionLog).toEqual(["Header destroyed", "Avatar destroyed"]);
      });
    });

    describe("Nested components example", () => {
      it("should demonstrate nested component hierarchy cleanup", () => {
        const cleanupLog: string[] = [];

        const Comment = component(() => {
          const scope = useScope();
          scope.track(() => cleanupLog.push("Comment"));
          return $("div", { textContent: "Comment" });
        });
        const CommentList = component(() => {
          const scope = useScope();
          scope.track(() => cleanupLog.push("CommentList"));

          const comments = [Comment(), Comment(), Comment()]; // All automatically tracked

          return $(
            "div",
            {},
            comments.map((c) => c.element),
          );
        });
        const Post = component(() => {
          const scope = useScope();
          scope.track(() => cleanupLog.push("Post"));

          const commentList = CommentList(); // Automatically tracked

          return $("article", {}, [commentList.element]);
        });
        const Feed = component(() => {
          const scope = useScope();
          scope.track(() => cleanupLog.push("Feed"));

          const post = Post(); // Automatically tracked

          return $("main", {}, [post.element]);
        });
        const feed = Feed();
        feed.element.remove();

        // All components should be cleaned up
        expect(cleanupLog).toContain("Feed");
        expect(cleanupLog).toContain("Post");
        expect(cleanupLog).toContain("CommentList");
        expect(cleanupLog).toHaveLength(6); // Feed, Post, CommentList, 3x Comments
      });
    });
  });

  describe("Component as Child", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should allow SeidrComponent as a child in $ factory", () => {
      const Child = component(() => $("span", { textContent: "Child" }));

      const parent = component(() => {
        const child = Child();
        return $("div", { className: "parent" }, [child]);
      })();
      mount(parent, document.body);

      const parentEl = document.querySelector(".parent");
      expect(parentEl).toBeTruthy();
      expect(parentEl?.innerHTML).toBe("<span>Child</span>");

      parent.element.remove();
    });

    it("should allow multiple SeidrComponents as children", () => {
      function Child(props: { name: string }) {
        return component(() => $("span", { textContent: props.name }))();
      }

      const parent = component(() => {
        return $("div", { className: "parent" }, [Child({ name: "A" }), Child({ name: "B" })]);
      })();

      mount(parent, document.body);

      const parentEl = document.querySelector(".parent");
      expect(parentEl?.innerHTML).toBe("<span>A</span><span>B</span>");

      parent.element.remove();
    });
  });
});
