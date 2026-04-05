import { NextResponse } from "next/server";
import { getConnectedPlatforms } from "@/lib/db";

export async function GET() {
  const platforms = getConnectedPlatforms();
  return NextResponse.json({ platforms });
}
