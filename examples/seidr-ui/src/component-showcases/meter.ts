import { createComponent } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createMeter, Meter } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./meter.css";

export const MeterShowcase = createComponent(() => {
  // Fine-grained coordinator for Section 4
  const fineGrained = createMeter({
    value: 58,
    minValue: 0,
    maxValue: 100,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Meter"),
      $span({ className: "card-badge" }, "Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "Displays a scalar measurement or quantity within a known range (role=\"meter\"). Ideal for capacity indicators, battery levels, disk storage, memory utilization, and performance metrics.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "meter-showcase" }, [
        // 1. Storage Usage
        $div({ className: "meter-showcase-section" }, [
          $h3({ className: "meter-showcase-heading" }, "1. Standard Measurement (Storage Capacity)"),
          Meter({
            id: "storage-meter",
            value: 64,
            minValue: 0,
            maxValue: 256,
            label: "Internal SSD",
            valueLabel: true,
            getValueLabel: ({ value, max }) => `${value} GB of ${max} GB`,
          }),
        ]),

        // 2. Warning Threshold (Memory Usage)
        $div({ className: "meter-showcase-section meter-warning" }, [
          $h3({ className: "meter-showcase-heading" }, "2. High Utilization (Warning Level)"),
          Meter({
            id: "memory-meter",
            value: 78,
            minValue: 0,
            maxValue: 100,
            label: "RAM Utilization",
            valueLabel: true,
          }),
        ]),

        // 3. Critical Threshold (Thermal / CPU)
        $div({ className: "meter-showcase-section meter-danger" }, [
          $h3({ className: "meter-showcase-heading" }, "3. Critical Threshold (Thermal Monitor)"),
          Meter({
            id: "thermal-meter",
            value: 92,
            minValue: 20,
            maxValue: 100,
            label: "Core Package Temp",
            valueLabel: true,
            getValueLabel: ({ value }) => `${value}°C`,
          }),
        ]),

        // 4. Fine-Grained Coordinator (createMeter)
        $div({ className: "meter-showcase-section" }, [
          $h3({ className: "meter-showcase-heading" }, "4. Fine-Grained Coordinator (createMeter)"),
          fineGrained.Root({}, [
            fineGrained.Header({}, [
              fineGrained.Label({}, "Bandwidth Quota"),
              fineGrained.ValueLabel({}),
            ]),
            fineGrained.Track({}, [fineGrained.Fill({})]),
          ]),
        ]),
      ]),
    ]),

    // Usage Examples
    CodeBlock(
      `import { createMeter, Meter } from "@fimbul-works/seidr-ui";

// 1. All-in-One Component (Tier 1)
Meter({
  value: 64,
  minValue: 0,
  maxValue: 256,
  label: "SSD Storage",
  getValueLabel: ({ value, max }) => \`\${value} GB of \${max} GB\`,
});

// 2. Fine-Grained Coordinator (Tier 2)
const meter = createMeter({
  value: 82,
  minValue: 0,
  maxValue: 100,
});

meter.Root({}, [
  meter.Label({}, "CPU Load"),
  meter.ValueLabel({}),
  meter.Track({}, [
    meter.Fill({}),
  ]),
]);`,
    ),
  ]);
}, "MeterShowcase");
