import "../style.css";
import { $getById, hydrate } from "../../src/index.browser.js";
import { reconstructComponentTree } from "../../src/ssr/structure/reconstruct-component-tree.js";
import { BlogApp } from "./app.js";

const container = $getById("app");
// Seidr automatically looks for window.__SEIDR_HYDRATION_DATA__ if passed
// But we can also pass it explicitly
const hydrationData = (window as any).__SEIDR_HYDRATION_DATA__;
// console.log(JSON.stringify(hydrationData.components, null, 2));
// console.log(JSON.stringify(reconstructComponentTree(hydrationData.components), null, 2));
hydrate(BlogApp, container!, hydrationData);
