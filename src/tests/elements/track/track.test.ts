import { $track } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Track Element Parity", () => {
  itHasParity("renders with various attributes", () => {
    return $track({
      kind: "subtitles",
      src: "subs.vtt",
      srclang: "en",
      label: "English",
      default: true,
    });
  });
});
