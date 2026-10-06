import type { BundleSizeOptions } from "@fimbul-works/bundle-size";

const config: BundleSizeOptions = {
  groups: [
    {
      name: "Bundles",
      include: "bundles/*.js",
    },
    {
      name: "Examples",
      include: "examples/build/**/*.js",
    },
    {
      name: "SSR Example",
      include: "examples/ssr/dist/**/*.js",
    },
  ],
  json: "bundle-sizes/@date-@time.json",
};

export default config;
