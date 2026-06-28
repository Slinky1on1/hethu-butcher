export function slugifyBusinessName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isValidBusinessSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/.test(slug) || /^[a-z0-9]{2,4}$/.test(slug);
}

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "signup",
  "onboarding",
  "pricing",
  "order",
  "connect",
  "hethu",
  "www",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}
