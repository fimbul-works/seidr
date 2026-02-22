import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $blockquote } from "./blockquote";

describeDualMode("Block Quotation Element Parity", () => {
  mockUseScope();

  itHasParity("renders with cite attribute", () => {
    return $blockquote({ cite: "https://www.huxley.net/bnw/four.html" }, [
      "Words can be like X-rays, if you use them properly—they’ll go through anything.",
    ]);
  });
});
