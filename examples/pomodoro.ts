import { Seidr, component, mount, $div, $h1, $button } from "../src/index.browser.js";

function PomodoroTimer() {
  return component((scope) => {
    const WORK_TIME = 25 * 60;
    const SHORT_BREAK = 5 * 60;
    const LONG_BREAK = 15 * 60;

    const timeLeft = new Seidr(WORK_TIME);
    const isRunning = new Seidr(false);
    const mode = new Seidr<"work" | "break">("work"); // 'work' or 'break'
    const sessionCount = new Seidr(0);

    let interval: ReturnType<typeof setInterval> | null = null;

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const formattedTime = timeLeft.as(formatTime);

    const tick = () => {
      if (timeLeft.value > 0) {
        timeLeft.value--;
      } else {
        handleSessionComplete();
      }
    };

    const handleSessionComplete = () => {
      isRunning.value = false;
      playSound();

      if (mode.value === "work") {
        const newCount = sessionCount.value + 1;
        sessionCount.value = newCount;

        mode.value = "break";
        timeLeft.value = newCount % 4 === 0 ? LONG_BREAK : SHORT_BREAK;
      } else {
        mode.value = "work";
        timeLeft.value = WORK_TIME;
      }
    };

    const playSound = () => {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwPUKng8LRiGwU2kdry0nwoBS13xu/dkUAKFFyx6O2pVRQKRp/h8r9sIQUsgs/y2Yk1CBtpvPDknE4MD1Cn4O+zYhwGN5HY8tJ8KAUudsbw3JE/ChRdsejuqlUUCkaf4PO/bCAGK4HP8tmJNQgcabzv5ZxPDAxQqN/us2McBjiP1/PMeywFMHXG8N2RQAoUXa/o7qpWFApHn+D0wGwgBiuBzvLZiDUIHGi98OacTwwMUKff77NiHAY4jtjyz3ssBTB1xvDdkUAKFF2v6O6qVhQKR5/g9MBsIAYrgc7y2Yg1",
      );
      audio.play().catch(() => {});
    };

    scope.track(
      isRunning.observe((running) => {
        if (running) {
          interval = setInterval(tick, 1000);
        } else {
          if (interval) clearInterval(interval);
        }
      }),
    );

    const toggleTimer = () => {
      isRunning.value = !isRunning.value;
    };

    const resetTimer = () => {
      isRunning.value = false;
      mode.value = "work";
      timeLeft.value = WORK_TIME;
    };

    const skipSession = () => {
      isRunning.value = false;
      if (mode.value === "work") {
        mode.value = "break";
        timeLeft.value = SHORT_BREAK;
      } else {
        mode.value = "work";
        timeLeft.value = WORK_TIME;
      }
    };

    const modeText = mode.as<string>((m) => (m === "work" ? "🎯 Work Time" : "☕ Break Time"));
    const sessionText = sessionCount.as<string>((c) => `Session ${c}`);
    const buttonText = isRunning.as<string>((r) => (r ? "⏸ Pause" : "▶ Start"));

    return $div(
      {
        className: "card card-large timer-card",
      },
      [
        $h1({
          className: "timer-mode",
          textContent: modeText,
        }),

        $div({
          className: "session-count",
          textContent: sessionText,
        }),

        $div({
          className: "timer-display",
          textContent: formattedTime,
        }),

        $div(
          {
            className: "timer-controls",
          },
          [
            $button({
              className: "btn btn-primary btn-large",
              textContent: buttonText,
              onclick: toggleTimer,
            }),

            $button({
              className: "btn btn-outline btn-medium",
              textContent: "🔄 Reset",
              onclick: resetTimer,
            }),

            $button({
              className: "btn btn-outline-secondary btn-medium",
              textContent: "⏭ Skip",
              onclick: skipSession,
            }),
          ],
        ),
      ],
    );
  });
}

// Mount component only in browser environment (not in tests)
if (typeof window !== "undefined") {
  mount(PomodoroTimer(), document.body);
}
