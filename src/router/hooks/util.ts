import { isClient } from "../../util/environment/client";

interface URLData {
  href: string;
  pathname: string;
  search: string;
  hash: string;
  params: Record<string, string>;
}

export function parseURL(href: string): URLData {
  const url = new URL(href, isClient() ? window.location.origin : "http://fimbul.works/");
  const location: URLData = {
    href: url.href.toString(),
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    params: Object.fromEntries(url.searchParams.entries()),
  };
  return location;
}
