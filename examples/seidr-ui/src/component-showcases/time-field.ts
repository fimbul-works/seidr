import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span, $strong } from "@fimbul-works/seidr/html";
import { createTimeField, TimeField, type Time } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./time-field.css";

export const TimeFieldShowcase = createComponent(() => {
  // Demo 2: 24-Hour Cycle with Seconds & Live Reactive Readout
  const time24 = createValue<Time | undefined>({ hour: 14, minute: 30, second: 45 });

  // Demo 3: Validation State (Business hours: 09:00 - 17:00)
  const businessTime = createValue<Time | undefined>({ hour: 8, minute: 30 });
  const validationState = businessTime.as((t) => {
    if (!t || t.hour === undefined) return undefined;
    if (t.hour < 9 || t.hour >= 17) return "invalid";
    return "valid";
  });

  // Demo 4: Fine-grained sculpted layout (createTimeField)
  const sculptedField = createTimeField({
    defaultValue: { hour: 9, minute: 0 },
    hourCycle: 12,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "TimeField"),
      $span({ className: "card-badge" }, "Form"),
    ]),
    $p(
      { className: "card-desc" },
      "An accessible time input adhering to the WAI-ARIA spinbutton pattern. Supports multi-segment editing (hour, minute, second, AM/PM), keyboard navigation (↑/↓, PageUp/PageDown, Home/End, ←/→), direct digit typing with auto-advancement, 12h/24h hour cycles, and form reset synchronization.",
    ),

    // Live Previews
    $div({ className: "preview-box" }, [
      $div({ className: "time-field-showcase" }, [
        // 1. Standard 12-Hour TimeField
        $div({ className: "time-field-card" }, [
          $span({ className: "time-field-heading" }, "1. Standard 12-Hour TimeField (AM/PM)"),
          $span(
            { className: "time-field-hint" },
            "Default 12-hour cycle with minute granularity. Click any segment and use ↑ / ↓ or PageUp / PageDown to adjust, type digits to enter values, or use ← / → to move between segments.",
          ),
          TimeField({
            defaultValue: { hour: 10, minute: 30 },
            label: "Meeting Time",
            description: "Choose your preferred interview time",
          }),
        ]),

        // 2. 24-Hour Cycle with Seconds & Live Readout
        $div({ className: "time-field-card" }, [
          $span({ className: "time-field-heading" }, "2. 24-Hour Cycle with Seconds Granularity"),
          $span(
            { className: "time-field-hint" },
            "24-hour cycle displaying hours, minutes, and seconds with forced leading zeros. Synchronizes reactively with a controlled Value<Time>.",
          ),
          TimeField({
            value: time24,
            onChange: (val) => time24(val),
            hourCycle: 24,
            granularity: "second",
            forceLeadingZeros: true,
            label: "Server Deployment Window",
            description: "UTC time (24-hour format)",
          }),
          $div({ className: "time-field-readout" }, [
            $strong({}, "Reactive State: "),
            $span({}, time24.as((t) => (t ? JSON.stringify(t) : "undefined"))),
          ]),
        ]),

        // 3. Range Validation (Business Hours: 09:00 - 17:00)
        $div({ className: "time-field-card" }, [
          $span({ className: "time-field-heading" }, "3. Business Hours Range Validation"),
          $span(
            { className: "time-field-hint" },
            "Restricted to business hours (09:00 - 17:00). Shows real-time validation error when outside this window.",
          ),
          TimeField({
            value: businessTime,
            onChange: (val) => businessTime(val),
            validationState,
            label: "Office Appointment",
            description: "Appointments must be between 9:00 AM and 5:00 PM",
            errorMessage: "Selected time is outside standard office hours",
          }),
        ]),

        // 4. Tier 2 Fine-Grained Sculpted Layout (createTimeField)
        $div({ className: "time-field-card" }, [
          $span({ className: "time-field-heading" }, "4. Tier 2 Fine-Grained Sculpted Layout"),
          $span(
            { className: "time-field-hint" },
            "Using createTimeField() to compose a custom styled glassmorphic time picker with a clock icon and one-click quick reset.",
          ),
          sculptedField.Root({ className: "sculpted-time-field" }, [
            sculptedField.Label({}, "Custom Sculpted Clock"),
            $div({ className: "sculpted-time-container" }, [
              $span({ className: "sculpted-time-icon", ariaHidden: "true" }, "🕒"),
              sculptedField.Input({}, [
                sculptedField.Segment({ segment: "hour" }),
                sculptedField.Separator({}, ":"),
                sculptedField.Segment({ segment: "minute" }),
                sculptedField.Segment({ segment: "dayPeriod" }),
              ]),
              $button(
                {
                  type: "button",
                  className: "sculpted-time-clear",
                  onclick: () => sculptedField.setValue({ hour: 12, minute: 0 }),
                },
                "Reset Noon",
              ),
            ]),
            sculptedField.Description({}, "Custom assembled composition tree via Tier 2 coordinator"),
            sculptedField.HiddenInput({ name: "sculpted_time" }),
          ]),
        ]),
      ]),
    ]),

    // Code Examples
    CodeBlock({
      code: `import { TimeField, createTimeField } from "@fimbul-works/seidr-ui";

// Tier 1: All-in-One Component (12-Hour Cycle with AM/PM)
const StandardTime = TimeField({
  defaultValue: { hour: 10, minute: 30 },
  label: "Meeting Time",
  description: "Select meeting time in hours and minutes",
});

// 24-Hour Cycle with Seconds Granularity
const MilitaryTime = TimeField({
  hourCycle: 24,
  granularity: "second",
  forceLeadingZeros: true,
  defaultValue: { hour: 14, minute: 30, second: 0 },
  label: "Deployment Window",
});

// Tier 2: Fine-Grained Composition
const timeField = createTimeField({ defaultValue: { hour: 9, minute: 0 } });
const SculptedTime = timeField.Root([
  timeField.Label("Custom Clock"),
  timeField.Input([
    timeField.Segment({ segment: "hour" }),
    timeField.Separator(":"),
    timeField.Segment({ segment: "minute" }),
    timeField.Segment({ segment: "dayPeriod" }),
  ]),
  timeField.Description("Fine-grained time picker"),
  timeField.HiddenInput({ name: "meeting_time" }),
]);`,
      language: "typescript",
    }),
  ]);
});

