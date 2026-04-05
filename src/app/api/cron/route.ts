import { NextRequest, NextResponse } from "next/server";
import { getPendingPosts, markPostComplete } from "@/lib/db";
import { postToX } from "@/lib/platforms/x";
import { postToLinkedIn } from "@/lib/platforms/linkedin";

// This endpoint processes scheduled posts that are due.
// Call it via cron, Vercel Cron, or a simple setInterval.
// Protected by a secret token to prevent abuse.

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = getPendingPosts() as Array<{
    id: number;
    text: string;
    platform: string;
  }>;

  const results = [];

  for (const post of pending) {
    try {
      if (post.platform === "x") {
        await postToX(post.text);
      } else if (post.platform === "linkedin") {
        await postToLinkedIn(post.text);
      }
      markPostComplete(post.id);
      results.push({ id: post.id, status: "posted" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      markPostComplete(post.id, message);
      results.push({ id: post.id, status: "failed", error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
