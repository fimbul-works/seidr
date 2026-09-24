/// <reference types="vite/client" />
import "./style.css";

import { $getById, hydrate } from "@fimbul-works/seidr";
import type { HydrationData } from "@fimbul-works/seidr/ssr";
import { BlogApp } from "./app.js";

declare global {
  interface Window {
    __SEIDR_HYDRATION_DATA__: HydrationData;
  }
}

const hydrationData = window.__SEIDR_HYDRATION_DATA__;

console.log(JSON.stringify(hydrationData.data.state, null, 2));
console.log(JSON.stringify(hydrationData.data["seidr.random"], null, 2));

const appEl = $getById("app");
if (appEl && hydrationData) {
  hydrate(() => BlogApp(window.location.pathname), appEl, hydrationData);
}
