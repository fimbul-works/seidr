import { getSetState, type Seidr } from "../../src/core/index.js";
import type { BlogPost } from "./types.js";

export const getSetPosts = getSetState<Seidr<BlogPost[]>>("posts");
export const getSetCurrentPost = getSetState<Seidr<BlogPost>>("currentPost");
