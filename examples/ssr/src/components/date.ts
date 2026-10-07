import { createComponent } from "@fimbul-works/seidr";
import { $div, $span } from "@fimbul-works/seidr/html";

/**
 * Format a date string to a long date format.
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format a date string to a time ago string.
 */
export const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  const months = Math.floor(diff / 2628000000);
  const years = Math.floor(diff / 31536000000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

/**
 * Page footer component.
 */
export const DateView = createComponent(
  (dateStr: string) =>
    $div({ className: "date" }, [
      $span({ className: "icon icon-clock" }),
      $span({ className: "date-full", title: timeAgo(dateStr) }, formatDate(dateStr)),
    ]),
  "Date",
);
