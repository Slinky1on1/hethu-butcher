import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { tenantAdminPath, tenantOrderPath } from "./paths";

export async function requireOwnerContext() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.businessId || !session.businessSlug) {
    redirect("/");
  }
  return {
    businessId: session.businessId,
    slug: session.businessSlug,
  };
}

export function revalidateTenant(slug: string, ...adminSubpaths: string[]) {
  revalidatePath(tenantOrderPath(slug));
  for (const sub of adminSubpaths) {
    revalidatePath(tenantAdminPath(slug, sub));
  }
  revalidatePath(tenantAdminPath(slug));
}
