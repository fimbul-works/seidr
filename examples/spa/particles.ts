import { createLoiske, resizeLoiskeToWindow, useAnimate, useRenderQuad, useTime } from "@fimbul-works/loiske";

import SHADER from "./particles.frag?compress";

const canvas = document.createElement("canvas");
canvas.style = "position:fixed;inset:0;width:100%;height:100%;z-index: -1;";
document.body.appendChild(canvas);
const loiske = useTime(useAnimate(useRenderQuad(createLoiske(canvas))));
const program = loiske.createProgram("particles", SHADER);

try {
  loiske.build();
  resizeLoiskeToWindow(loiske);
  loiske.animate(program);
} catch (e) {
  console.error(e);
}
