import { $getById, hydrate } from "../../src/index.browser.js";
import { BlogApp } from "./app.js";

const container = $getById("app");
// Seidr automatically looks for window.__SEIDR_HYDRATION_DATA__ if passed
// But we can also pass it explicitly
const hydrationData = (window as any).__SEIDR_HYDRATION_DATA__;

hydrate(BlogApp, container!, hydrationData);
