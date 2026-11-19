import { isTruthy } from "@fimbul-works/hvat";
import {
  type DerivedValue,
  isValue,
  mergeValues,
  type ObservableValue,
  type ReactiveValue,
  unwrapValue,
} from "@fimbul-works/seidr";

export type ARIAValue = ReactiveValue<string> | ReactiveValue<string | undefined>;

export interface ExtractedARIAProps {
  /** Normalized aria-label value. */
  ariaLabel?: ARIAValue;
  /** Normalized aria-labelledby value. */
  ariaLabelledBy?: ARIAValue;
  /** Normalized aria-describedby value. */
  ariaDescribedBy?: ARIAValue;
  /** Normalized aria-errormessage value. */
  ariaErrorMessage?: ARIAValue;
}

export type ARIAPropKeys =
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

export type ARIAPropsTuple<T> = [aria: ExtractedARIAProps, rest: Omit<T, ARIAPropKeys>];

/**
 * Extracts and normalizes ARIA labeling and description props across all naming casing
 * variants (kebab-case, camelCase, lowercase), returning a tuple [ariaProps, restProps]
 * so no ARIA keys leak into the clean rest props.
 */
export function extractARIAProps<T extends Record<string, any>>(props: T = {} as T): ARIAPropsTuple<T> {
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
    "aria-label"?: ARIAValue;
    ariaLabel?: ARIAValue;
    "aria-labelledby"?: ARIAValue;
    ariaLabelledby?: ARIAValue;
    ariaLabelledBy?: ARIAValue;
    "aria-describedby"?: ARIAValue;
    ariaDescribedby?: ARIAValue;
    ariaDescribedBy?: ARIAValue;
    "aria-errormessage"?: ARIAValue;
    ariaErrormessage?: ARIAValue;
    ariaErrorMessage?: ARIAValue;
  };

  const extracted: ExtractedARIAProps = {
    ariaLabel: ariaLabelKebab ?? ariaLabel,
    ariaLabelledBy: ariaLabelledByKebab ?? ariaLabelledByCamel ?? ariaLabelledByLower,
    ariaDescribedBy: ariaDescribedByKebab ?? ariaDescribedByCamel ?? ariaDescribedByLower,
    ariaErrorMessage: ariaErrorMessageKebab ?? ariaErrorMessageCamel ?? ariaErrorMessageLower,
  };

  return [extracted, rest as Omit<T, ARIAPropKeys>];
}

export interface CombineARIALabelledByOptions {
  /** User-provided or explicit aria-labelledby (reactive or scalar). */
  ariaLabelledBy?: ARIAValue;
  /** User-provided or explicit aria-label (reactive or scalar). */
  ariaLabel?: ARIAValue;
  /** Internal component or form control label ID (reactive or scalar). */
  internalLabelId?: ARIAValue;
  /** Associated field ID (reactive or scalar), attached if both custom aria-labelledby and aria-label are present. */
  fieldId?: ARIAValue;
}

/**
 * Reactively combines user-provided `aria-labelledby`, internal label IDs, and the field ID
 * following WAI-ARIA and Kobalte accessibility contracts.
 */
export function combineARIALabelledBy(options: CombineARIALabelledByOptions): DerivedValue<string | undefined> {
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

export interface CombineARIADescribedByOptions {
  /** User-provided or explicit aria-describedby (reactive or scalar). */
  ariaDescribedBy?: ARIAValue;
  /** Internal component or form control describedBy ID list (reactive or scalar). */
  internalDescribedBy?: ARIAValue;
}

/**
 * Reactively combines internal describedby IDs (descriptions and error messages) with user-provided
 * `aria-describedby` IDs into a space-separated attribute string.
 */
export function combineARIADescribedBy(options: CombineARIADescribedByOptions): DerivedValue<string | undefined> {
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
