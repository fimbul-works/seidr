import type { BundleSizeOptions } from "@fimbul-works/bundle-size";

const config: BundleSizeOptions = {
  groups: [
    {
      name: "Bundles",
      include: "bundles/*.js",
      minify: true,
    },
    {
      name: "Examples",
      include: "examples/build/**/*.js",
      minify: true,
    },
    {
      name: "SSR Example",
      include: "examples/ssr/dist/**/*.js",
      minify: false,
    },
  ],
};

export default config;
