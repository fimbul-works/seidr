import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { createImage, Image, ImageFallback, ImageImg, ImageRoot } from "./index.js";

const FALLBACK_TEXT = "AB";
const IMAGE_ALT_TEXT = "Fake Image";
const DELAY = 50;

describeDualMode("Image", ({ getDocument, isSSR }) => {
  it("should render root element with default span tag and status data attribute", () => {
    const root = ImageRoot((img) => [img.Fallback(FALLBACK_TEXT)]);
    expect(root.tagName.toLowerCase()).toBe("span");
    expect(root.getAttribute("data-status")).toBe("idle");
  });

  it("should support custom tag for Image.Root", () => {
    const root = Image.Root({ as: "div" }, (img) => [img.Fallback(FALLBACK_TEXT)]);
    expect(root.tagName.toLowerCase()).toBe("div");
  });

  it("should support Image.Root and Image namespace aliases", () => {
    expect(Image.Root).toBe(ImageRoot);
    expect(Image.Img).toBe(ImageImg);
    expect(Image.Fallback).toBe(ImageFallback);
    expect(Image.create).toBe(createImage);
  });

  it("should render fallback initially and not the image", () => {
    const root = Image.Root((img) => [img.Fallback(FALLBACK_TEXT), img.Img({ src: "/test.jpg", alt: IMAGE_ALT_TEXT })]);

    expect(root.textContent).toContain(FALLBACK_TEXT);
    expect(root.querySelector("img")).toBeNull();
  });

  it("should work with createImage instance factory", () => {
    const imgInstance = createImage();
    const root = Image.Root([
      imgInstance.Fallback(FALLBACK_TEXT),
      imgInstance.Img({ src: "/test.jpg", alt: IMAGE_ALT_TEXT }),
    ]);

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
        const root = Image.Root(
          {
            onLoadingStatusChange: (status) => statusChanges.push(status),
          },
          (img) => [img.Fallback(FALLBACK_TEXT), img.Img({ src: "/test.jpg", alt: IMAGE_ALT_TEXT })],
        );

        const doc = getDocument();
        doc.body.appendChild(root);

        // Initially fallback is visible
        expect(root.textContent).toContain(FALLBACK_TEXT);
        expect(root.querySelector("img")).toBeNull();

        // Wait for image to load
        await new Promise((resolve) => setTimeout(resolve, DELAY + 20));

        // After load: image is mounted, fallback is removed
        const imgEl = root.querySelector("img");
        expect(imgEl).not.toBeNull();
        expect(imgEl?.getAttribute("alt")).toBe(IMAGE_ALT_TEXT);
        expect(root.textContent).not.toContain(FALLBACK_TEXT);
        expect(root.getAttribute("data-status")).toBe("loaded");
        expect(statusChanges).toContain("loading");
        expect(statusChanges).toContain("loaded");

        doc.body.removeChild(root);
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

        const root = Image.Root((img) => [
          img.Fallback(FALLBACK_TEXT),
          img.Img({ src: "/missing.jpg", alt: IMAGE_ALT_TEXT }),
        ]);

        const doc = getDocument();
        doc.body.appendChild(root);

        await new Promise((resolve) => setTimeout(resolve, DELAY + 20));

        expect(root.querySelector("img")).toBeNull();
        expect(root.textContent).toContain(FALLBACK_TEXT);
        expect(root.getAttribute("data-status")).toBe("error");

        doc.body.removeChild(root);
      });

      it("should delay fallback rendering when fallbackDelay is set", async () => {
        const root = Image.Root({ fallbackDelay: DELAY }, (img) => [img.Fallback(FALLBACK_TEXT)]);

        const doc = getDocument();
        doc.body.appendChild(root);

        // Initially should not render fallback because of delay
        expect(root.textContent).not.toContain(FALLBACK_TEXT);

        // Wait for delay to pass
        await new Promise((resolve) => setTimeout(resolve, DELAY + 20));

        // Now fallback should be visible
        expect(root.textContent).toContain(FALLBACK_TEXT);

        doc.body.removeChild(root);
      });

      it("should pass axe accessibility checks", async () => {
        const root = Image.Root((img) => [img.Fallback({ ariaLabel: "Claus Nuoskanen" }, FALLBACK_TEXT)]);

        const doc = getDocument();
        doc.body.appendChild(root);

        const results = await axe(root);
        // @ts-expect-error vitest-axe types
        expect(results).toHaveNoViolations();

        doc.body.removeChild(root);
      });
    });
  }
});
