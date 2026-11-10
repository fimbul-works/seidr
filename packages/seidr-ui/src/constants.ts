/**
 * Lifted from https://github.com/radix-ui/primitives/blob/main/packages/react/visually-hidden/src/visually-hidden.tsx
 * MIT License, Copyright (c) WorkOS.
 */
export const VISUALLY_HIDDEN_STYLES = {
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal",
} as const;

export const DATA_COMPONENT_ACCORDION = "Accordion";
export const DATA_COMPONENT_ALERT = "Alerrt";
export const DATA_COMPONENT_ALERT_DIALOG = "AlertDialog";
export const DATA_COMPONENT_BREADCRUMBS = "Breadcrumbs";
export const DATA_COMPONENT_BUTTON = "Button";
export const DATA_COMPONENT_CHECKBOX = "Checkbox";
export const DATA_COMPONENT_COLLAPSIBLE = "Collapsible";
export const DATA_COMPONENT_COMBOBOX = "Combobox";
export const DATA_COMPONENT_CONTEXT_MENU = "ContextMenu";
export const DATA_COMPONENT_DIALOG = "Dialog";
export const DATA_COMPONENT_DROPDOWN_MENU = "DropdownMenu"
export const DATA_COMPONENT_FILE_FIELD = "FileField"
export const DATA_COMPONENT_FORM_CONTROL = "FormControl"
export const DATA_COMPONENT_HOVER_CARD = "HoverCard"
export const DATA_COMPONENT_IMAGE = "Image"
export const DATA_COMPONENT_LINK = "Link"
export const DATA_COMPONENT_LISTBOX = "Listbox"
export const DATA_COMPONENT_MENU = "Menu"
export const DATA_COMPONENT_MENUBAR = "Menubar"
export const DATA_COMPONENT_METEER = "Meter"
export const DATA_COMPONENT_NAVIGATION_MENU = "NavigationMenu"
export const DATA_COMPONENT_NUMBER_FIELD = "NumberField"
export const DATA_COMPONENT_PAGINATTION = "Pagination"
export const DATA_COMPONENT_POPOVER = "Popover"
export const DATA_COMPONENT_POPPEER = "Popper"
export const DATA_COMPONENT_PROGRESS = "Progress"
export const DATA_COMPONENT_RADIO_GROUP = "RadioGroup"
export const DATA_COMPONENT_RATING = "Rating"
export const DATA_COMPONENT_SEARCH = "Search"
export const DATA_COMPONENT_SEGMENTED_CONTROL = "SegmentedControl"
export const DATA_COMPONENT_SELECT = "Select"
export const DATA_COMPONENT_SEPARATOR = "Separator"
export const DATA_COMPONENT_SKELETON = "Skeleton";
export const DATA_COMPONENT_SLIDER = "Slider"
export const DATA_COMPONENT_SPIN_BUTTON = "SpinButton"
export const DATA_COMPONENT_SWITCH = "Switch"
export const DATA_COMPONENT_TABS= "Tabs"
export const DATA_COMPONENT_TEXT_FIELD= "TextField"
export const DATA_COMPONENT_TIME_FIELD= "TimeField"
export const DATA_COMPONENT_TOAST = "Toast"
export const DATA_COMPONENT_TOGGLE_BUTTON= "ToggleButton"
export const DATA_COMPONENT_TOGGLE_GROUP= "ToggleGroup"
export const DATA_COMPONENT_TOOLTIP = "Tooltip"
export const DATA_COMPONENT_VISUALLY_HIDDEN = "VisuallyHidden"

