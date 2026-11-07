declare module "*.svg" {
  import type { SvgIconFactory } from "@fimbul-works/seidr";
  const icon: SvgIconFactory;
  export default icon;
}

declare module "*.svg?component" {
  import type { SvgIconFactory } from "@fimbul-works/seidr";
  const icon: SvgIconFactory;
  export default icon;
}

