import { useDialog } from "../dialog/use-dialog.js";
import type { UseAlertDialogProps, UseAlertDialogResult } from "./types.js";

/**
 * Headless reactive coordinator for AlertDialog components.
 * Configures `closeOnOutsideClick: false` by default for confirmation safety.
 */
export function useAlertDialog(props: UseAlertDialogProps = {}): UseAlertDialogResult {
  const { closeOnOutsideClick = false, ...rest } = props;
  return useDialog({
    closeOnOutsideClick,
    ...rest,
  });
}

