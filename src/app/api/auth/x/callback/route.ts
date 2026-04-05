import { NextRequest, NextResponse } from "next/server";
import { handleXCallback } from "@/lib/platforms/x";
import { saveAccount } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const oauthToken = req.nextUrl.searchParams.get("oauth_token");
    const oauthVerifier = req.nextUrl.searchParams.get("oauth_verifier");

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(new URL("/settings?error=missing_params", req.url));
    }

    const cookieStore = await cookies();
    const oauthTokenSecret = cookieStore.get("x_oauth_secret")?.value;

    if (!oauthTokenSecret) {
      return NextResponse.redirect(new URL("/settings?error=expired_session", req.url));
    }

    const { accessToken, accessSecret, screenName } = await handleXCallback(
      oauthToken,
      oauthVerifier,
      oauthTokenSecret
    );

    await saveAccount("x", { accessToken, accessSecret, screenName });
    cookieStore.delete("x_oauth_secret");

    return NextResponse.redirect(new URL("/settings?connected=x", req.url));
  } catch (err: unknown) {
    console.error("X auth callback error:", err);
    return NextResponse.redirect(new URL("/settings?error=auth_failed", req.url));
  }
}
