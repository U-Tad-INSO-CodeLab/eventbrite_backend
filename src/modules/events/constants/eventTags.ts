/**
 * Closed set of event tags (creators and sponsor filters must use these values exactly).
 */
export const EVENT_TAG_OPTIONS = [
  "AI",
  "SaaS",
  "Networking",
  "Technology",
  "Startup",
  "Marketing",
  "Finance",
  "Healthcare",
  "Design",
  "Developer",
  "Education",
  "Sustainability",
  "E-commerce",
  "Web3",
  "Leadership",
] as const;

export type EventTagOption = (typeof EVENT_TAG_OPTIONS)[number];

const TAG_SET = new Set<string>(EVENT_TAG_OPTIONS);

export function isAllowedEventTag(tag: string): boolean {
  return TAG_SET.has(tag);
}

export const EVENT_TAGS_MAX = EVENT_TAG_OPTIONS.length;

/** Comma-separated list for error messages / API docs. */
export function eventTagsAllowedDescription(): string {
  return EVENT_TAG_OPTIONS.join(", ");
}
