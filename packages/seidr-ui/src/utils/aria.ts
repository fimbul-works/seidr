import { isTruthy } from "@fimbul-works/hvat";
import {
  type DerivedValue,
  isValue,
  mergeValues,
  type ObservableValue,
  type ReactiveValue,
  unwrapValue,
} from "@fimbul-works/seidr";

export type AriaValue = ReactiveValue<string> | ReactiveValue<string | undefined>;

export interface ExtractedAriaProps {
  /** Normalized aria-label value. */
  ariaLabel?: AriaValue;
  /** Normalized aria-labelledby value. */
  ariaLabelledBy?: AriaValue;
  /** Normalized aria-describedby value. */
  ariaDescribedBy?: AriaValue;
  /** Normalized aria-errormessage value. */
  ariaErrorMessage?: AriaValue;
}

export type AriaPropKeys =
  | "aria-label"
  | "ariaLabel"
  | "aria-labelledby"
  | "ariaLabelledby"
  | "ariaLabelledBy"
  | "aria-describedby"
  | "ariaDescribedby"
  | "ariaDescribedBy"
  | "aria-errormessage"
  | "ariaErrormessage"
  | "ariaErrorMessage";

export type AriaPropsTuple<T> = [aria: ExtractedAriaProps, rest: Omit<T, AriaPropKeys>];

/**
 * Extracts and normalizes ARIA labeling and description props across all naming casing
 * variants (kebab-case, camelCase, lowercase), returning a tuple [ariaProps, restProps]
 * so no ARIA keys leak into the clean rest props.
 */
export function extractAriaProps<T extends Record<string, any>>(props: T = {} as T): AriaPropsTuple<T> {
  const {
    "aria-label": ariaLabelKebab,
    ariaLabel,
    "aria-labelledby": ariaLabelledByKebab,
    ariaLabelledby: ariaLabelledByLower,
    ariaLabelledBy: ariaLabelledByCamel,
    "aria-describedby": ariaDescribedByKebab,
    ariaDescribedby: ariaDescribedByLower,
    ariaDescribedBy: ariaDescribedByCamel,
    "aria-errormessage": ariaErrorMessageKebab,
    ariaErrormessage: ariaErrorMessageLower,
    ariaErrorMessage: ariaErrorMessageCamel,
    ...rest
  } = props as T & {
    "aria-label"?: AriaValue;
    ariaLabel?: AriaValue;
    "aria-labelledby"?: AriaValue;
    ariaLabelledby?: AriaValue;
    ariaLabelledBy?: AriaValue;
    "aria-describedby"?: AriaValue;
    ariaDescribedby?: AriaValue;
    ariaDescribedBy?: AriaValue;
    "aria-errormessage"?: AriaValue;
    ariaErrormessage?: AriaValue;
    ariaErrorMessage?: AriaValue;
  };

  const extracted: ExtractedAriaProps = {
    ariaLabel: ariaLabelKebab ?? ariaLabel,
    ariaLabelledBy: ariaLabelledByKebab ?? ariaLabelledByCamel ?? ariaLabelledByLower,
    ariaDescribedBy: ariaDescribedByKebab ?? ariaDescribedByCamel ?? ariaDescribedByLower,
    ariaErrorMessage: ariaErrorMessageKebab ?? ariaErrorMessageCamel ?? ariaErrorMessageLower,
  };

  return [extracted, rest as Omit<T, AriaPropKeys>];
}

export interface CombineAriaLabelledByOptions {
  /** User-provided or explicit aria-labelledby (reactive or scalar). */
  ariaLabelledBy?: AriaValue;
  /** User-provided or explicit aria-label (reactive or scalar). */
  ariaLabel?: AriaValue;
  /** Internal component or form control label ID (reactive or scalar). */
  internalLabelId?: AriaValue;
  /** Associated field ID (reactive or scalar), attached if both custom aria-labelledby and aria-label are present. */
  fieldId?: AriaValue;
}

/**
 * Reactively combines user-provided `aria-labelledby`, internal label IDs, and the field ID
 * following WAI-ARIA and Kobalte accessibility contracts.
 */
export function combineAriaLabelledBy(options: CombineAriaLabelledByOptions): DerivedValue<string | undefined> {
  const { ariaLabelledBy, ariaLabel, internalLabelId, fieldId } = options;

  return mergeValues(
    () => {
      const customLabelledBy = unwrapValue(ariaLabelledBy);
      const explicitLabel = unwrapValue(ariaLabel);
      const registeredLabelId = unwrapValue(internalLabelId);
      const inputId = unwrapValue(fieldId);

      const parts = [
        customLabelledBy,
        registeredLabelId,
        customLabelledBy && explicitLabel != null ? inputId : undefined,
      ].filter(isTruthy);

      return parts.length > 0 ? parts.join(" ") : undefined;
    },
    {
      parents: [ariaLabelledBy, ariaLabel, internalLabelId, fieldId].filter((p): p is ObservableValue<any> =>
        isValue(p),
      ),
    },
  );
}

export interface CombineAriaDescribedByOptions {
  /** User-provided or explicit aria-describedby (reactive or scalar). */
  ariaDescribedBy?: AriaValue;
  /** Internal component or form control describedBy ID list (reactive or scalar). */
  internalDescribedBy?: AriaValue;
}

/**
 * Reactively combines internal describedby IDs (descriptions and error messages) with user-provided
 * `aria-describedby` IDs into a space-separated attribute string.
 */
export function combineAriaDescribedBy(options: CombineAriaDescribedByOptions): DerivedValue<string | undefined> {
  const { ariaDescribedBy, internalDescribedBy } = options;

  return mergeValues(
    () => {
      const customDescribedBy = unwrapValue(ariaDescribedBy);
      const formDescribedBy = unwrapValue(internalDescribedBy);

      const parts = [formDescribedBy, customDescribedBy].filter(isTruthy);

      return parts.length > 0 ? parts.join(" ") : undefined;
    },
    {
      parents: [ariaDescribedBy, internalDescribedBy].filter((p): p is ObservableValue<any> => isValue(p)),
    },
  );
}
