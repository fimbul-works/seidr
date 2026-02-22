import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $img } from "./img";

describeDualMode("Image Element Parity", () => {
  mockUseScope();

  itHasParity("renders with src and alt", () => {
    return $img({ src: "img.jpg", alt: "alt" });
  });
});
