import type { Component } from "../component/types";
import { createRenderFeature } from "../render-context/feature";

export const rootNodeFeature = createRenderFeature<Node | undefined>({
  id: "seidr.dom.rootNode",
});

export const rootComponentFeature = createRenderFeature<Component | undefined>({
  id: "seidr.dom.rootComponent",
});
