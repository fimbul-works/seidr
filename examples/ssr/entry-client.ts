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

const appEl = $getById("app");
if (appEl && hydrationData) {
  hydrate(BlogApp, appEl, hydrationData);
}
