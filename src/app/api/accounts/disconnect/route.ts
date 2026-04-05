import { NextRequest, NextResponse } from "next/server";
import { deleteAccount } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { platform } = await req.json();

  if (!["x", "linkedin"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
  }

  await deleteAccount(platform);
  return NextResponse.json({ success: true });
}
