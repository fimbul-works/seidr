import { createComponent, type SeidrChild } from "@fimbul-works/seidr";
import { createSwitch } from "./create-switch.js";
import { type SwitchControlProps } from "./switch-control.js";
import { type SwitchDescriptionProps } from "./switch-description.js";
import { type SwitchErrorMessageProps } from "./switch-error-message.js";
import { type SwitchInputProps } from "./switch-input.js";
import { type SwitchLabelProps } from "./switch-label.js";
import { type SwitchRootProps } from "./switch-root.js";
import { type SwitchThumbProps } from "./switch-thumb.js";
import type { UseSwitchOptions } from "./types.js";

export interface SwitchProps extends UseSwitchOptions {
  /** Optional class name for the root container. */
  className?: string;

  /** Accessible label text or element. */
  label?: SeidrChild | SeidrChild[];

  /** Optional description text or element. */
  description?: SeidrChild | SeidrChild[];

  /** Optional error message text or element. */
  errorMessage?: SeidrChild | SeidrChild[];

  /** Optional custom thumb element or content. */
  thumb?: SeidrChild | SeidrChild[];

  /** Props passed to Switch.Root. */
  rootProps?: SwitchRootProps;

  /** Props passed to Switch.Input. */
  inputProps?: SwitchInputProps;

  /** Props passed to Switch.Control. */
  controlProps?: SwitchControlProps;

  /** Props passed to Switch.Thumb. */
  thumbProps?: SwitchThumbProps;

  /** Props passed to Switch.Label. */
  labelProps?: SwitchLabelProps;

  /** Props passed to Switch.Description. */
  descriptionProps?: SwitchDescriptionProps;

  /** Props passed to Switch.ErrorMessage. */
  errorMessageProps?: SwitchErrorMessageProps;
}

/**
 * Unified all-in-one Switch component.
 * Creates an accessible switch with full WAI-ARIA and form-control integration in one call.
 */
export const Switch = createComponent((props: SwitchProps = {}) => {
  const {
    className,
    label,
    description,
    errorMessage,
    thumb,
    rootProps = {},
    inputProps = {},
    controlProps = {},
    thumbProps = {},
    labelProps = {},
    descriptionProps = {},
    errorMessageProps = {},
    ...switchOptions
  } = props;

  const sw = createSwitch(switchOptions);

  return sw.Root({ className, ...rootProps } as SwitchRootProps, [
    sw.Input(inputProps),
    sw.Control(controlProps, sw.Thumb(thumbProps, thumb)),
    label ? sw.Label(labelProps, label) : null,
    description ? sw.Description(descriptionProps, description) : null,
    errorMessage ? sw.ErrorMessage(errorMessageProps, errorMessage) : null,
  ]);
}, "Switch");

