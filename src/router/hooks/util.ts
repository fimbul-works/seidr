import { isClient } from "../../util/environment/client";

interface URLData {
  href: string;
  pathname: string;
  search: string;
  hash: string;
  queryParams: Record<string, string>;
  origin: string;
  hostname: string;
  port: string;
  protocol: string;
}

export function parseURL(href: string): URLData {
  const url = new URL(href, isClient() ? window.location.origin : "http://fimbul.works/");
  const location: URLData = {
    href: url.href.toString(),
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    queryParams: Object.fromEntries(url.searchParams.entries()),
    origin: url.origin,
    hostname: url.hostname,
    port: url.port,
    protocol: url.protocol,
  };
  return location;
}
