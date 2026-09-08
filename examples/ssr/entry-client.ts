/// <reference types="vite/client" />
import "./style.css";

import { $getById, hydrate } from "@fimbul-works/seidr";
import { BlogApp } from "./app.js";

declare global {
  interface Window {
    __SEIDR_HYDRATION_DATA__: any;
  }
}

const hydrationData = window.__SEIDR_HYDRATION_DATA__;

const appEl = $getById("app");
if (appEl && hydrationData) {
  hydrate(() => BlogApp(window.location.pathname), appEl, hydrationData);
}
