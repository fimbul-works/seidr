import { describeDualMode, itHasParity, mockUseScope } from "../test-setup/dual-mode";
import { $audio } from "./audio";

describeDualMode("Audio Element Parity", () => {
  mockUseScope();

  itHasParity("renders with src and controls", () => {
    return $audio({ src: "audio.mp3", controls: true });
  });

  itHasParity("renders with autoplay and loop", () => {
    return $audio({ autoplay: true, loop: true });
  });

  itHasParity("renders with muted and preload", () => {
    return $audio({ muted: true, preload: "metadata" });
  });

  itHasParity("renders with crossorigin", () => {
    return $audio({ crossOrigin: "anonymous" });
  });

  itHasParity("renders with disableremoteplayback (boolean)", () => {
    return $audio({ disableRemotePlayback: true });
  });

  itHasParity("renders with controlslist", () => {
    return $audio({ controls: true });
  });
});
