import "../style.css";
import "../todo.css";
import { $getById, hydrate } from "../../src/index.browser.js";
import { TodoApp } from "./app.js";

declare global {
  interface Window {
    __SEIDR_STATE__: any;
  }
}

const state = window.__SEIDR_STATE__ ?? {};
delete window.__SEIDR_STATE__;

const container = $getById("app");
hydrate(TodoApp, container!, state);
