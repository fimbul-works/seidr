import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $canvas } from "./canvas";

describeDualMode("Canvas Element Parity", () => {
  mockUseScope();

  itHasParity("renders with width and height", () => {
    return $canvas({ width: 800, height: 600 });
  });

  itHasParity("renders with fallback content", () => {
    return $canvas({ id: "game-canvas" }, ["Canvas not supported"]);
  });
});
