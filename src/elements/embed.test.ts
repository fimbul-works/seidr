import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $embed } from "./embed";

describeDualMode("Embed Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with various attributes", () => {
    return $embed({
      src: "movie.swf",
      type: "application/x-shockwave-flash",
      width: "400",
      height: "300",
    });
  });
});
