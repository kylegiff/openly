import { NextRequest, NextResponse } from "next/server";
import { handleLinkedInCallback } from "@/lib/platforms/linkedin";
import { saveAccount } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const error = req.nextUrl.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(new URL(`/settings?error=${error}`, req.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/settings?error=missing_code", req.url));
    }

    const { accessToken, expiresIn } = await handleLinkedInCallback(code);
    await saveAccount("linkedin", { accessToken, expiresIn: String(expiresIn) });

    return NextResponse.redirect(new URL("/settings?connected=linkedin", req.url));
  } catch (err: unknown) {
    console.error("LinkedIn auth callback error:", err);
    return NextResponse.redirect(new URL("/settings?error=auth_failed", req.url));
  }
}
