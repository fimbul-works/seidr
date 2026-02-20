import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $embed } from "./embed";

describeDualMode("Embed Element Parity", () => {
  itHasParity("renders with various attributes", () => {
    return $embed({
      src: "movie.swf",
      type: "application/x-shockwave-flash",
      width: "400",
      height: "300",
    });
  });
});
