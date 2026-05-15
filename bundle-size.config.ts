import { minify } from "vite";

export default {
  groups: [
    {
      name: "Bundles",
      include: "bundles/*.js",
      minify: true,
    },
    {
      name: "Examples",
      include: "examples/build/**/*.js",
      minify: false,
    },
    {
      name: "SSR Example",
      include: "examples/ssr/dist/**/*.js",
      minify: false,
    },
  ],
};
