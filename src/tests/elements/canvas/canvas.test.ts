import { $canvas } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Canvas Element Parity", () => {
  itHasParity("renders with width and height", () => {
    return $canvas({ width: 800, height: 600 });
  });

  itHasParity("renders with fallback content", () => {
    return $canvas({ id: "game-canvas" }, ["Canvas not supported"]);
  });
});
