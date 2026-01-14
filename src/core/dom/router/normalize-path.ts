/** Remove traailing slashes from path */
export const normalizePath = (path: string) => path.replace(/\/+$/, "");
