import { $ } from "../../../element/create-element";
import { $picture } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Picture Element Parity", () => {
  itHasParity("renders with source and img", () => {
    return $picture({}, [
      $("source", { srcset: "img.webp", type: "image/webp" }),
      $("img", { src: "img.jpg", alt: "alt" }),
    ]);
  });
});
