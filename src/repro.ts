import { Seidr } from "./observable/seidr";

// Mock params
const params = new Seidr<Record<string, string> | false>(false);

// The issue: isMatch is inferred as Seidr<true> | Seidr<false> instead of Seidr<boolean>
export const isMatch = params.as((p) => !!p);

// This function expects Seidr<boolean>
function expectSeidrBoolean(s: Seidr<boolean>) {}

// This should error if inference is Seidr<true> | Seidr<false> and Seidr is invariant
expectSeidrBoolean(isMatch);
