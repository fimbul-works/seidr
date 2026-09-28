import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { $code } from "./code";

describeDualMode("Code Element Parity", () => {
  itHasParity("renders with text content", () => {
    return $code({ textContent: "hello world" });
  });
});
