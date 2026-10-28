import { createComponent, createValue } from "@fimbul-works/seidr";
import { $button, $div, $h2, $p, $section, $span, $strong } from "@fimbul-works/seidr/html";
import { RadioGroup, type RadioGroupItemDescriptor } from "@fimbul-works/seidr-ui";
import { CodeBlock } from "../components/code-block.js";
import "./radio-group.css";

export const RadioGroupShowcase = createComponent(() => {
  // --- Global Interactive Controls ---
  const isDisabled = createValue(false);
  const isHorizontal = createValue(false);

  // --- Section 2: Controlled Radio Group ---
  const selectedFramework = createValue("reactive");
  const frameworkDescriptions: Record<string, string> = {
    reactive: "⚡ Fine-grained direct signal bindings without Virtual DOM diffing overhead.",
    isomorphic: "🌐 Seamless dual-mode execution with isomorphic client/server hydration.",
    compact: "📦 Ultra-lightweight runtime bundles with strict tree-shaking.",
  };

  // --- Section 3: Compound Pre-bound Pattern & Validation ---
  const shippingMethod = createValue("");
  const shippingValidation = shippingMethod.as((val) => (val ? "valid" : "invalid"));

  const shippingGroup = RadioGroup.create({
    id: "shipping-radio-group",
    value: shippingMethod,
    disabled: isDisabled,
    onChange: (val: string) => shippingMethod(val),
    required: true,
    validationState: shippingValidation,
  });

  const standardItem = shippingGroup.createItem({ value: "standard" });
  const expressItem = shippingGroup.createItem({ value: "express" });
  const overnightItem = shippingGroup.createItem({ value: "overnight" });

  // --- Section 4: Dynamic Items (Fine-Grained List Reactivity) ---
  const initialDynamicItems: RadioGroupItemDescriptor[] = [
    { value: "us-east", label: "US East (N. Virginia)", description: "Lowest latency for North America." },
    { value: "eu-central", label: "EU Central (Frankfurt)", description: "Compliant with EU GDPR regulations." },
    { value: "ap-southeast", label: "AP Southeast (Singapore)", description: "Optimized for Asia-Pacific traffic." },
  ];
  const dynamicItems = createValue<RadioGroupItemDescriptor[]>(initialDynamicItems);

  const addRegion = () => {
    const current = dynamicItems();
    if (current.length >= 5) return;
    const newRegion: RadioGroupItemDescriptor = {
      value: `region-${current.length + 1}`,
      label: `Edge Node ${current.length + 1} (Sydney)`,
      description: "Low-latency point-of-presence server.",
    };
    dynamicItems([...current, newRegion]);
  };

  const removeRegion = () => {
    const current = dynamicItems();
    if (current.length <= 1) return;
    dynamicItems(current.slice(0, current.length - 1));
  };

  return $section({ className: "card" }, [
    $div({ className: "card-header" }, [
      $h2({ className: "card-title" }, "RadioGroup"),
      $span({ className: "card-badge" }, "Form"),
    ]),
    $p(
      { className: "card-desc" },
      "Accessible single-selection group with WAI-ARIA role='radiogroup', roving tabindex, arrow key navigation, orientation support, and seamless FormControl validation.",
    ),

    // Live Preview
    $div({ className: "preview-box" }, [
      $div({ className: "controls-row" }, [
        $button(
          {
            className: isDisabled.as((d) => `control-btn ${d ? "active" : ""}`),
            onclick: () => isDisabled(!isDisabled()),
          },
          isDisabled.as((d) => (d ? "Enable All Groups" : "Disable All Groups")),
        ),
        $button(
          {
            className: isHorizontal.as((h) => `control-btn ${h ? "active" : ""}`),
            onclick: () => isHorizontal(!isHorizontal()),
          },
          isHorizontal.as((h) => (h ? "Switch to Vertical" : "Switch to Horizontal")),
        ),
      ]),

      $div({ className: "radio-group-showcase" }, [
        // 1. All-in-One Unified Helper (Card Style)
        $div({ className: "radio-group-demo" }, [
          $div({ className: "radio-group-section-title" }, "1. Unified Helper (Subscription Plans)"),
          RadioGroup({
            className: isHorizontal.as((h) => `radio-group-root ${h ? "horizontal" : ""}`),
            disabled: isDisabled,
            defaultValue: "pro",
            label: "Select Your Plan",
            labelProps: { className: "radio-group-label" },
            description: "Choose the computing tier that fits your team's deployment needs.",
            descriptionProps: { className: "radio-group-description" },
            items: [
              {
                value: "starter",
                itemProps: { className: "radio-item-card" },
                inputProps: { className: "radio-item-input" },
                controlProps: { className: "radio-control" },
                indicatorProps: { className: "radio-indicator" },
                contentProps: { className: "radio-item-content" },
                labelProps: { className: "radio-item-label" },
                descriptionProps: { className: "radio-item-desc" },
                label: "Starter",
                description: "Up to 3 projects, community support, shared compute cores.",
              },
              {
                value: "pro",
                itemProps: { className: "radio-item-card" },
                inputProps: { className: "radio-item-input" },
                controlProps: { className: "radio-control" },
                indicatorProps: { className: "radio-indicator" },
                contentProps: { className: "radio-item-content" },
                labelProps: { className: "radio-item-label" },
                descriptionProps: { className: "radio-item-desc" },
                label: "Professional",
                description: "Unlimited projects, dedicated compute, priority email & chat support.",
              },
              {
                value: "enterprise",
                itemProps: { className: "radio-item-card" },
                inputProps: { className: "radio-item-input" },
                controlProps: { className: "radio-control" },
                indicatorProps: { className: "radio-indicator" },
                contentProps: { className: "radio-item-content" },
                labelProps: { className: "radio-item-label" },
                descriptionProps: { className: "radio-item-desc" },
                label: "Enterprise",
                description: "Custom SLA, dedicated edge infrastructure, audit logging, and SSO.",
              },
            ],
          }),
        ]),

        // 2. Controlled RadioGroup with Reactive Selection & Real-Time Feedback
        $div({ className: "radio-group-demo" }, [
          $div({ className: "radio-group-section-title" }, "2. Controlled State & Reactive Feedback"),
          $div({ className: isDisabled.as((disabled) => (disabled ? "disabled " : "") + "radio-selection-banner") }, [
            $span(["Active Strategy: ", $strong(selectedFramework.as((s) => s.toUpperCase()))]),
            $span(selectedFramework.as((s) => frameworkDescriptions[s] ?? "")),
          ]),
          RadioGroup({
            className: "radio-group-root",
            orientation: "horizontal",
            value: selectedFramework,
            disabled: isDisabled,
            onChange: (val: string) => selectedFramework(val),
            label: "Architectural Focus",
            labelProps: { className: "radio-group-label" },
            items: [
              {
                value: "reactive",
                itemProps: { className: "radio-item-row" },
                inputProps: { className: "radio-item-input" },
                controlProps: { className: "radio-control" },
                indicatorProps: { className: "radio-indicator" },
                labelProps: { className: "radio-item-label" },
                label: "Fine-Grained Reactivity",
              },
              {
                value: "isomorphic",
                itemProps: { className: "radio-item-row" },
                inputProps: { className: "radio-item-input" },
                controlProps: { className: "radio-control" },
                indicatorProps: { className: "radio-indicator" },
                labelProps: { className: "radio-item-label" },
                label: "Isomorphic SSR",
              },
              {
                value: "compact",
                itemProps: { className: "radio-item-row" },
                inputProps: { className: "radio-item-input" },
                controlProps: { className: "radio-control" },
                indicatorProps: { className: "radio-indicator" },
                labelProps: { className: "radio-item-label" },
                label: "Minimal Bundle Overhead",
              },
            ],
          }),
        ]),

        // 3. Pre-bound Compound Pattern with Validation
        $div({ className: "radio-group-demo" }, [
          $div({ className: "radio-group-section-title" }, "3. Compound Elements & Required Validation"),
          shippingGroup.Root(
            {
              className: isHorizontal.as((h) => `radio-group-root ${h ? "horizontal" : ""}`),
            },
            [
              shippingGroup.Label({ className: "radio-group-label" }, "Delivery Method *"),
              shippingGroup.Description(
                { className: "radio-group-description" },
                "Select a delivery option to calculate estimated arrival and shipping costs.",
              ),
              shippingGroup.ErrorMessage(
                { className: "radio-group-error" },
                "⚠️ A delivery method is required before checkout can proceed.",
              ),

              // Item 1: Standard
              standardItem.Root({ className: "radio-item-card" }, [
                standardItem.Input({ className: "radio-item-input" }),
                standardItem.Control({ className: "radio-control" }, [
                  standardItem.Indicator({ className: "radio-indicator" }),
                ]),
                $div({ className: "radio-item-content" }, [
                  standardItem.Label({ className: "radio-item-label" }, "Standard Ground (3-5 days)"),
                  standardItem.Description({ className: "radio-item-desc" }, "Delivered via postal service. Free."),
                ]),
                $span({ className: "radio-item-meta" }, "Free"),
              ]),

              // Item 2: Express
              expressItem.Root({ className: "radio-item-card" }, [
                expressItem.Input({ className: "radio-item-input" }),
                expressItem.Control({ className: "radio-control" }, [
                  expressItem.Indicator({ className: "radio-indicator" }),
                ]),
                $div({ className: "radio-item-content" }, [
                  expressItem.Label({ className: "radio-item-label" }, "Express Courier (1-2 days)"),
                  expressItem.Description(
                    { className: "radio-item-desc" },
                    "Guaranteed delivery with door-to-door tracking.",
                  ),
                ]),
                $span({ className: "radio-item-meta" }, "$9.99"),
              ]),

              // Item 3: Priority Overnight
              overnightItem.Root({ className: "radio-item-card" }, [
                overnightItem.Input({ className: "radio-item-input" }),
                overnightItem.Control({ className: "radio-control" }, [
                  overnightItem.Indicator({ className: "radio-indicator" }),
                ]),
                $div({ className: "radio-item-content" }, [
                  overnightItem.Label({ className: "radio-item-label" }, "Priority Overnight"),
                  overnightItem.Description({ className: "radio-item-desc" }, "Next business day morning delivery."),
                ]),
                $span({ className: "radio-item-meta" }, "$24.99"),
              ]),
            ],
          ),
        ]),

        // 4. Dynamic Radio Group via List Reactivity
        $div({ className: "radio-group-demo" }, [
          $div({ className: "radio-group-section-title" }, "4. Dynamic Radio Group (Reactive List)"),
          $div({ className: "controls-row" }, [
            $button(
              {
                className: "control-btn",
                onclick: addRegion,
              },
              "+ Add Region",
            ),
            $button(
              {
                className: "control-btn",
                onclick: removeRegion,
              },
              "– Remove Region",
            ),
          ]),
          RadioGroup({
            className: isHorizontal.as((h) => `radio-group-root ${h ? "horizontal" : ""}`),
            disabled: isDisabled,
            defaultValue: "us-east",
            label: "Deployment Regions",
            labelProps: { className: "radio-group-label" },
            description: "Dynamic options collection driven by Seidr's fine-grained List observable.",
            descriptionProps: { className: "radio-group-description" },
            items: dynamicItems.as((items) =>
              items.map((item) => ({
                ...item,
                itemProps: { className: "radio-item-card" },
                inputProps: { className: "radio-item-input" },
                controlProps: { className: "radio-control" },
                indicatorProps: { className: "radio-indicator" },
                contentProps: { className: "radio-item-content" },
                labelProps: { className: "radio-item-label" },
                descriptionProps: { className: "radio-item-desc" },
              })),
            ),
          }),
        ]),
      ]),
    ]),

    CodeBlock(
      `import { RadioGroup } from "@fimbul-works/seidr-ui";

// 1. All-in-one unified usage with item descriptors
RadioGroup({
  defaultValue: "pro",
  label: "Select Your Plan",
  description: "Choose your computing tier.",
  items: [
    { value: "starter", label: "Starter", description: "Shared cores." },
    { value: "pro", label: "Professional", description: "Dedicated compute." },
    { value: "enterprise", label: "Enterprise", description: "Custom SLA & SSO." },
  ],
});

// 2. Pre-bound compound usage with reactive validation
const rg = RadioGroup.create({
  value: selectedMethod,
  onChange: (val) => selectedMethod(val),
  required: true,
  validationState: selectedMethod.as(v => v ? "valid" : "invalid"),
});

const item = rg.createItem({ value: "standard" });

rg.Root([
  rg.Label("Delivery Method *"),
  rg.Description("Select a shipping tier."),
  rg.ErrorMessage("A delivery method is required."),
  item.Root({ className: "radio-item-card" }, [
    item.Input(),
    item.Control([item.Indicator()]),
    item.Label("Standard Ground"),
  ]),
]);`,
    ),
  ]);
}, "RadioGroupShowcase");
