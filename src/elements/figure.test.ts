import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $figcaption } from "./figcaption";
import { $figure } from "./figure";
import { $img } from "./img";

describeDualMode("Figure Element Parity", () => {
  mockUseScope();

  itHasParity("renders with figcaption", () => {
    return $figure({}, [$img({ src: "img.jpg", alt: "alt" }), $figcaption({}, ["Figcaption content"])]);
  });
});
