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
      name: "SPA Examples",
      include: "examples/spa/dist/*.js",
      exclude: "examples/spa/dist/particles.js",
    },
    {
      name: "Particle Shader",
      include: "examples/spa/dist/particles.js",
    },
    {
      name: "SSR Examples",
      include: "examples/ssr/dist/**/*.js",
    },
  ],
  json: "bundle-sizes/@date-@time.json",
};

export default config;
