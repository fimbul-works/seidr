import type { BundleSizeOptions } from "@fimbul-works/bundle-size";

const config: BundleSizeOptions = {
  groups: [
    {
      name: "Main Bundles",
      include: "packages/seidr/bundles/*.js",
    },
    {
      name: "Addons",
      include: ["packages/seidr-*/bundles/*.js"],
      exclude: "packages/seidr/bundles/*.js",
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
