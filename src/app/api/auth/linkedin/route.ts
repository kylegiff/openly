import { NextResponse } from "next/server";
import { getLinkedInAuthUrl } from "@/lib/platforms/linkedin";

export async function GET() {
  const url = getLinkedInAuthUrl();
  return NextResponse.redirect(url);
}
