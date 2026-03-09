import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $figcaption } from "./figcaption";
import { $figure } from "./figure";
import { $img } from "./img";

describeDualMode("Figure Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with figcaption", () => {
    return $figure({}, [$img({ src: "img.jpg", alt: "alt" }), $figcaption({}, ["Figcaption content"])]);
  });
});
