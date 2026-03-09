import { describeDualMode, itHasParity, mockComponentScope } from "../test-setup/dual-mode";
import { $img } from "./img";

describeDualMode("Image Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with src and alt", () => {
    return $img({ src: "img.jpg", alt: "alt" });
  });
});
