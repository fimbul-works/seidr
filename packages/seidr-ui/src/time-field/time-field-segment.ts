import { isFn } from "@fimbul-works/hvat";
import {
  $,
  createRef,
  mergeStyleProps,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import { DATA_COMPONENT_TIME_FIELD, DATA_PART_SEGMENT } from "../constants.js";
import type { TimeFieldSegmentProps } from "./types.js";
import { PAGE_STEP } from "./util.js";

/**
 * Interactive segment token (hours, minutes, seconds, AM/PM) adhering to the WAI-ARIA SpinButton pattern.
 */
export function TimeFieldSegment<T extends keyof SeidrElementTagNameMap = "div">(
  props: TimeFieldSegmentProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    segment,
    instance,
    dataComponent = DATA_COMPONENT_TIME_FIELD,
    ref: userRef,
    onclick: userOnClick,
    onkeydown: userOnKeyDown,
    onbeforeinput: userOnBeforeInput,
    style: userStyle,
    children: propsChildren,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("TimeFieldSegment requires an instance coordinator");
  }

  const internalRef = createRef<SeidrElementTagNameMap[T]>();

  internalRef.bind((el) => {
    if (userRef && el && isFn(userRef)) {
      Reflect.apply(userRef, null, [el]);
    }
    instance.registerSegmentRef(segment, el as HTMLElement | null);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFn(userOnKeyDown)) {
      Reflect.apply(userOnKeyDown, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (instance.isDisabled() || instance.isReadOnly()) return;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        instance.adjustSegment(segment, 1);
        break;
      case "ArrowDown":
        e.preventDefault();
        instance.adjustSegment(segment, -1);
        break;
      case "PageUp":
        e.preventDefault();
        instance.adjustSegment(segment, segment === "dayPeriod" ? 1 : PAGE_STEP[segment]);
        break;
      case "PageDown":
        e.preventDefault();
        instance.adjustSegment(segment, segment === "dayPeriod" ? -1 : -PAGE_STEP[segment]);
        break;
      case "Home":
        e.preventDefault();
        instance.setSegmentMin(segment);
        break;
      case "End":
        e.preventDefault();
        instance.setSegmentMax(segment);
        break;
      case "Backspace":
      case "Delete":
        e.preventDefault();
        instance.handleSegmentBackspace(segment);
        break;
      default:
        if (e.key.length === 1) {
          const handled = instance.handleSegmentKeyInput(segment, e.key);
          if (handled) {
            e.preventDefault();
          }
        }
        break;
    }
  };

  const handleBeforeInput = (e: InputEvent) => {
    if (isFn(userOnBeforeInput)) {
      Reflect.apply(userOnBeforeInput, e.currentTarget, [e]);
    }
    if (e.defaultPrevented) return;

    e.preventDefault();
    if (instance.isDisabled() || instance.isReadOnly()) return;
    if (e.data != null) {
      instance.handleSegmentKeyInput(segment, e.data);
    }
  };

  const ariaValuemin =
    segment === "dayPeriod" ? undefined : instance.hourCycle.as((c) => (segment === "hour" && c === 12 ? 1 : 0));
  const ariaValuemax =
    segment === "dayPeriod"
      ? undefined
      : instance.hourCycle.as((c) => (segment === "hour" ? (c === 12 ? 12 : 23) : 59));

  const baseStyle: Record<string, string> = {
    caretColor: "transparent",
    outline: "none",
  };

  const resolvedChildren: (SeidrChild | undefined)[] = [];
  if (children) {
    if (Array.isArray(children)) resolvedChildren.push(...children);
    else resolvedChildren.push(children);
  }
  if (propsChildren) {
    if (Array.isArray(propsChildren)) resolvedChildren.push(...propsChildren);
    else resolvedChildren.push(propsChildren);
  }

  if (resolvedChildren.length === 0) {
    resolvedChildren.push(instance.value.as(() => instance.getSegmentText(segment)));
  }

  return $(
    as,
    {
      ref: internalRef,
      role: "spinbutton",
      tabIndex: instance.isDisabled.as((d) => (d ? -1 : 0)),
      ariaDisabled: instance.isDisabled.as((d) => (d ? "true" : undefined)),
      ariaReadonly: instance.isReadOnly.as((ro) => (ro ? "true" : undefined)),
      ariaValuemin,
      ariaValuemax,
      ariaValuenow: instance.value.as(() => {
        const v = instance.getSegmentValue(segment);
        return typeof v === "number" ? v : undefined;
      }),
      ariaValuetext: instance.value.as(() => instance.getSegmentText(segment)),
      ariaLabel: instance.translations[segment],
      dataType: segment,
      dataPlaceholder: instance.value.as((v) =>
        v?.[segment === "dayPeriod" ? "hour" : segment] === undefined ? "" : undefined,
      ),
      contenteditable: instance.isReadOnly.as((ro) => (!ro ? "true" : undefined)),
      inputmode: segment === "dayPeriod" ? "text" : "numeric",
      spellcheck: false,
      autocapitalize: "off",
      autocorrect: "off",
      style: mergeStyleProps(baseStyle, userStyle),
      ...instance.formControl.dataset,
      dataComponent,
      dataPart: DATA_PART_SEGMENT,
      onkeydown: handleKeyDown,
      onbeforeinput: handleBeforeInput,
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}
