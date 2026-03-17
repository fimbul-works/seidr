import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $img } from "./img";

describeDualMode("Image Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with src and alt", () => {
    return $img({ src: "img.jpg", alt: "alt" });
  });
});
