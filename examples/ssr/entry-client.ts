/// <reference types="vite/client" />
import "../todo.css";

import { $getById, hydrate } from "@fimbul-works/seidr";
import { TodoApp } from "../todo-mvc.js";

declare global {
  interface Window {
    __SEIDR_HYDRATION_DATA__: any;
  }
}

const hydrationData = window.__SEIDR_HYDRATION_DATA__;

hydrate(TodoApp, $getById("app"), hydrationData);