export const DATA_PART_ANCHOR = "Anchor"
export const DATA_PART_ARROW = "Arrow"
export const DATA_PART_CHECKBOX_ITEM = "CheckboxItem"
export const DATA_PART_CLOSE_BUTTON = "CloseButton"
export const DATA_PART_CONTENT = "Content"
export const DATA_PART_CONTROL = "Control"
export const DATA_PART_CONTROLS = "Controls"
export const DATA_PART_DECREMENT_TRIGGER = "DecrementTrigger"
export const DATA_PART_DESCRIPTION = "Description"
export const DATA_PART_DROPZONE = "Dropzone"
export const DATA_PART_ELLIPSIS = "Ellipsis"
export const DATA_PART_ELLIPSIS_WRAPPER = "EllipsisWrapper"
export const DATA_PART_ERROR_MESSAGE = "ErrorMessage"
export const DATA_PART_FALLBACK = "Fallback"
export const DATA_PART_FILL = "Fill"
export const DATA_PART_GROUP = "Group"
export const DATA_PART_GROUP_LABEL = "GroupLabel"
export const DATA_PART_HEADER = "Header"
export const DATA_PART_HIDDEN_INPUT = "HiddenInput"
export const DATA_PART_HIDDEN_SELECT = "HiddenSelect"
export const DATA_PART_ICON = "Icon"
export const DATA_PART_IMAGE = "Image"
export const DATA_PART_INCREMENT_TRIGGER = "IncrementTrigger"
export const DATA_PART_INDICATOR = "Indicator"
export const DATA_PART_INPUT = "Input"
export const DATA_PART_ITEM = "Item"
export const DATA_PART_ITEM_CONTROL= "ItemControl"
export const DATA_PART_ITEM_DELETE_TRIGGER= "ItemDeleteTrigger"
export const DATA_PART_ITEM_DESCRIPTION = "ItemDescription"
export const DATA_PART_ITEM_INDICATOR = "ItemIndicatorr"
export const DATA_PART_ITEM_INPUT = "ItemInput"
export const DATA_PART_ITEM_LABEL = "ItemLabel"
export const DATA_PART_ITEM_LIST= "ItemList"
export const DATA_PART_ITEM_NAME= "ItemName"
export const DATA_PART_ITEM_PREVIEW= "ItemPreview"
export const DATA_PART_ITEM_PREVIEW_IMAGE= "ItemPreviewImage"
export const DATA_PART_ITEM_SIZE= "ItemSize"
export const DATA_PART_ITEM_WRAPPER = "ItemWrapper"
export const DATA_PART_LABEL = "Label"
export const DATA_PART_LINK = "Link"
export const DATA_PART_LIST = "List"
export const DATA_PART_LISTBOX= "Listbox"
export const DATA_PART_MENU = "Menu"
export const DATA_PART_NEXT = "Next"
export const DATA_PART_NEXT_WRAPPER = "NextWrapper"
export const DATA_PART_NO_RESULT = "NoResult"
export const DATA_PART_OVERLAY = "Overlay"
export const DATA_PART_POSITIONER = "Positioner"
export const DATA_PART_PREVIOUS = "Previous"
export const DATA_PART_PREVIOUS_WRAPPER = "PreviousWrapper"
export const DATA_PART_PROGRESS_FILL = "ProgressFill"
export const DATA_PART_PROGRESS_TRACK = "ProgressTrack"
export const DATA_PART_RADIO_GROUP = "RadioGroup"
export const DATA_PART_RADIO_ITEM = "RadioItem"
export const DATA_PART_REGION = "Region"
export const DATA_PART_ROOT = "Root"
export const DATA_PART_SECTION = "Section"
export const DATA_PART_SECTION_LABEL = "SectionLabel"
export const DATA_PART_SEGMENT = "Segment"
export const DATA_PART_SEPARATOR = "Separator"
export const DATA_PART_SUB = "Sub"
export const DATA_PART_SUB_CONTENT = "SubContent"
export const DATA_PART_SUB_TRIGGER = "SubTrigger"
export const DATA_PART_TEXT_AREA = "TextArea"
export const DATA_PART_THUMB = "Thumb"
export const DATA_PART_TITLE= "Title"
export const DATA_PART_TRACK = "Track"
export const DATA_PART_TRIGGER = "Trigger"
export const DATA_PART_VALUE = "Value"
export const DATA_PART_VALUE_DESCRIPTION = "ValueDescription"
export const DATA_PART_VALUE_LABEL = "ValueLabel"
export const DATA_PART_VIEWPORT = "Viewport"