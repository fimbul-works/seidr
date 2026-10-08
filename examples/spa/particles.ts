import { createLoiske, resizeLoiskeToWindow, useAnimate, useRenderQuad, useTime } from "@fimbul-works/loiske";

import SHADER from "./particles.frag?compress";

const canvas = document.createElement("canvas");
canvas.style = "position:fixed;inset:0;width:100%;height:100%;z-index: -1;";
document.body.appendChild(canvas);

try {
  const loiske = useTime(useAnimate(useRenderQuad(createLoiske(canvas))));
  const program = loiske.createProgram("particles", SHADER);
  loiske.build();

  // Check user preferences for animation
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    resizeLoiskeToWindow(loiske);
    loiske.animate(program);
  } else {
    resizeLoiskeToWindow(loiske, () => loiske.renderQuad(program));
  }
} catch (e) {
  console.error(e);
}
