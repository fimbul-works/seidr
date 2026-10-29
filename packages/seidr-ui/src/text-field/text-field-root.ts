import {
  $,
  type SeidrChild,
  type SeidrElementProps,
  type SeidrElementTagNameMap,
  SeidrError,
} from "@fimbul-works/seidr";
import type { TextFieldRootProps } from "./types.js";

/**
 * TextFieldRoot container element (role="group").
 */
export function TextFieldRoot<T extends keyof SeidrElementTagNameMap = "div">(
  props: TextFieldRootProps<T>,
  children?: SeidrChild | SeidrChild[],
): SeidrElementTagNameMap[T] {
  const { as = "div" as T, instance, dataComponent = "text-field", dataPart = "root", ...rest } = props;

  if (!instance) {
    throw new SeidrError("TextFieldRoot requires an instance coordinator");
  }

  const tf = instance;

  return $(
    as,
    {
      role: "group",
      id: tf.id,
      ref: tf.rootRef,
      ...tf.dataset,
      dataComponent,
      dataPart,
      ...rest,
    } as SeidrElementProps<T>,
    children,
  );
}
