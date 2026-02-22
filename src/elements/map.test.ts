import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $area } from "./area";
import { $map } from "./map";

describeDualMode("Map Element Parity", () => {
  mockUseScope();

  itHasParity("renders with areas", () => {
    return $map({ name: "infomap" }, [$area({ shape: "rect", coords: "0,0,82,126", href: "sun.htm", alt: "Sun" })]);
  });
});
