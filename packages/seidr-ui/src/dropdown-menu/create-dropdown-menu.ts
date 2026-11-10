import { useId } from "@fimbul-works/seidr";
import { DATA_COMPONENT_DROPDOWN_MENU } from "../constants.js";
import { createMenu } from "../menu/create-menu.js";
import type { DropdownMenuInstance, UseDropdownMenuOptions } from "./types.js";

/**
 * Creates a headless coordinator for a DropdownMenu (Tier 2).
 * Returns pre-bound element helpers with `dataComponent="dropdown-menu"` and reactive observables.
 */
export function createDropdownMenu(options: UseDropdownMenuOptions = {}): DropdownMenuInstance {
  const { id = useId("dropdownmenu"), dataComponent = DATA_COMPONENT_DROPDOWN_MENU, ...rest } = options;
  return createMenu({
    id,
    dataComponent,
    ...rest,
  });
}
