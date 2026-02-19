import { $audio } from "../../../element/elements";
import { describeDualMode, itHasParity } from "../../../test-setup/dual-mode";

describeDualMode("Audio Element Parity", () => {
  itHasParity("renders with src and controls", () => {
    return $audio({ src: "audio.mp3", controls: true as any });
  });

  itHasParity("renders with autoplay and loop", () => {
    return $audio({ autoplay: true as any, loop: true as any });
  });

  itHasParity("renders with muted and preload", () => {
    return $audio({ muted: true as any, preload: "metadata" });
  });

  itHasParity("renders with crossorigin", () => {
    return $audio({ crossOrigin: "anonymous" });
  });

  itHasParity("renders with disableremoteplayback (boolean)", () => {
    return $audio({ disableRemotePlayback: true as any });
  });

  itHasParity("renders with controlslist", () => {
    return $audio({ controls: "nodownload" as any });
  });
});
