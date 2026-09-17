import { describeDualMode, itHasParity } from "../test-setup/dual-mode";
import { mockComponentScope } from "../test-setup/mock";
import { $code } from "./code";

describeDualMode("Code Element Parity", () => {
  mockComponentScope();

  itHasParity("renders with text content", () => {
    return $code({ textContent: "hello world" });
  });
});
