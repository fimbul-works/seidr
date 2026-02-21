/** Remove trailling slashes from path */
export const normalizePath = (path: string) => path.replace(/\/+$/, "");
