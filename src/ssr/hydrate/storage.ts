import type { Seidr } from "../../seidr/seidr";
import type { HydrationData } from "./types";

export interface HydrationDataStorage {
  data: HydrationData | undefined;
  registry: Set<Seidr<any>>;
}

export const hydrationDataStorage: HydrationDataStorage = {
  data: undefined,
  registry: new Set<Seidr<any>>(),
};
