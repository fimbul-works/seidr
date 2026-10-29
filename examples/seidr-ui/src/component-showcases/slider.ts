import { createComponent } from "@fimbul-works/seidr";
import { $div, $h2, $h3, $p, $section, $span } from "@fimbul-works/seidr/html";
import { createSlider, Slider } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./slider.css";

export const SliderShowcase = createComponent(() => {
  // Fine-grained coordinator for Section 4
  const fineGrained = createSlider({
    defaultValue: 45,
    minValue: 0,
    maxValue: 100,
  });

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "Slider"),
      $span({ className: "card-badge" }, "Form / Widget"),
    ]),
    $p(
      { className: "card-desc" },
      "An interactive input element that allows users to select a value or range of values along a bar. Features full keyboard navigation, continuous drag updates, custom step intervals, multi-thumb ranges, and vertical orientation.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "slider-showcase" }, [
        // 1. All-in-One Continuous Slider
        $div({ className: "slider-showcase-section" }, [
          $h3({ className: "slider-showcase-heading" }, "1. Continuous Slider (Single Value)"),
          Slider({
            id: "volume-slider",
            label: "Audio Volume",
            valueLabel: true,
            defaultValue: 65,
            description: "Adjust master output volume",
          }),
        ]),

        // 2. Multi-Thumb Range Slider
        $div({ className: "slider-showcase-section" }, [
          $h3({ className: "slider-showcase-heading" }, "2. Range Slider (Multi-Thumb)"),
          Slider({
            id: "price-range-slider",
            label: "Price Filter",
            valueLabel: true,
            defaultValue: [25, 75],
            thumbs: 2,
            minStepsBetweenThumbs: 5,
            getValueLabel: ({ values }) => `$${values[0]} – $${values[1]}`,
            description: "Filter products within budget range",
          }),
        ]),

        // 3. Stepped Slider
        $div({ className: "slider-showcase-section" }, [
          $h3({ className: "slider-showcase-heading" }, "3. Discrete Stepped Slider (Step = 20)"),
          Slider({
            id: "stepped-slider",
            label: "Quality Preset",
            valueLabel: true,
            defaultValue: 40,
            step: 20,
            getValueLabel: ({ values }) => `${values[0]}%`,
            description: "Snaps to nearest 20% interval",
          }),
        ]),

        // 4. Fine-Grained Coordinator (createSlider)
        $div({ className: "slider-showcase-section" }, [
          $h3({ className: "slider-showcase-heading" }, "4. Fine-Grained Coordinator (createSlider)"),
          fineGrained.Root({}, [
            $div({ className: "slider-header" }, [
              fineGrained.Label({}, "Custom Zoom"),
              fineGrained.ValueLabel(
                {},
                fineGrained.values.as((v) => `${v[0]}x`),
              ),
            ]),
            fineGrained.Track({}, [
              fineGrained.Fill({}),
              fineGrained.Thumb({ index: 0 }),
              fineGrained.Input({ index: 0 }),
            ]),
            fineGrained.Description({}, "Fine-grained layout composition with individual sub-parts"),
          ]),
        ]),

        // 5. Vertical Orientation
        $div({ className: "slider-showcase-section" }, [
          $h3({ className: "slider-showcase-heading" }, "5. Vertical Orientation"),
          $div({ className: "slider-vertical-container" }, [
            Slider({
              id: "eq-bass",
              label: "Bass",
              valueLabel: true,
              defaultValue: 70,
              orientation: "vertical",
            }),
            Slider({
              id: "eq-mid",
              label: "Mid",
              valueLabel: true,
              defaultValue: 50,
              orientation: "vertical",
            }),
            Slider({
              id: "eq-treble",
              label: "Treble",
              valueLabel: true,
              defaultValue: 85,
              orientation: "vertical",
            }),
            Slider({
              id: "eq-disabled",
              label: "Aux",
              valueLabel: true,
              defaultValue: 30,
              disabled: true,
              orientation: "vertical",
            }),
          ]),
        ]),
      ]),
    ]),

    // Usage Examples
    $div({ className: "usage-box" }, [
      $h3({ className: "usage-title" }, "Usage Examples"),

      $p({ className: "usage-subtitle" }, "1. All-in-One Component (Tier 1)"),
      CodeBlock(`import { Slider } from "@fimbul-works/seidr-ui";

// Basic single-thumb slider
Slider({
  label: "Volume",
  valueLabel: true,
  defaultValue: 65,
  description: "Adjust audio output",
});

// Dual-thumb range slider
Slider({
  label: "Price Filter",
  valueLabel: true,
  defaultValue: [25, 75],
  thumbs: 2,
  minStepsBetweenThumbs: 5,
  getValueLabel: ({ values }) => \`$\${values[0]} – $\${values[1]}\`,
});`),

      $p({ className: "usage-subtitle" }, "2. Fine-Grained Coordinator (Tier 2)"),
      CodeBlock(`import { createSlider } from "@fimbul-works/seidr-ui";

const slider = createSlider({
  defaultValue: 50,
  step: 5,
  onChange: (vals) => console.log("Current values:", vals),
});

// Compose custom structure
slider.Root({}, [
  slider.Label({}, "Brightness"),
  slider.ValueLabel({}, slider.values.as((v) => \`\${v[0]}%\`)),
  slider.Track({}, [
    slider.Fill({}),
    slider.Thumb({ index: 0 }),
    slider.Input({ index: 0 }),
  ]),
  slider.Description({}, "Adjust display intensity"),
]);`),
    ]),
  ]);
}, "SliderShowcase");
