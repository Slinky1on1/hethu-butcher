import { NextRequest, NextResponse } from "next/server";
import { runAllBusinessHeartbeats } from "@/lib/hub-heartbeat";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  const vercelCron = request.headers.get("x-vercel-cron");

  if (cronSecret) {
    const validBearer = auth === `Bearer ${cronSecret}`;
    const validVercel = vercelCron === "1";
    if (!validBearer && !validVercel) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runAllBusinessHeartbeats();
  return NextResponse.json({ success: true, ...result });
}
