import { $blockquote } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Block Quotation Element Parity", () => {
  itHasParity("renders with cite attribute", () => {
    return $blockquote({ cite: "https://www.huxley.net/bnw/four.html" }, [
      "Words can be like X-rays, if you use them properly—they’ll go through anything.",
    ]);
  });
});
