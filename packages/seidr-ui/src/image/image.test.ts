import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { createImage, Image } from "./index.js";
import { mount } from "@fimbul-works/seidr";

const FALLBACK_TEXT = "AB";
const IMAGE_ALT_TEXT = "Fake Image";
const DELAY = 50;

describeDualMode("Image", ({ getDocument, isSSR }) => {
  it("should render unified Image component with default span tag and status data attribute", () => {
    const component = Image({
      fallback: FALLBACK_TEXT,
    });
    const root = component.nodes.at(0) as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("span");
    expect(root.getAttribute("data-component")).toBe("image");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.getAttribute("data-status")).toBe("idle");
    expect(root.textContent).toContain(FALLBACK_TEXT);
  });

  it("should support custom tag for unified Image", () => {
    const component = Image({
      as: "div",
      fallback: FALLBACK_TEXT,
    });
    const root = component.nodes.at(0) as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("div");
  });

  it("should render fallback initially and not the image", () => {
    const component = Image({
      src: "/test.jpg",
      alt: IMAGE_ALT_TEXT,
      fallback: FALLBACK_TEXT,
    });

    const root = component.nodes.at(0) as HTMLElement;
    expect(root.textContent).toContain(FALLBACK_TEXT);
    expect(root.querySelector("img")).toBeNull();
  });

  it("should work with createImage instance factory", () => {
    const imgInstance = createImage({ src: "/test.jpg" });
    const root = imgInstance.Root({}, [imgInstance.Fallback({}, FALLBACK_TEXT), imgInstance.Img({ alt: IMAGE_ALT_TEXT })]);

    expect(root.getAttribute("data-component")).toBe("image");
    expect(root.getAttribute("data-part")).toBe("root");
    expect(root.textContent).toContain(FALLBACK_TEXT);
    expect(root.querySelector("img")).toBeNull();
  });

  if (!isSSR) {
    describe("Browser image loading lifecycle", () => {
      let originalGlobalImage: typeof window.Image;

      beforeAll(() => {
        originalGlobalImage = window.Image;
      });

      afterAll(() => {
        window.Image = originalGlobalImage;
      });

      it("should render the image and remove fallback after successful load", async () => {
        (window.Image as any) = class MockImage {
          onload: () => void = () => {};
          onerror: () => void = () => {};
          src = "";

          constructor() {
            setTimeout(() => {
              this.onload();
            }, DELAY);
          }
        };

        const statusChanges: string[] = [];
        const component = Image({
          src: "/test.jpg",
          alt: IMAGE_ALT_TEXT,
          fallback: FALLBACK_TEXT,
          onLoadingStatusChange: (status) => statusChanges.push(status),
        });

        const doc = getDocument();
        const unmount = mount(() => component, doc.body)
        const root = component.nodes.at(0) as HTMLElement

        // Initially fallback is visible
        expect(root.textContent).toContain(FALLBACK_TEXT);
        expect(root.querySelector("img")).toBeNull();

        // Wait for image to load
        await new Promise((resolve) => setTimeout(resolve, DELAY + 20));

        // After load: image is mounted, fallback is removed
        const imgEl = root.querySelector("img");
        expect(imgEl).not.toBeNull();
        expect(imgEl?.getAttribute("alt")).toBe(IMAGE_ALT_TEXT);
        expect(imgEl?.getAttribute("data-component")).toBe("image");
        expect(imgEl?.getAttribute("data-part")).toBe("img");
        expect(root.textContent).not.toContain(FALLBACK_TEXT);
        expect(root.getAttribute("data-status")).toBe("loaded");
        expect(statusChanges).toContain("loading");
        expect(statusChanges).toContain("loaded");

        unmount()
      });

      it("should keep fallback and set status to error on image failure", async () => {
        (window.Image as any) = class MockImage {
          onload: () => void = () => {};
          onerror: () => void = () => {};
          src = "";

          constructor() {
            setTimeout(() => {
              this.onerror();
            }, DELAY);
          }
        };

        const component = Image({
          src: "/missing.jpg",
          alt: IMAGE_ALT_TEXT,
          fallback: FALLBACK_TEXT,
        });

        const doc = getDocument();
        const unmount = mount(() => component, doc.body)
        const root = component.nodes.at(0) as HTMLElement

        await new Promise((resolve) => setTimeout(resolve, DELAY + 20));

        expect(root.querySelector("img")).toBeNull();
        expect(root.textContent).toContain(FALLBACK_TEXT);
        expect(root.getAttribute("data-status")).toBe("error");

        unmount()
      });

      it("should delay fallback rendering when fallbackDelay is set", async () => {
        const component = Image({
          fallbackDelay: DELAY,
          fallback: FALLBACK_TEXT,
        });

        const doc = getDocument();
        const unmount = mount(() => component, doc.body)
        const root = component.nodes.at(0) as HTMLElement

        // Initially should not render fallback because of delay
        expect(root.textContent).not.toContain(FALLBACK_TEXT);

        // Wait for delay to pass
        await new Promise((resolve) => setTimeout(resolve, DELAY + 20));

        // Now fallback should be visible
        expect(root.textContent).toContain(FALLBACK_TEXT);

        unmount()
      });

      it("should support createImage compound workflow in the browser", async () => {
        (window.Image as any) = class MockImage {
          onload: () => void = () => {};
          onerror: () => void = () => {};
          src = "";

          constructor() {
            setTimeout(() => {
              this.onload();
            }, DELAY);
          }
        };

        const imgInstance = createImage({ src: "/compound-test.jpg" });
        const root = imgInstance.Root({}, [imgInstance.Fallback({}, FALLBACK_TEXT), imgInstance.Img({ alt: IMAGE_ALT_TEXT })]);

        const doc = getDocument();
        const unmount = mount(() => root, doc.body)

        expect(root.textContent).toContain(FALLBACK_TEXT);
        expect(root.querySelector("img")).toBeNull();

        await new Promise((resolve) => setTimeout(resolve, DELAY + 20));

        expect(root.querySelector("img")).not.toBeNull();
        expect(root.textContent).not.toContain(FALLBACK_TEXT);

        unmount()
      });

      it("should pass axe accessibility checks", async () => {
        const component = Image({
          fallback: FALLBACK_TEXT,
          fallbackProps: { "aria-label": "Claus Nuoskanen" },
        });

        const doc = getDocument();
        const unmount = mount(() => component, doc.body)
        const root = component.nodes.at(0) as HTMLElement

        const results = await axe(root);
        // @ts-expect-error vitest-axe types
        expect(results).toHaveNoViolations();

        unmount()
      });
    });
  }
});
