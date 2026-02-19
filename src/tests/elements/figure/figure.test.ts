import { $ } from "../../../element/create-element";
import { $figcaption, $figure } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Figure Element Parity", () => {
  itHasParity("renders with figcaption", () => {
    return $figure({}, [$("img", { src: "img.jpg", alt: "alt" }), $figcaption({}, ["Figcaption content"])]);
  });
});
