/** URL helpers for /b/[slug] routes */
export function tenantBase(slug: string) {
  return `/b/${slug}`;
}

export function tenantOrderPath(slug: string) {
  return `/b/${slug}/order`;
}

export function tenantAdminPath(slug: string, subpath = "") {
  const base = `/b/${slug}/admin`;
  if (!subpath) return base;
  return `${base}/${subpath.replace(/^\//, "")}`;
}
