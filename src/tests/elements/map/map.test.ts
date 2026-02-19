import { $ } from "../../../element/create-element";
import { $map } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Map Element Parity", () => {
  itHasParity("renders with areas", () => {
    return $map({ name: "infomap" }, [$("area", { shape: "rect", coords: "0,0,82,126", href: "sun.htm", alt: "Sun" })]);
  });
});
