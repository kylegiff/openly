import { NextResponse } from "next/server";
import { getXAuthUrl } from "@/lib/platforms/x";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const { url, oauth_token_secret } = await getXAuthUrl();

    // Store the token secret in a cookie for the callback
    const cookieStore = await cookies();
    cookieStore.set("x_oauth_secret", oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/",
    });

    return NextResponse.redirect(url);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start X auth";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
