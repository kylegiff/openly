import { NextRequest, NextResponse } from "next/server";
import { postToX } from "@/lib/platforms/x";
import { postToLinkedIn } from "@/lib/platforms/linkedin";
import { addScheduledPost } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { text, platform, mode, scheduledAt } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    if (!["x", "linkedin"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
    }

    // Schedule for later
    if (mode === "schedule") {
      if (!scheduledAt) {
        return NextResponse.json({ error: "Scheduled time is required." }, { status: 400 });
      }
      addScheduledPost(text.trim(), platform, new Date(scheduledAt).toISOString());
      return NextResponse.json({ success: true, scheduled: true });
    }

    // Post now
    let result;
    if (platform === "x") {
      result = await postToX(text.trim());
    } else {
      result = await postToLinkedIn(text.trim());
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
