import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { TimeFieldValueDescriptionProps } from "./types.js";

/**
 * Screen-reader value description element announcing the full selected time.
 */
export function TimeFieldValueDescription<T extends keyof SeidrElementTagNameMap = "div">(
  props: TimeFieldValueDescriptionProps<T> = {} as TimeFieldValueDescriptionProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const {
    as = "div" as T,
    instance,
    dataComponent = "time-field",
    id: customId,
    children: propsChildren,
    style: userStyle,
    ...rest
  } = props;

  if (!instance) {
    throw new SeidrError("TimeFieldValueDescription requires an instance coordinator");
  }

  const baseStyle: Record<string, string> = { display: "none" };
  const mergedStyle =
    typeof userStyle === "object" && userStyle !== null
      ? { ...baseStyle, ...userStyle }
      : baseStyle;

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
    resolvedChildren.push(
      instance.formattedValue.as((fv) =>
        fv ? instance.translations.selectedTimeDescription(fv) : "",
      ),
    );
  }

  return $(
    as,
    {
      id: customId ?? instance.formControl.id.as((id) => `${id}-val-desc`),
      style: mergedStyle,
      dataComponent,
      dataPart: "value-description",
      ...rest,
    } as SeidrElementProps<T>,
    resolvedChildren,
  );
}

