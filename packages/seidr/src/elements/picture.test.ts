import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $img } from "./img";
import { $picture } from "./picture";
import { $source } from "./source";

describeDualMode("Picture Element Parity", () => {
  itHasParity("renders with source and img", () => {
    return $picture({}, [$source({ srcset: "img.webp", type: "image/webp" }), $img({ src: "img.jpg", alt: "alt" })]);
  });
});
