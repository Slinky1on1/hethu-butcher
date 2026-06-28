import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const defaultSlug = process.env.DEFAULT_BUSINESS_SLUG || "hethu";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/order" || pathname.startsWith("/order/")) {
    const rest = pathname === "/order" ? "/order" : pathname.slice("/order".length);
    return NextResponse.redirect(
      new URL(`/b/${defaultSlug}${rest || "/order"}`, request.url)
    );
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const rest = pathname === "/admin" ? "/admin" : pathname.slice("/admin".length);
    return NextResponse.redirect(new URL(`/b/${defaultSlug}/admin${rest}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/order", "/order/:path*", "/admin", "/admin/:path*"],
};
