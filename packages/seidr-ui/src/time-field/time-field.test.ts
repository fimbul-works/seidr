import {
  $,
  createComponent,
  createValue,
  mount,
  type SeidrChild,
  type Value,
} from "@fimbul-works/seidr";
import { describeDualMode } from "@fimbul-works/seidr/testing";
import { afterEach, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { createTimeField, TimeField, type Time } from "./index.js";

describeDualMode("TimeField", ({ getDocument, isSSR }) => {
  let target: HTMLElement;
  let unmount: () => void;

  afterEach(() => {
    unmount?.();
    target?.remove();
  });

  const setup = (factory: () => SeidrChild) => {
    target = getDocument().createElement("div");
    getDocument().body.appendChild(target);
    const App = createComponent(factory);
    unmount = mount(App, target);
    return target;
  };

  const fireKeyDown = (el: HTMLElement, key: string, options: Partial<KeyboardEventInit> = {}) => {
    const event = new (getDocument().defaultView?.KeyboardEvent ?? KeyboardEvent)("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    el.dispatchEvent(event);
    return event;
  };

  it("renders with default props and proper semantic and ARIA attributes", () => {
    const root = setup(() =>
      TimeField({
        label: "Appointment Time",
        description: "Choose your preferred time",
      }),
    );

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const label = root.querySelector("[data-part='label']") as HTMLLabelElement;
    const input = root.querySelector("[data-part='input']") as HTMLElement;
    const segments = root.querySelectorAll("[data-part='segment']");
    const separators = root.querySelectorAll("[data-part='separator']");
    const desc = root.querySelector("[data-part='description']") as HTMLElement;
    const hidden = root.querySelector("[data-part='hidden-input']") as HTMLInputElement;

    expect(rootEl).toBeTruthy();
    expect(rootEl.getAttribute("role")).toBe("group");
    expect(rootEl.getAttribute("data-component")).toBe("time-field");

    expect(label).toBeTruthy();
    expect(label.textContent).toBe("Appointment Time");

    expect(input).toBeTruthy();
    expect(input.getAttribute("role")).toBe("presentation");

    // By default 12-hour cycle with minute granularity: hour, minute, dayPeriod segments
    expect(segments.length).toBe(3);
    const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
    const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;
    const periodSeg = root.querySelector("[data-type='dayPeriod']") as HTMLElement;

    expect(hourSeg).toBeTruthy();
    expect(hourSeg.getAttribute("role")).toBe("spinbutton");
    expect(String(hourSeg.getAttribute("tabindex"))).toBe("0");
    expect(hourSeg.getAttribute("aria-label")).toBe("hour");

    expect(minSeg).toBeTruthy();
    expect(minSeg.getAttribute("role")).toBe("spinbutton");
    expect(String(minSeg.getAttribute("tabindex"))).toBe("0");
    expect(minSeg.getAttribute("aria-label")).toBe("minute");

    expect(periodSeg).toBeTruthy();
    expect(periodSeg.getAttribute("role")).toBe("spinbutton");
    expect(String(periodSeg.getAttribute("tabindex"))).toBe("0");
    expect(periodSeg.getAttribute("aria-label")).toBe("AM/PM");

    // Separators
    expect(separators.length).toBe(1);
    expect(separators[0].getAttribute("aria-hidden")).toBe("true");

    // Description
    expect(desc).toBeTruthy();
    expect(desc.textContent).toBe("Choose your preferred time");

    // Hidden input
    expect(hidden).toBeTruthy();
    expect(hidden.getAttribute("data-part")).toBe("hidden-input");
  });

  it("renders 24-hour cycle and second granularity properly", () => {
    const root = setup(() =>
      TimeField({
        hourCycle: 24,
        granularity: "second",
        defaultValue: { hour: 14, minute: 30, second: 45 },
      }),
    );

    const segments = root.querySelectorAll("[data-part='segment']");
    const separators = root.querySelectorAll("[data-part='separator']");

    // 24-hour with second granularity: hour, minute, second (no dayPeriod)
    expect(segments.length).toBe(3);
    const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
    const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;
    const secSeg = root.querySelector("[data-type='second']") as HTMLElement;
    const periodSeg = root.querySelector("[data-type='dayPeriod']");

    expect(hourSeg).toBeTruthy();
    expect(minSeg).toBeTruthy();
    expect(secSeg).toBeTruthy();
    expect(periodSeg).toBeNull();

    expect(hourSeg.textContent).toBe("14");
    expect(minSeg.textContent).toBe("30");
    expect(secSeg.textContent).toBe("45");

    // Two separators: between hour/min and min/sec
    expect(separators.length).toBe(2);
  });

  it("displays formatted time with defaultValue", () => {
    const root = setup(() =>
      TimeField({
        defaultValue: { hour: 9, minute: 5, second: 0 },
        forceLeadingZeros: true,
      }),
    );

    const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
    const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;
    const periodSeg = root.querySelector("[data-type='dayPeriod']") as HTMLElement;

    expect(hourSeg.textContent).toBe("09");
    expect(minSeg.textContent).toBe("05");
    expect(periodSeg.textContent).toBe("AM");
  });

  it("supports controlled value via Value<Time>", () => {
    let timeVal!: Value<Time | undefined>;

    const root = setup(() => {
      timeVal = createValue<Time | undefined>({ hour: 8, minute: 15 }, { id: "test-controlled-time" });
      return TimeField({
        value: timeVal,
      });
    });

    const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
    const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;
    expect(hourSeg.textContent).toBe("8");
    expect(minSeg.textContent).toBe("15");

    timeVal({ hour: 11, minute: 45 });
    expect(hourSeg.textContent).toBe("11");
    expect(minSeg.textContent).toBe("45");
  });

  it("respects disabled state", () => {
    const root = setup(() =>
      TimeField({
        disabled: true,
        defaultValue: { hour: 10, minute: 0 },
      }),
    );

    const segments = root.querySelectorAll("[data-part='segment']");
    for (const seg of segments) {
      expect(seg.getAttribute("aria-disabled")).toBe("true");
      expect(String(seg.getAttribute("tabindex"))).toBe("-1");
    }

    if (!isSSR) {
      const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
      fireKeyDown(hourSeg, "ArrowUp");
      expect(hourSeg.textContent).toBe("10");
    }
  });

  it("respects readOnly state", () => {
    const root = setup(() =>
      TimeField({
        readOnly: true,
        defaultValue: { hour: 10, minute: 0 },
      }),
    );

    const segments = root.querySelectorAll("[data-part='segment']");
    for (const seg of segments) {
      expect(seg.getAttribute("aria-readonly")).toBe("true");
    }

    if (!isSSR) {
      const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
      fireKeyDown(hourSeg, "ArrowUp");
      expect(hourSeg.textContent).toBe("10");
    }
  });

  if (!isSSR) {
    it("handles ArrowUp and ArrowDown adjustments with wrap-around", () => {
      const onChange = vi.fn();
      const root = setup(() =>
        TimeField({
          defaultValue: { hour: 12, minute: 59 },
          onChange,
        }),
      );

      const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
      const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;
      const periodSeg = root.querySelector("[data-type='dayPeriod']") as HTMLElement;

      // In 12h: 12 -> ArrowUp -> 1
      fireKeyDown(hourSeg, "ArrowUp");
      expect(hourSeg.textContent).toBe("1");

      // 1 -> ArrowDown -> 12
      fireKeyDown(hourSeg, "ArrowDown");
      expect(hourSeg.textContent).toBe("12");

      // Minute: 59 -> ArrowUp -> 0
      fireKeyDown(minSeg, "ArrowUp");
      expect(minSeg.textContent).toBe("00");

      // Minute: 0 -> ArrowDown -> 59
      fireKeyDown(minSeg, "ArrowDown");
      expect(minSeg.textContent).toBe("59");

      // DayPeriod: PM -> ArrowUp -> AM
      expect(periodSeg.textContent).toBe("PM");
      fireKeyDown(periodSeg, "ArrowUp");
      expect(periodSeg.textContent).toBe("AM");
      fireKeyDown(periodSeg, "ArrowDown");
      expect(periodSeg.textContent).toBe("PM");
    });

    it("handles PageUp and PageDown adjustments", () => {
      const root = setup(() =>
        TimeField({
          defaultValue: { hour: 6, minute: 10 },
        }),
      );

      const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
      const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;

      // Hour page step is 2: 6 -> 8
      fireKeyDown(hourSeg, "PageUp");
      expect(hourSeg.textContent).toBe("8");

      fireKeyDown(hourSeg, "PageDown");
      expect(hourSeg.textContent).toBe("6");

      // Minute page step is 15: 10 -> 25
      fireKeyDown(minSeg, "PageUp");
      expect(minSeg.textContent).toBe("25");

      fireKeyDown(minSeg, "PageDown");
      expect(minSeg.textContent).toBe("10");
    });

    it("handles Home and End keys to jump to min and max", () => {
      const root = setup(() =>
        TimeField({
          defaultValue: { hour: 6, minute: 30 },
        }),
      );

      const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
      const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;

      fireKeyDown(minSeg, "Home");
      expect(minSeg.textContent).toBe("00");

      fireKeyDown(minSeg, "End");
      expect(minSeg.textContent).toBe("59");

      fireKeyDown(hourSeg, "Home");
      expect(hourSeg.textContent).toBe("1");

      fireKeyDown(hourSeg, "End");
      expect(hourSeg.textContent).toBe("12");
    });

    it("handles digit typing and auto-advancement", () => {
      const root = setup(() =>
        TimeField({
          defaultValue: { hour: 1, minute: 10 },
        }),
      );

      const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
      const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;
      const periodSeg = root.querySelector("[data-type='dayPeriod']") as HTMLElement;

      hourSeg.focus();

      // Typing '2' in 12h mode: since 2 cannot be followed by another digit to make a valid 12h (< 13),
      // it sets hour to 2 and auto-advances focus to minute!
      fireKeyDown(hourSeg, "2");
      expect(hourSeg.textContent).toBe("2");
      expect(document.activeElement).toBe(minSeg);

      // Typing '4', then '5' into minute sets 45
      fireKeyDown(minSeg, "4");
      expect(minSeg.textContent).toBe("04");
      fireKeyDown(minSeg, "5");
      expect(minSeg.textContent).toBe("45");
      // Typing 2 digits in minute auto-advances to dayPeriod
      expect(document.activeElement).toBe(periodSeg);

      // Typing 'a' in dayPeriod sets AM
      fireKeyDown(periodSeg, "a");
      expect(periodSeg.textContent).toBe("AM");

      // Typing 'p' sets PM
      fireKeyDown(periodSeg, "p");
      expect(periodSeg.textContent).toBe("PM");
    });

    it("handles Backspace key", () => {
      const root = setup(() =>
        TimeField({
          defaultValue: { hour: 11, minute: 45 },
        }),
      );

      const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
      hourSeg.focus();

      // Backspace clears hour to placeholder "--"
      fireKeyDown(hourSeg, "Backspace");
      expect(hourSeg.textContent).toBe("--");
    });

    it("navigates between segments with ArrowLeft and ArrowRight", () => {
      const root = setup(() =>
        TimeField({
          defaultValue: { hour: 10, minute: 30 },
        }),
      );

      const input = root.querySelector("[data-part='input']") as HTMLElement;
      const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
      const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;
      const periodSeg = root.querySelector("[data-type='dayPeriod']") as HTMLElement;

      hourSeg.focus();
      expect(document.activeElement).toBe(hourSeg);

      // ArrowRight advances to minute
      fireKeyDown(input, "ArrowRight");
      expect(document.activeElement).toBe(minSeg);

      // ArrowRight advances to dayPeriod
      fireKeyDown(input, "ArrowRight");
      expect(document.activeElement).toBe(periodSeg);

      // ArrowLeft goes back to minute
      fireKeyDown(input, "ArrowLeft");
      expect(document.activeElement).toBe(minSeg);

      // ArrowLeft goes back to hour
      fireKeyDown(input, "ArrowLeft");
      expect(document.activeElement).toBe(hourSeg);
    });

    it("handles form reset synchronization", () => {
      let formEl!: HTMLFormElement;
      const root = setup(() => {
        const form = $("form", {}, [
          TimeField({
            name: "eventTime",
            defaultValue: { hour: 9, minute: 0 },
          }),
        ]);
        formEl = form;
        return form;
      });

      const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
      fireKeyDown(hourSeg, "ArrowUp");
      expect(hourSeg.textContent).toBe("10");

      formEl.reset();
      expect(hourSeg.textContent).toBe("9");
    });

    it("passes axe accessibility audit", async () => {
      setup(() =>
        TimeField({
          label: "Meeting time",
          description: "Select meeting time in hours and minutes",
        }),
      );

      const results = await axe(target);
      expect(results).toHaveNoViolations();
    });
  }

  it("supports Tier 2 fine-grained composition via createTimeField", () => {
    const root = setup(() => {
      const tf = createTimeField({
        defaultValue: { hour: 3, minute: 15 },
      });

      return tf.Root({}, [
        tf.Label({}, "Start Time"),
        tf.Input({}, [
          tf.Segment({ segment: "hour" }),
          tf.Separator({}, ":"),
          tf.Segment({ segment: "minute" }),
          tf.Segment({ segment: "dayPeriod" }),
        ]),
        tf.Description({}, "Fine-grained time picker"),
        tf.HiddenInput({ name: "start_time" }),
      ]);
    });

    const rootEl = root.querySelector("[data-part='root']") as HTMLElement;
    const label = root.querySelector("[data-part='label']") as HTMLLabelElement;
    const hourSeg = root.querySelector("[data-type='hour']") as HTMLElement;
    const minSeg = root.querySelector("[data-type='minute']") as HTMLElement;
    const periodSeg = root.querySelector("[data-type='dayPeriod']") as HTMLElement;
    const hidden = root.querySelector("[data-part='hidden-input']") as HTMLInputElement;

    expect(rootEl).toBeTruthy();
    expect(label.textContent).toBe("Start Time");
    expect(hourSeg.textContent).toBe("3");
    expect(minSeg.textContent).toBe("15");
    expect(periodSeg.textContent).toBe("AM");
    expect(hidden).toBeTruthy();
    expect(hidden.getAttribute("name")).toBe("start_time");
  });
});
