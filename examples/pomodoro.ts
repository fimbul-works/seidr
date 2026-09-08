import { isClient, mount, createValue, getComponentScope, onUnmounted } from "../src/index";
import { $button, $div, $h1 } from "../src/elements";

const PomodoroTimer = () => {
  const WORK_TIME = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  const timeLeft = createValue(WORK_TIME);
  const isRunning = createValue(false);
  const mode = createValue<"work" | "break">("work"); // 'work' or 'break'
  const sessionCount = createValue(0);

  let interval: ReturnType<typeof setInterval> | null = null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formattedTime = timeLeft.as(formatTime);

  const tick = () => {
    if (timeLeft() > 0) {
      timeLeft(val => val - 1);
    } else {
      handleSessionComplete();
    }
  };

  const handleSessionComplete = () => {
    isRunning(false);
    playSound();

    if (mode() === "work") {
      const newCount = sessionCount() + 1;
      sessionCount(newCount);

      mode("break");
      timeLeft(newCount % 4 === 0 ? LONG_BREAK : SHORT_BREAK);
    } else {
      mode("work");
      timeLeft(WORK_TIME);
    }
  };

  const playSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwPUKng8LRiGwU2kdry0nwoBS13xu/dkUAKFFyx6O2pVRQKRp/h8r9sIQUsgs/y2Yk1CBtpvPDknE4MD1Cn4O+zYhwGN5HY8tJ8KAUudsbw3JE/ChRdsejuqlUUCkaf4PO/bCAGK4HP8tmJNQgcabzv5ZxPDAxQqN/us2McBjiP1/PMeywFMHXG8N2RQAoUXa/o7qpWFApHn+D0wGwgBiuBzvLZiDUIHGi98OacTwwMUKff77NiHAY4jtjyz3ssBTB1xvDdkUAKFF2v6O6qVhQKR5/g9MBsIAYrgc7y2Yg1",
    );
    audio.play().catch(() => { });
  };

  onUnmounted(
    isRunning.watch((running) => {
      if (running) {
        interval = setInterval(tick, 1000);
      } else {
        if (interval) clearInterval(interval);
      }
    }),
  );

  const toggleTimer = () => {
    isRunning(v => !v);
  };

  const resetTimer = () => {
    isRunning(false);
    mode("work");
    timeLeft(WORK_TIME);
  };

  const skipSession = () => {
    isRunning(false);
    if (mode() === "work") {
      mode("break");
      timeLeft(SHORT_BREAK);
    } else {
      mode("work");
      timeLeft(WORK_TIME);
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
};

// Mount component only in browser environment (not in tests)
if (isClient()) {
  mount(PomodoroTimer, document.body);
}
